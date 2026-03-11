import { type RunCommandOptions, runCommand } from '../lib/exec.js';

type CommandRunner = typeof runCommand;

export async function applyV0RemoteMigrations({
  cwd,
  configPath,
  env,
  run = runCommand,
}: {
  cwd: string;
  configPath: string;
  env: string;
  run?: CommandRunner;
}) {
  const options: RunCommandOptions = {
    cwd,
    mode: 'pipe',
  };

  const result = await run(
    'wrangler',
    [
      'd1',
      'migrations',
      'apply',
      'DB_V0',
      '--remote',
      '--config',
      configPath,
      '--env',
      env,
    ],
    options,
  );

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}
