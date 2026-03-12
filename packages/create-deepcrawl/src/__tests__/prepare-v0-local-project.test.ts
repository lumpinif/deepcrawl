import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { parse } from 'jsonc-parser';
import { prepareV0LocalProject } from '../steps/prepare-v0-local-project.js';

async function createProjectFixture(): Promise<string> {
  const projectDir = await mkdtemp(join(tmpdir(), 'prepare-v0-local-project-'));
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

test('prepareV0LocalProject aligns local wrangler config and JWT secret files', async () => {
  const projectDir = await createProjectFixture();

  const result = await prepareV0LocalProject({
    projectDir,
    projectName: 'My Deepcrawl',
    authMode: 'jwt',
    enableActivityLogs: false,
    jwtIssuer: 'issuer-1',
    jwtAudience: 'audience-1',
    jwtSecret: 'generated-secret',
  });

  const next = await readFile(
    join(projectDir, 'apps', 'workers', 'v0', 'wrangler.jsonc'),
    'utf8',
  );
  const data = parse(next) as {
    name?: string;
    routes?: unknown;
    services?: unknown;
    vars?: Record<string, string | boolean>;
    env?: {
      production?: {
        vars?: Record<string, string | boolean>;
        services?: unknown;
      };
    };
  };

  assert.equal(data.name, 'my-deepcrawl-api-worker');
  assert.equal(data.routes, undefined);
  assert.equal(data.services, undefined);
  assert.equal(data.env?.production?.services, undefined);
  assert.deepEqual(data.vars, {
    AUTH_MODE: 'jwt',
    ENABLE_ACTIVITY_LOGS: false,
    API_URL: 'http://localhost:8080',
    WORKER_NODE_ENV: 'development',
    JWT_ISSUER: 'issuer-1',
    JWT_AUDIENCE: 'audience-1',
    ENABLE_API_RATE_LIMIT: false,
  });
  assert.deepEqual(data.env?.production?.vars, {
    AUTH_MODE: 'jwt',
    ENABLE_ACTIVITY_LOGS: false,
    WORKER_NODE_ENV: 'production',
    JWT_ISSUER: 'issuer-1',
    JWT_AUDIENCE: 'audience-1',
    ENABLE_API_RATE_LIMIT: false,
  });

  assert.ok(result.localJwtSecretFiles);
  assert.match(
    await readFile(result.localJwtSecretFiles.devVarsPath, 'utf8'),
    /JWT_SECRET=generated-secret/,
  );
  assert.match(
    await readFile(result.localJwtSecretFiles.productionDevVarsPath, 'utf8'),
    /JWT_SECRET=generated-secret/,
  );
});

test('prepareV0LocalProject keeps no-auth local config aligned without secret files', async () => {
  const projectDir = await createProjectFixture();

  const result = await prepareV0LocalProject({
    projectDir,
    projectName: 'My Deepcrawl',
    authMode: 'none',
    enableActivityLogs: true,
  });

  const next = await readFile(
    join(projectDir, 'apps', 'workers', 'v0', 'wrangler.jsonc'),
    'utf8',
  );
  const data = parse(next) as {
    vars?: Record<string, string | boolean>;
    env?: {
      production?: {
        vars?: Record<string, string | boolean>;
      };
    };
  };

  assert.equal(result.localJwtSecretFiles, undefined);
  assert.deepEqual(data.vars, {
    AUTH_MODE: 'none',
    ENABLE_ACTIVITY_LOGS: true,
    API_URL: 'http://localhost:8080',
    WORKER_NODE_ENV: 'development',
    JWT_ISSUER: '',
    JWT_AUDIENCE: '',
    ENABLE_API_RATE_LIMIT: false,
  });
  assert.deepEqual(data.env?.production?.vars, {
    AUTH_MODE: 'none',
    ENABLE_ACTIVITY_LOGS: true,
    WORKER_NODE_ENV: 'production',
    JWT_ISSUER: '',
    JWT_AUDIENCE: '',
    ENABLE_API_RATE_LIMIT: false,
  });
});

test('prepareV0LocalProject rejects jwt mode without a secret', async () => {
  const projectDir = await createProjectFixture();

  await assert.rejects(
    prepareV0LocalProject({
      projectDir,
      projectName: 'My Deepcrawl',
      authMode: 'jwt',
      enableActivityLogs: false,
    }),
    /JWT secret is missing/,
  );
});
