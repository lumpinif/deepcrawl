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
const WARNING_DIVIDER = '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!';

const resolveYes = (value: string) =>
  value.trim() ? value.trim().toLowerCase().startsWith('y') : true;

const parseArgs = (args: string[]): Inputs => {
  const inputs: Inputs = {};

  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--secret':
        inputs.secret = value;
        i += 1;
        break;
      case '--sub':
        inputs.sub = value;
        i += 1;
        break;
      case '--email':
        inputs.email = value;
        i += 1;
        break;
      case '--name':
        inputs.name = value;
        i += 1;
        break;
      case '--issuer':
        inputs.issuer = value;
        i += 1;
        break;
      case '--audience':
        inputs.audience = value;
        i += 1;
        break;
      case '--expires-in':
        inputs.expiresInHours = value ? Number(value) : undefined;
        i += 1;
        break;
      case '--write-dev-vars':
        inputs.writeDevVars = true;
        break;
      case '--write-dev-vars-production':
        inputs.writeDevVarsProduction = true;
        break;
      default:
        break;
    }
  }

  return inputs;
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
    const devVarsPath = join(repoRoot, 'apps', 'workers', 'v0', '.dev.vars');
    const prodVarsPath = join(
      repoRoot,
      'apps',
      'workers',
      'v0',
      '.dev.vars.production',
    );

    const updates: Record<string, string> = { JWT_SECRET: secret };
    if (issuer?.trim()) {
      updates.JWT_ISSUER = issuer.trim();
    }
    if (audience?.trim()) {
      updates.JWT_AUDIENCE = audience.trim();
    }

    let writeDev = seed.writeDevVars;
    if (writeDev === undefined) {
      const answer = await rl.question(
        `\n[ENV] Write JWT vars to ${devVarsPath}? (Y/n): `,
      );
      writeDev = resolveYes(answer);
    }

    if (writeDev) {
      upsertEnvFile(devVarsPath, updates);
      process.stdout.write(`Updated ${devVarsPath}\n`);
    }

    let writeProd = seed.writeDevVarsProduction;
    if (writeProd === undefined) {
      const answer = await rl.question(
        `\n[ENV] Write JWT vars to ${prodVarsPath}? (Y/n): `,
      );
      writeProd = resolveYes(answer);
    }

    if (writeProd) {
      upsertEnvFile(prodVarsPath, updates);
      process.stdout.write(`Updated ${prodVarsPath}\n`);
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
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (!match) {
      return line;
    }

    const key = match[1];
    if (!key) {
      return line;
    }

    if (updates[key] !== undefined) {
      seen.add(key);
      return `${key}=${updates[key]}`;
    }

    return line;
  });

  const jwtKeys = ['JWT_SECRET', 'JWT_ISSUER', 'JWT_AUDIENCE'] as const;
  const hasJwtFields = jwtKeys.some((key) => Boolean(updates[key]));

  const hasJwtHeader = lines.some((line) => {
    const trimmed = line.trim().toLowerCase();
    return trimmed === '# jwt';
  });

  if (hasJwtFields && !hasJwtHeader) {
    const firstJwtIndex = updatedLines.findIndex((line) =>
      /^JWT_(SECRET|ISSUER|AUDIENCE)=/.test(line.trim()),
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
    `${WARNING_DIVIDER}\nIMPORTANT: Save the JWT secret and token securely. If either is lost or leaked, rotate the JWT secret and re-mint the token.\n${WARNING_DIVIDER}\n\n`,
  );

  const repoRoot = process.cwd();
  const appEnvPath = join(repoRoot, 'apps', 'app', '.env');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const writeAppEnvAnswer = await rl.question(
    `\n[ENV] Write AUTH_JWT_TOKEN to ${appEnvPath}? (Y/n): `,
  );
  if (resolveYes(writeAppEnvAnswer)) {
    upsertEnvFile(appEnvPath, { AUTH_JWT_TOKEN: token });
    process.stdout.write(`Updated ${appEnvPath}\n`);
  }

  rl.close();

  // Env file updates for worker vars are handled in `promptInputs()`.
};

run().catch((error) => {
  process.stderr.write(`❌ Failed to mint JWT: ${error.message}\n`);
  process.exit(1);
});
