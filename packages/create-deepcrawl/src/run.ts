import { existsSync } from 'node:fs';
import type { CliArgs } from './lib/cli-args.js';
import { resolveTemplateSourceConfig } from './lib/template-source.js';
import { applyV0RemoteMigrations } from './steps/apply-v0-remote-migrations.js';
import { cloneTemplateRepo } from './steps/clone-template.js';
import { deployV0Worker } from './steps/deploy-v0-worker.js';
import { installDependencies } from './steps/install-deps.js';
import { patchV0WranglerConfigForDeployment } from './steps/patch-v0-wrangler.js';
import { preflight } from './steps/preflight.js';
import { prepareTemplateOutput } from './steps/prepare-template-output.js';
import { provisionV0Resources } from './steps/provision-v0-resources.js';
import { setWranglerSecret } from './steps/set-wrangler-secret.js';
import { promptAnswers } from './ui/prompt-answers.js';

export async function run(
  { dryRun = false, targetPath, templateSource, templateBranch }: CliArgs = {
    dryRun: false,
  },
) {
  await preflight();

  const answers = await promptAnswers({
    cwd: process.cwd(),
    targetPath,
  });
  const template = resolveTemplateSourceConfig({
    cwd: process.cwd(),
    templateSource,
    templateBranch,
  });
  const targetDir = answers.targetDirectory;

  if (existsSync(targetDir)) {
    throw new Error(`Target directory already exists: ${targetDir}`);
  }

  process.stdout.write(`[clone] cloning template into ${targetDir}...\n`);
  await cloneTemplateRepo({
    destDir: targetDir,
    template,
  });

  if (template.isOverride) {
    process.stdout.write('[template] preparing template output...\n');
    await prepareTemplateOutput({
      projectDir: targetDir,
    });
  }

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

  process.stdout.write('[db] applying remote D1 migrations...\n');
  await applyV0RemoteMigrations({
    cwd: targetDir,
    configPath: 'apps/workers/v0/wrangler.jsonc',
    env: 'production',
  });

  process.stdout.write('[deploy] deploying v0 worker...\n');
  await deployV0Worker({
    cwd: targetDir,
    configPath: 'apps/workers/v0/wrangler.jsonc',
    env: 'production',
  });

  process.stdout.write('\nDone.\n');
}
