import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { sign } from 'hono/jwt';

interface Inputs {
  secret?: string;
  sub?: string;
  email?: string;
  name?: string;
  issuer?: string;
  audience?: string;
  expiresInHours?: number;
  writeDevVars?: boolean;
  writeDevVarsProduction?: boolean;
}

const OUTPUT_DIVIDER = '----------------------------------------';
const WARNING_DIVIDER =
  '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!';

const resolveYes = (value: string) =>
  value.trim() ? value.trim().toLowerCase().startsWith('y') : true;

const parseArgs = (args: string[]): Inputs => {
  const inputs: Inputs = {};

  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key) {
      continue;
    }

    // pnpm (and other runners) may pass through a literal "--" delimiter.
    if (key === '--') {
      continue;
    }

    switch (key) {
      case '--secret': {
        const value = args[i + 1];
        if (!value || value.startsWith('--')) {
          throw new Error('Missing value for --secret');
        }
        inputs.secret = value;
        i += 1;
        break;
      }
      case '--sub': {
        const value = args[i + 1];
        if (!value || value.startsWith('--')) {
          throw new Error('Missing value for --sub');
        }
        inputs.sub = value;
        i += 1;
        break;
      }
      case '--email': {
        const value = args[i + 1];
        if (!value || value.startsWith('--')) {
          throw new Error('Missing value for --email');
        }
        inputs.email = value;
        i += 1;
        break;
      }
      case '--name': {
        const value = args[i + 1];
        if (!value || value.startsWith('--')) {
          throw new Error('Missing value for --name');
        }
        inputs.name = value;
        i += 1;
        break;
      }
      case '--issuer': {
        const value = args[i + 1];
        if (!value || value.startsWith('--')) {
          throw new Error('Missing value for --issuer');
        }
        inputs.issuer = value;
        i += 1;
        break;
      }
      case '--audience': {
        const value = args[i + 1];
        if (!value || value.startsWith('--')) {
          throw new Error('Missing value for --audience');
        }
        inputs.audience = value;
        i += 1;
        break;
      }
      case '--expires-in': {
        const value = args[i + 1];
        if (!value || value.startsWith('--')) {
          throw new Error('Missing value for --expires-in');
        }
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
          throw new Error(`Invalid value for --expires-in: ${value}`);
        }
        inputs.expiresInHours = parsed;
        i += 1;
        break;
      }
      case '--write-dev-vars':
        inputs.writeDevVars = true;
        break;
      case '--write-dev-vars-production':
        inputs.writeDevVarsProduction = true;
        break;
      default:
        if (key.startsWith('--')) {
          throw new Error(`Unknown flag: ${key}`);
        }
        break;
    }
  }

  return inputs;
};

const readEnvFileKeys = (filePath: string): Set<string> => {
  if (!existsSync(filePath)) {
    return new Set();
  }

  const content = readFileSync(filePath, 'utf-8');
  const keys = new Set<string>();

  for (const rawLine of content.split(/\r?\n/)) {
    const match = rawLine.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=/);
    const key = match?.[1];
    if (key) {
      keys.add(key);
    }
  }

  return keys;
};

const promptInputs = async (seed: Inputs): Promise<Inputs> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let secret = seed.secret ?? process.env.JWT_SECRET;
  if (!secret) {
    const entered = await rl.question('JWT secret (leave blank to generate): ');

    if (entered.trim()) {
      secret = entered.trim();
    } else {
      const generate = await rl.question(
        `\nGenerate a new JWT secret now? (Y/n): `,
      );

      const confirmed = generate.trim()
        ? generate.trim().toLowerCase().startsWith('y')
        : true;

      if (confirmed) {
        secret = randomBytes(32).toString('hex');
        process.stdout.write(
          `\n${OUTPUT_DIVIDER}\nGenerated JWT secret:\n${secret}\n${OUTPUT_DIVIDER}\n`,
        );
        process.stdout.write(
          `\nSave this value securely (e.g. JWT_SECRET).\n\n`,
        );
      }
    }
  }

  let sub = seed.sub ?? '';
  while (!sub.trim()) {
    sub = await rl.question('Subject (sub, user id): ');
    if (!sub.trim()) {
      process.stdout.write('\nSubject is required.\n');
    }
  }

  const email = seed.email ?? (await rl.question('Email (optional): '));

  const name = seed.name ?? (await rl.question('Name (optional): '));

  const issuer = seed.issuer ?? (await rl.question('Issuer (optional): '));

  const audience =
    seed.audience ?? (await rl.question('Audience (optional): '));

  const expiresInput =
    seed.expiresInHours ??
    (await rl.question('Expires in hours (default 24): '));

  if (secret) {
    const repoRoot = process.cwd();
    const sourceEnvPath = join(repoRoot, 'env', '.env');
    const sourceVarsPath = join(repoRoot, 'env', '.vars');

    const existingEnvKeys = readEnvFileKeys(sourceEnvPath);
    const existingVarsKeys = readEnvFileKeys(sourceVarsPath);

    const envUpdates: Record<string, string> = { JWT_SECRET: secret };

    // If the user deleted AUTH_JWT_TOKEN from env/.env, re-add a placeholder so
    // the file remains discoverable even when the user chooses not to persist
    // the minted token.
    if (!existingEnvKeys.has('AUTH_JWT_TOKEN')) {
      envUpdates.AUTH_JWT_TOKEN = '';
    }

    const varsUpdates: Record<string, string> = {};

    // JWT_ISSUER/JWT_AUDIENCE are non-secret Wrangler vars (typed) and should
    // live in env/.vars, not in worker `.dev.vars`.
    if (issuer?.trim()) {
      const value = issuer.trim();
      varsUpdates.JWT_ISSUER = value;
      varsUpdates.PRODUCTION__JWT_ISSUER = value;
    }
    if (audience?.trim()) {
      const value = audience.trim();
      varsUpdates.JWT_AUDIENCE = value;
      varsUpdates.PRODUCTION__JWT_AUDIENCE = value;
    }

    // Ensure keys exist even if the user leaves issuer/audience blank.
    // This avoids "missing key" surprises when env/.vars is edited manually.
    const varsKeysToEnsure = [
      'JWT_ISSUER',
      'PRODUCTION__JWT_ISSUER',
      'JWT_AUDIENCE',
      'PRODUCTION__JWT_AUDIENCE',
    ] as const;

    for (const key of varsKeysToEnsure) {
      if (!existingVarsKeys.has(key) && varsUpdates[key] === undefined) {
        varsUpdates[key] = '';
      }
    }

    const wantsWrite =
      seed.writeDevVars === true || seed.writeDevVarsProduction === true;

    let writeSources = wantsWrite;
    if (!wantsWrite) {
      const answer = await rl.question(
        `\n[ENV] Write JWT settings to ${sourceEnvPath} and ${sourceVarsPath}? (Y/n): `,
      );
      writeSources = resolveYes(answer);
    }

    if (writeSources) {
      upsertEnvFile(sourceEnvPath, envUpdates);
      process.stdout.write(`Updated ${sourceEnvPath}\n`);

      if (Object.keys(varsUpdates).length > 0) {
        upsertEnvFile(sourceVarsPath, varsUpdates);
        process.stdout.write(`Updated ${sourceVarsPath}\n`);
      }

      process.stdout.write(
        `\n${WARNING_DIVIDER}\n[ENV] IMPORTANT: Run \`pnpm env:bootstrap\` to sync. If you do not run it, these values will NOT be written into each app/worker env file.\n${WARNING_DIVIDER}\n`,
      );

      if (seed.writeDevVarsProduction) {
        process.stdout.write(
          '[ENV] If you need production secrets, use Wrangler secrets (or your existing `.dev.vars.production` flow).\n',
        );
      }
    }
  }

  rl.close();

  const expiresInHours =
    typeof expiresInput === 'number'
      ? expiresInput
      : Number(expiresInput || 24);

  return {
    secret,
    sub,
    email: email?.trim() ? email : undefined,
    name: name?.trim() ? name : undefined,
    issuer: issuer?.trim() ? issuer : undefined,
    audience: audience?.trim() ? audience : undefined,
    expiresInHours: Number.isNaN(expiresInHours) ? 24 : expiresInHours,
  };
};

const upsertEnvFile = (filePath: string, updates: Record<string, string>) => {
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';

  const lines = existing.split(/\r?\n/);
  const seen = new Set<string>();
  const updatedLines = lines.map((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=/);
    if (!match) {
      return line;
    }

    const key = match[1];
    if (!key) {
      return line;
    }

    if (updates[key] !== undefined) {
      if (seen.has(key)) {
        // Keep env files clean if the same key appears multiple times.
        return '';
      }
      seen.add(key);
      return `${key}=${updates[key]}`;
    }

    return line;
  });

  const jwtKeys = ['JWT_SECRET', 'JWT_ISSUER', 'JWT_AUDIENCE'] as const;
  const hasJwtFields = jwtKeys.some((key) => updates[key] !== undefined);

  const hasJwtHeader = lines.some((line) => {
    const trimmed = line.trim().toLowerCase();
    return trimmed === '# jwt';
  });

  if (hasJwtFields && !hasJwtHeader) {
    const firstJwtIndex = updatedLines.findIndex((line) =>
      /^JWT_(SECRET|ISSUER|AUDIENCE)\s*=/.test(line.trim()),
    );

    if (firstJwtIndex >= 0) {
      updatedLines.splice(firstJwtIndex, 0, '# JWT');
    } else {
      updatedLines.push('# JWT');
    }
  }

  const authJwtKey = 'AUTH_JWT_TOKEN';
  const hasAuthJwtField = updates[authJwtKey] !== undefined;
  const hasAuthJwtHeader = lines.some(
    (line) => line.trim().toLowerCase() === '# auth jwt',
  );

  if (hasAuthJwtField && !hasAuthJwtHeader) {
    const firstAuthJwtIndex = updatedLines.findIndex((line) =>
      /^AUTH_JWT_TOKEN=/.test(line.trim()),
    );

    const headerBlock = ['', '# Auth JWT'];

    if (firstAuthJwtIndex >= 0) {
      updatedLines.splice(firstAuthJwtIndex, 0, ...headerBlock);
    } else {
      updatedLines.push(...headerBlock);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || seen.has(key)) {
      continue;
    }

    updatedLines.push(`${key}=${value}`);
  }

  const output = updatedLines.join('\n').replace(/\n{3,}/g, '\n\n');
  writeFileSync(filePath, output.endsWith('\n') ? output : `${output}\n`);
};

const run = async () => {
  const seed = parseArgs(process.argv.slice(2));
  const inputs = await promptInputs(seed);

  if (!inputs.secret) {
    throw new Error('JWT secret is required.');
  }

  if (!inputs.sub) {
    throw new Error('Subject (sub) is required.');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = nowSeconds + (inputs.expiresInHours ?? 24) * 60 * 60;

  const payload = {
    sub: inputs.sub,
    email: inputs.email,
    name: inputs.name,
    iss: inputs.issuer,
    aud: inputs.audience,
    iat: nowSeconds,
    exp,
  };

  const token = await sign(payload, inputs.secret, 'HS256');

  process.stdout.write(
    `\n${OUTPUT_DIVIDER}\nJWT token:\n${token}\n${OUTPUT_DIVIDER}\n`,
  );
  process.stdout.write(
    `\nUse this header in your requests:\nAuthorization: Bearer ${token}\n\n`,
  );
  process.stdout.write(
    `\n${WARNING_DIVIDER}\nIMPORTANT: Save the JWT secret and token securely. If either is lost or leaked, rotate the JWT secret and re-mint the token.\n${WARNING_DIVIDER}\n`,
  );

  const repoRoot = process.cwd();
  const sourceEnvPath = join(repoRoot, 'env', '.env');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const writeAppEnvAnswer = await rl.question(
    `\n[ENV] Write AUTH_JWT_TOKEN to ${sourceEnvPath}? (Y/n): `,
  );
  if (resolveYes(writeAppEnvAnswer)) {
    upsertEnvFile(sourceEnvPath, { AUTH_JWT_TOKEN: token });
    process.stdout.write(`Updated ${sourceEnvPath}\n`);
    process.stdout.write(
      `\n${WARNING_DIVIDER}\n[ENV] IMPORTANT: Run \`pnpm env:bootstrap\` to sync. If you do not run it, these values will NOT be written into each app/worker env file.\n${WARNING_DIVIDER}\n`,
    );
  }

  rl.close();

  // env/.env and env/.vars are the sources of truth. Run `pnpm env:bootstrap`
  // to sync per-app/per-worker files.
};

run().catch((error) => {
  process.stderr.write(`❌ Failed to mint JWT: ${error.message}\n`);
  process.exit(1);
});
