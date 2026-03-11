import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { parseCliArgs } from '../lib/cli-args.js';
import {
  DEFAULT_TEMPLATE_BRANCH,
  DEFAULT_TEMPLATE_REPO,
  resolveTemplateSourceConfig,
} from '../lib/template-source.js';

test('parseCliArgs supports default mode', () => {
  assert.deepEqual(parseCliArgs([]), {
    dryRun: false,
  });
});

test('parseCliArgs ignores standalone pnpm argument separator', () => {
  assert.deepEqual(
    parseCliArgs(['--', '--template-branch', 'feat/create-deepcrawl']),
    {
      dryRun: false,
      templateBranch: 'feat/create-deepcrawl',
    },
  );
});

test('parseCliArgs supports official repo branch override', () => {
  assert.deepEqual(
    parseCliArgs(['--template-branch', 'feat/create-deepcrawl']),
    {
      dryRun: false,
      templateBranch: 'feat/create-deepcrawl',
    },
  );
});

test('parseCliArgs supports template source override', () => {
  assert.deepEqual(
    parseCliArgs([
      '--dry-run',
      '--template-source',
      '/tmp/deepcrawl',
      '--template-branch',
      'feat/create-deepcrawl',
    ]),
    {
      dryRun: true,
      templateSource: '/tmp/deepcrawl',
      templateBranch: 'feat/create-deepcrawl',
    },
  );
});

test('parseCliArgs rejects template-source without template-branch', () => {
  assert.throws(
    () => parseCliArgs(['--template-source', '/tmp/deepcrawl']),
    /--template-source override requires --template-branch/,
  );
});

test('resolveTemplateSourceConfig uses official template defaults', () => {
  assert.deepEqual(
    resolveTemplateSourceConfig({
      cwd: '/tmp',
    }),
    {
      source: DEFAULT_TEMPLATE_REPO,
      branch: DEFAULT_TEMPLATE_BRANCH,
      isOverride: false,
      sourceKind: 'official',
    },
  );
});

test('resolveTemplateSourceConfig uses official repo when only branch is overridden', () => {
  assert.deepEqual(
    resolveTemplateSourceConfig({
      cwd: '/tmp',
      templateBranch: 'feat/create-deepcrawl',
    }),
    {
      source: DEFAULT_TEMPLATE_REPO,
      branch: 'feat/create-deepcrawl',
      isOverride: true,
      sourceKind: 'official',
    },
  );
});

test('resolveTemplateSourceConfig resolves local paths for internal override', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'create-deepcrawl-cli-'));
  const localRepo = join(cwd, 'repo');

  assert.deepEqual(
    resolveTemplateSourceConfig({
      cwd,
      templateSource: localRepo,
      templateBranch: 'feat/create-deepcrawl',
    }),
    {
      source: localRepo,
      branch: 'feat/create-deepcrawl',
      isOverride: true,
      sourceKind: 'local',
    },
  );
});
