import { runCommand } from '../lib/exec.js';

export async function deployV0Worker({
  cwd,
  configPath,
  env,
}: {
  cwd: string;
  configPath: string;
  env: string;
}) {
  await runCommand(
    'wrangler',
    ['deploy', '--config', configPath, '--env', env, '--minify'],
    { cwd, mode: 'inherit' },
  );
}
