import { runCommand } from '../lib/exec.js';

export async function installDependencies({ cwd }: { cwd: string }) {
  await runCommand('pnpm', ['install'], { cwd, mode: 'inherit' });
}
