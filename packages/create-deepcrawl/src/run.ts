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
import { prepareV0LocalProject } from './steps/prepare-v0-local-project.js';
import { provisionV0Resources } from './steps/provision-v0-resources.js';
import {
  buildQuickTestPreviewResult,
  runQuickTestV0Worker,
} from './steps/quick-test-v0-worker.js';
import { setWranglerSecret } from './steps/set-wrangler-secret.js';
import type { V0LocalJwtSecretFiles } from './steps/write-v0-local-jwt-secret.js';
import { buildDeploymentSuccessCard } from './ui/deployment-success.js';
import { promptAnswers } from './ui/prompt-answers.js';
import {
  buildQuickTestFailureCard,
  buildQuickTestSuccessCard,
  promptQuickTestInput,
  promptTryYourApiNow,
  promptTryYourApiNowWithMode,
} from './ui/quick-test.js';
import { renderCliCard } from './ui/render-card.js';

function buildDryRunWorkerName(projectName: string): string {
  return `${projectName}-api-worker-preview`;
}

function buildDryRunWorkerUrl(projectName: string): string {
  return `https://${buildDryRunWorkerName(projectName)}.example.workers.dev`;
}

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

  let localJwtSecretFiles: V0LocalJwtSecretFiles | undefined;

  // Prepare local worker files before any Cloudflare mutations so a local
  // write failure never leaves the deploy half-completed remotely.
  process.stdout.write(
    '[local] preparing worker config for selected auth mode...\n',
  );
  ({ localJwtSecretFiles } = await prepareV0LocalProject({
    projectDir: targetDir,
    projectName: answers.projectName,
    authMode: answers.authMode,
    enableActivityLogs: answers.enableActivityLogs,
    jwtIssuer: answers.jwtIssuer,
    jwtAudience: answers.jwtAudience,
    jwtSecret: answers.jwtSecret,
  }));

  if (localJwtSecretFiles) {
    process.stdout.write('[local] saved JWT secret to worker env files...\n');
  }

  if (dryRun) {
    process.stdout.write(
      '[dry-run] clone completed. Skipping real Cloudflare provisioning and deploy.\n',
    );

    const previewWorkerUrl = buildDryRunWorkerUrl(answers.projectName);

    process.stdout.write(
      `${renderCliCard(
        'Preview only',
        buildDeploymentSuccessCard({
          projectDir: targetDir,
          workerName: buildDryRunWorkerName(answers.projectName),
          workerUrl: previewWorkerUrl,
          authMode: answers.authMode,
          enableActivityLogs: answers.enableActivityLogs,
          jwtIssuer: answers.jwtIssuer,
          jwtAudience: answers.jwtAudience,
          jwtSecret: answers.jwtSecret,
          jwtSecretWasGenerated: answers.jwtSecretWasGenerated,
          localJwtSecretFiles,
          previewMode: true,
        }),
      )}\n`,
    );

    const shouldRunQuickTestPreview = await promptTryYourApiNowWithMode(true);
    if (!shouldRunQuickTestPreview) {
      return;
    }

    const quickTestInput = await promptQuickTestInput(true);
    if (!quickTestInput) {
      return;
    }

    const quickTestPreview = buildQuickTestPreviewResult({
      workerUrl: previewWorkerUrl,
      kind: quickTestInput.kind,
      targetUrl: quickTestInput.targetUrl,
      authMode: answers.authMode,
      jwtSecret: answers.jwtSecret,
      jwtIssuer: answers.jwtIssuer,
      jwtAudience: answers.jwtAudience,
    });

    process.stdout.write(
      `${renderCliCard(
        'Preview result',
        buildQuickTestSuccessCard(quickTestPreview, true),
      )}\n`,
    );
    return;
  }

  process.stdout.write('[deps] installing dependencies...\n');
  await installDependencies({ cwd: targetDir });

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
  let deployment: Awaited<ReturnType<typeof deployV0Worker>>;

  try {
    deployment = await deployV0Worker({
      cwd: targetDir,
      configPath: 'apps/workers/v0/wrangler.jsonc',
      env: 'production',
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Could not parse wrangler deploy output')
    ) {
      throw new Error(
        'Worker deployment finished, but create-deepcrawl could not parse Wrangler output. The worker may still have been deployed. Check the streamed deploy logs above for details.',
        {
          cause: error,
        },
      );
    }

    throw error;
  }

  process.stdout.write(
    `${renderCliCard(
      "You're live",
      buildDeploymentSuccessCard({
        projectDir: targetDir,
        workerName: deployment.workerName,
        workerUrl: deployment.workerUrl,
        versionId: deployment.versionId,
        authMode: answers.authMode,
        enableActivityLogs: answers.enableActivityLogs,
        jwtIssuer: answers.jwtIssuer,
        jwtAudience: answers.jwtAudience,
        jwtSecret: answers.jwtSecret,
        jwtSecretWasGenerated: answers.jwtSecretWasGenerated,
        localJwtSecretFiles,
      }),
    )}\n`,
  );

  const shouldRunQuickTest = await promptTryYourApiNow();
  if (!shouldRunQuickTest) {
    return;
  }

  const quickTestInput = await promptQuickTestInput();
  if (!quickTestInput) {
    return;
  }

  const quickTestResult = await runQuickTestV0Worker({
    workerUrl: deployment.workerUrl,
    kind: quickTestInput.kind,
    targetUrl: quickTestInput.targetUrl,
    authMode: answers.authMode,
    jwtSecret: answers.jwtSecret,
    jwtIssuer: answers.jwtIssuer,
    jwtAudience: answers.jwtAudience,
  });

  process.stdout.write(
    `${renderCliCard(
      quickTestResult.ok ? 'Quick test result' : 'Quick test failed',
      quickTestResult.ok
        ? buildQuickTestSuccessCard(quickTestResult)
        : buildQuickTestFailureCard(quickTestResult),
    )}\n`,
  );
}
