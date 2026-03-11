import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyV0RemoteMigrations } from '../steps/apply-v0-remote-migrations.js';

test('applyV0RemoteMigrations executes wrangler remote migration command', async () => {
  const calls: Array<{
    command: string;
    args: string[];
    options: { cwd?: string; mode?: 'pipe' | 'inherit' } | undefined;
  }> = [];

  await applyV0RemoteMigrations({
    cwd: '/tmp/project',
    configPath: 'apps/workers/v0/wrangler.jsonc',
    env: 'production',
    run: async (command, args, options) => {
      calls.push({ command, args, options });
      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
      };
    },
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    command: 'wrangler',
    args: [
      'd1',
      'migrations',
      'apply',
      'DB_V0',
      '--remote',
      '--config',
      'apps/workers/v0/wrangler.jsonc',
      '--env',
      'production',
    ],
    options: {
      cwd: '/tmp/project',
      mode: 'pipe',
    },
  });
});
