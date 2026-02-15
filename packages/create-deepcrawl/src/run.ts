import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { runCommand } from './lib/exec.js';
import { generateJwtSecret } from './lib/jwt.js';
import { cloneTemplateRepo } from './steps/clone-template.js';
import { deployV0Worker } from './steps/deploy-v0-worker.js';
import { installDependencies } from './steps/install-deps.js';
import { patchV0WranglerConfigForDeployment } from './steps/patch-v0-wrangler.js';
import {
  getV0ResourceNamesForProject,
  provisionV0Resources,
} from './steps/provision-v0-resources.js';
import { setWranglerSecret } from './steps/set-wrangler-secret.js';

type AuthMode = 'none' | 'jwt';

type Answers = {
  projectName: string;
  projectPath: string;
  authMode: AuthMode;
  jwtSecret?: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  enableActivityLogs: boolean;
};

function normalizeProjectName(raw: string): string {
  const trimmed = raw.trim();
  const kebab = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return kebab || trimmed;
}

async function promptAnswers(): Promise<Answers> {
  const rl = createInterface({ input, output });
  try {
    const rawName = await rl.question('Project name: ');
    const projectName = normalizeProjectName(rawName);
    if (!projectName) {
      throw new Error('Project name is required.');
    }

    const rawPath = await rl.question('Project path (default: .): ');
    const projectPath = rawPath.trim() || '.';

    const rawAuth = await rl.question('Authentication mode (jwt/none): ');
    const authMode = rawAuth.trim().toLowerCase();
    if (authMode !== 'none' && authMode !== 'jwt') {
      throw new Error('Auth mode must be "none" or "jwt".');
    }

    let jwtSecret: string | undefined;
    let jwtIssuer: string | undefined;
    let jwtAudience: string | undefined;

    if (authMode === 'jwt') {
      const rawSecret = await rl.question(
        'JWT secret (leave blank to generate): ',
      );
      jwtSecret = rawSecret.trim() || generateJwtSecret();

      jwtIssuer = (await rl.question('JWT issuer (optional): ')).trim();
      jwtAudience = (await rl.question('JWT audience (optional): ')).trim();
    }

    const rawLogs = await rl.question('Enable activity logs? (Y/n): ');
    const enableActivityLogs = rawLogs.trim().toLowerCase() !== 'n';

    const targetDir = isAbsolute(projectPath)
      ? resolve(projectPath, projectName)
      : resolve(process.cwd(), projectPath, projectName);

    process.stdout.write('\nSummary:\n');
    process.stdout.write(`- Project: ${projectName}\n`);
    process.stdout.write(`- Path: ${targetDir}\n`);
    process.stdout.write(`- Deploy: Cloudflare Workers (API)\n`);
    process.stdout.write(`- Auth mode: ${authMode}\n`);
    process.stdout.write(
      `- Activity logs: ${enableActivityLogs ? 'enabled' : 'disabled'}\n`,
    );
    const names = getV0ResourceNamesForProject(projectName);
    process.stdout.write('- Resources (derived from project name):\n');
    process.stdout.write(`  - D1: ${names.d1Name}\n`);
    process.stdout.write(`  - KV (links): ${names.linksTitle}\n`);
    process.stdout.write(`  - KV (read): ${names.readTitle}\n`);

    const proceedRaw = await rl.question('\nProceed? (y/N): ');
    const proceed = proceedRaw.trim().toLowerCase() === 'y';
    if (!proceed) {
      throw new Error('Aborted by user.');
    }

    return {
      projectName,
      projectPath,
      authMode,
      jwtSecret,
      jwtIssuer,
      jwtAudience,
      enableActivityLogs,
    };
  } finally {
    rl.close();
  }
}

async function preflight() {
  process.stdout.write('[preflight] checking toolchain...\n');
  await runCommand('git', ['--version'], { mode: 'inherit' });
  await runCommand('pnpm', ['--version'], { mode: 'inherit' });
  await runCommand('wrangler', ['--version'], { mode: 'inherit' });

  const whoami = await runCommand('wrangler', ['whoami'], {
    allowFailure: true,
    mode: 'pipe',
  });
  if (whoami.exitCode !== 0) {
    throw new Error(
      'Cloudflare Wrangler is not logged in. Run "wrangler login" and re-run.',
    );
  }
}

export async function run({ dryRun = false }: { dryRun?: boolean } = {}) {
  await preflight();

  const answers = await promptAnswers();
  const targetDir = isAbsolute(answers.projectPath)
    ? resolve(answers.projectPath, answers.projectName)
    : resolve(process.cwd(), answers.projectPath, answers.projectName);

  if (existsSync(targetDir)) {
    throw new Error(`Target directory already exists: ${targetDir}`);
  }

  process.stdout.write(`[clone] cloning template into ${targetDir}...\n`);
  await cloneTemplateRepo({
    destDir: targetDir,
  });

  if (dryRun) {
    process.stdout.write(
      '[dry-run] clone completed. Skipping provisioning/deploy.\n',
    );
    return;
  }

  process.stdout.write('[deps] installing dependencies...\n');
  await installDependencies({ cwd: targetDir });

  process.stdout.write(
    '[patch] preparing wrangler config for v0-only deploy...\n',
  );
  await patchV0WranglerConfigForDeployment({
    projectDir: targetDir,
    projectName: answers.projectName,
    authMode: answers.authMode,
    enableActivityLogs: answers.enableActivityLogs,
    jwtIssuer: answers.jwtIssuer,
    jwtAudience: answers.jwtAudience,
  });

  process.stdout.write('[cloudflare] provisioning required resources...\n');
  const resources = await provisionV0Resources({
    projectDir: targetDir,
    projectName: answers.projectName,
  });

  process.stdout.write(
    '[patch] wiring Cloudflare resource IDs into wrangler config...\n',
  );
  await patchV0WranglerConfigForDeployment({
    projectDir: targetDir,
    projectName: answers.projectName,
    authMode: answers.authMode,
    enableActivityLogs: answers.enableActivityLogs,
    jwtIssuer: answers.jwtIssuer,
    jwtAudience: answers.jwtAudience,
    resources,
  });

  if (answers.authMode === 'jwt') {
    const secret = answers.jwtSecret;
    if (!secret) {
      throw new Error('JWT secret is missing.');
    }
    process.stdout.write('[cloudflare] setting JWT_SECRET...\n');
    await setWranglerSecret({
      cwd: targetDir,
      configPath: 'apps/workers/v0/wrangler.jsonc',
      env: 'production',
      key: 'JWT_SECRET',
      value: secret,
    });
  }

  process.stdout.write('[deploy] deploying v0 worker...\n');
  await deployV0Worker({
    cwd: targetDir,
    configPath: 'apps/workers/v0/wrangler.jsonc',
    env: 'production',
  });

  process.stdout.write('\nDone.\n');
}
