import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ensureWranglerAvailable, preflight } from '../steps/preflight.js';

test('ensureWranglerAvailable installs wrangler when command is missing', async () => {
  const calls: Array<{
    command: string;
    args: string[];
  }> = [];

  let wranglerAttempts = 0;
  const run = async (command: string, args: string[]) => {
    calls.push({ command, args });

    if (command === 'wrangler' && args[0] === '--version') {
      wranglerAttempts += 1;
      if (wranglerAttempts === 1) {
        const error = new Error(
          'spawn wrangler ENOENT',
        ) as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        throw error;
      }
      return {
        exitCode: 0,
        stdout: '4.72.0',
        stderr: '',
      };
    }

    if (command === 'npm') {
      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
      };
    }

    throw new Error(`Unexpected command: ${command} ${args.join(' ')}`);
  };

  await ensureWranglerAvailable({
    run: run as typeof import('../lib/exec.js').runCommand,
    promptInstall: async () => {},
  });

  assert.deepEqual(calls, [
    {
      command: 'wrangler',
      args: ['--version'],
    },
    {
      command: 'npm',
      args: ['install', '-g', 'wrangler'],
    },
    {
      command: 'wrangler',
      args: ['--version'],
    },
  ]);
});

test('ensureWranglerAvailable surfaces user cancellation during install prompt', async () => {
  const run = async (command: string, args: string[]) => {
    if (command === 'wrangler' && args[0] === '--version') {
      const error = new Error('spawn wrangler ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      throw error;
    }

    throw new Error(`Unexpected command: ${command} ${args.join(' ')}`);
  };

  await assert.rejects(
    ensureWranglerAvailable({
      run: run as typeof import('../lib/exec.js').runCommand,
      promptInstall: async () => {
        throw new Error('cancelled');
      },
    }),
    /cancelled/,
  );
});

test('preflight checks git, pnpm, wrangler, and whoami in order', async () => {
  const calls: Array<{
    command: string;
    args: string[];
  }> = [];

  const run = async (command: string, args: string[]) => {
    calls.push({ command, args });
    return {
      exitCode: 0,
      stdout: '',
      stderr: '',
    };
  };

  await preflight({
    run: run as typeof import('../lib/exec.js').runCommand,
  });

  assert.deepEqual(calls, [
    { command: 'git', args: ['--version'] },
    { command: 'pnpm', args: ['--version'] },
    { command: 'wrangler', args: ['--version'] },
    { command: 'wrangler', args: ['whoami'] },
  ]);
});
