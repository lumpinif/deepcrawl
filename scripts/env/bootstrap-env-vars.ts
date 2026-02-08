import { spawnSync } from 'node:child_process';

function run(args: string[]): void {
  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
  });

  if (result.status === 0) {
    return;
  }

  process.exit(result.status ?? 1);
}

run(['exec', 'tsx', 'scripts/env/sync-local-env.ts']);
run(['exec', 'tsx', 'scripts/env/sync-to-vars.ts']);
