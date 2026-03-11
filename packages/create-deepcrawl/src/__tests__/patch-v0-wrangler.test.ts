import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { parse } from 'jsonc-parser';
import { patchV0WranglerConfigForDeployment } from '../steps/patch-v0-wrangler.js';

async function createProjectFixture(): Promise<string> {
  const projectDir = await mkdtemp(join(tmpdir(), 'patch-v0-wrangler-'));
  const targetPath = join(
    projectDir,
    'apps',
    'workers',
    'v0',
    'wrangler.jsonc',
  );
  const sourcePath = new URL(
    '../../../../apps/workers/v0/wrangler.jsonc',
    import.meta.url,
  );

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await readFile(sourcePath, 'utf8'), 'utf8');

  return projectDir;
}

test('patchV0WranglerConfigForDeployment rebuilds production vars from allowlist', async () => {
  const projectDir = await createProjectFixture();

  await patchV0WranglerConfigForDeployment({
    projectDir,
    projectName: 'my-deepcrawl',
    authMode: 'jwt',
    enableActivityLogs: true,
    jwtIssuer: 'issuer-1',
    jwtAudience: 'audience-1',
  });

  const next = await readFile(
    join(projectDir, 'apps', 'workers', 'v0', 'wrangler.jsonc'),
    'utf8',
  );
  const data = parse(next) as {
    env?: {
      production?: {
        vars?: Record<string, string | boolean>;
      };
    };
  };

  assert.deepEqual(data.env?.production?.vars, {
    AUTH_MODE: 'jwt',
    ENABLE_ACTIVITY_LOGS: true,
    WORKER_NODE_ENV: 'production',
    JWT_ISSUER: 'issuer-1',
    JWT_AUDIENCE: 'audience-1',
    ENABLE_API_RATE_LIMIT: false,
  });
});

test('patchV0WranglerConfigForDeployment keeps optional jwt vars discoverable when auth is none', async () => {
  const projectDir = await createProjectFixture();

  await patchV0WranglerConfigForDeployment({
    projectDir,
    projectName: 'my-deepcrawl',
    authMode: 'none',
    enableActivityLogs: false,
  });

  const next = await readFile(
    join(projectDir, 'apps', 'workers', 'v0', 'wrangler.jsonc'),
    'utf8',
  );
  const data = parse(next) as {
    env?: {
      production?: {
        vars?: Record<string, string | boolean>;
      };
    };
  };

  assert.deepEqual(data.env?.production?.vars, {
    AUTH_MODE: 'none',
    ENABLE_ACTIVITY_LOGS: false,
    WORKER_NODE_ENV: 'production',
    JWT_ISSUER: '',
    JWT_AUDIENCE: '',
    ENABLE_API_RATE_LIMIT: false,
  });
});
