import { cancel, isCancel, note, select } from '@clack/prompts';
import { type RunCommandResult, runCommand } from '../lib/exec.js';
import { createUserAbortError } from '../lib/user-abort.js';

type Run = typeof runCommand;

type WranglerInstallChoice = 'install' | 'cancel';

function isCommandMissingError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

async function promptForWranglerInstall(): Promise<void> {
  note(
    [
      'Wrangler CLI is required to create Cloudflare resources and deploy the worker.',
      'If you continue, create-deepcrawl will run: npm install -g wrangler',
    ].join('\n'),
    'Wrangler Required',
  );

  const choice = await select<WranglerInstallChoice>({
    message: 'Wrangler CLI was not found. What do you want to do?',
    options: [
      {
        value: 'install',
        label: 'Install Wrangler globally',
        hint: 'Runs npm install -g wrangler',
      },
      {
        value: 'cancel',
        label: 'Cancel',
      },
    ],
  });

  if (isCancel(choice) || choice === 'cancel') {
    cancel('Aborted by user.');
    throw createUserAbortError();
  }
}

export async function ensureWranglerAvailable({
  run = runCommand,
  promptInstall = promptForWranglerInstall,
}: {
  run?: Run;
  promptInstall?: () => Promise<void>;
} = {}): Promise<RunCommandResult> {
  try {
    return await run('wrangler', ['--version'], { mode: 'inherit' });
  } catch (error) {
    if (!isCommandMissingError(error)) {
      throw error;
    }

    await promptInstall();

    process.stdout.write('[preflight] installing Wrangler globally...\n');
    await run('npm', ['install', '-g', 'wrangler'], {
      mode: 'inherit',
    });
    process.stdout.write('[preflight] Wrangler installation completed.\n');

    return run('wrangler', ['--version'], { mode: 'inherit' });
  }
}

export async function preflight({
  run = runCommand,
}: {
  run?: Run;
} = {}): Promise<void> {
  process.stdout.write('[preflight] checking toolchain...\n');
  await run('git', ['--version'], { mode: 'inherit' });
  await run('pnpm', ['--version'], { mode: 'inherit' });
  await ensureWranglerAvailable({ run });

  const whoami = await run('wrangler', ['whoami'], {
    allowFailure: true,
    mode: 'pipe',
  });
  if (whoami.exitCode !== 0) {
    throw new Error(
      'Cloudflare Wrangler is not logged in. Run "wrangler login" and re-run.',
    );
  }
}
