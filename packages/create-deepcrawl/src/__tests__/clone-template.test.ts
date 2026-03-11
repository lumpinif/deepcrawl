import assert from 'node:assert/strict';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { cloneTemplateRepo } from '../steps/clone-template.js';

test('cloneTemplateRepo omits --depth for local template sources', async () => {
  const repoDir = await mkdtemp(
    join(tmpdir(), 'create-deepcrawl-local-template-'),
  );
  await mkdir(join(repoDir, '.git'));

  const calls: Array<{
    command: string;
    args: string[];
    options: { mode?: 'pipe' | 'inherit' } | undefined;
  }> = [];

  await cloneTemplateRepo({
    destDir: '/tmp/example-project',
    template: {
      source: repoDir,
      branch: 'feat/example',
      isOverride: true,
      sourceKind: 'local',
    },
    run: async (command, args, options) => {
      calls.push({ command, args, options });

      if (args[0] === '-C') {
        return {
          exitCode: 0,
          stdout: 'true\n',
          stderr: '',
        };
      }

      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
      };
    },
  });

  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], {
    command: 'git',
    args: [
      'clone',
      '--branch',
      'feat/example',
      repoDir,
      '/tmp/example-project',
    ],
    options: {
      mode: 'inherit',
    },
  });
});

test('cloneTemplateRepo keeps --depth for remote template sources', async () => {
  const calls: Array<{
    command: string;
    args: string[];
    options: { mode?: 'pipe' | 'inherit' } | undefined;
  }> = [];

  await cloneTemplateRepo({
    destDir: '/tmp/example-project',
    template: {
      source: 'https://github.com/example/deepcrawl.git',
      branch: 'template/main',
      isOverride: false,
      sourceKind: 'official',
    },
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
    command: 'git',
    args: [
      'clone',
      '--depth',
      '1',
      '--branch',
      'template/main',
      'https://github.com/example/deepcrawl.git',
      '/tmp/example-project',
    ],
    options: {
      mode: 'inherit',
    },
  });
});
