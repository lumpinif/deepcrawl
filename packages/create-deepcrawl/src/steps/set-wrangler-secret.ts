import { runCommand } from '../lib/exec.js';

export async function setWranglerSecret({
  cwd,
  configPath,
  env,
  key,
  value,
}: {
  cwd: string;
  configPath: string;
  env: string;
  key: string;
  value: string;
}) {
  // Wrangler reads the secret value from stdin.
  await runCommand(
    'wrangler',
    ['secret', 'put', key, '--config', configPath, '--env', env],
    { cwd, stdin: `${value}\n`, mode: 'pipe' },
  );
}
