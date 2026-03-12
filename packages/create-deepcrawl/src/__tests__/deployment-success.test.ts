import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDeploymentSuccessCard } from '../ui/deployment-success.js';

test('buildDeploymentSuccessCard includes docs link, secret files, and JWT guidance', () => {
  const card = buildDeploymentSuccessCard({
    projectDir: '/tmp/bettercrawl',
    workerName: 'bettercrawl-api-worker-production',
    workerUrl:
      'https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev',
    versionId: '392c17ca-d5ea-4740-9e12-b1ca6c2b345d',
    authMode: 'jwt',
    enableActivityLogs: true,
    jwtIssuer: 'deepcrawl',
    jwtAudience: 'agents',
    jwtSecret: 'generated-secret',
    jwtSecretWasGenerated: true,
    localJwtSecretFiles: {
      devVarsPath: '/tmp/bettercrawl/apps/workers/v0/.dev.vars',
      productionDevVarsPath:
        '/tmp/bettercrawl/apps/workers/v0/.dev.vars.production',
    },
  });

  assert.match(card, /🌐 API/);
  assert.match(card, /bettercrawl-api-worker-production/);
  assert.match(card, /📘 Docs/);
  assert.match(
    card,
    /https:\/\/deepcrawl\.dev\/docs\/reference\/self-hosting\//,
  );
  assert.match(card, /create-deepcrawl/);
  assert.match(card, /deepcrawl/);
  assert.match(card, /curl -H "Authorization: Bearer <your-jwt>"/);
  assert.match(card, /workers\.dev/);
  assert.match(card, /read\?url=https:\/\/example\.com/);
  assert.match(card, /issuer must match/);
  assert.match(card, /audience must match/);
  assert.match(card, /⚠ Shown once\. Save it now\./);
  assert.match(card, /generated-secret/);
  assert.match(card, /\/tmp\/bettercrawl\/apps\/workers\/v0\/\.dev\.vars/);
  assert.match(card, /✅ Created for you/);
  assert.match(card, /Deployment ID \(advanced\)/);
});

test('buildDeploymentSuccessCard does not echo a user-provided secret', () => {
  const card = buildDeploymentSuccessCard({
    projectDir: '/tmp/bettercrawl',
    workerUrl:
      'https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev',
    authMode: 'jwt',
    enableActivityLogs: false,
    jwtSecret: 'user-provided-secret',
    jwtSecretWasGenerated: false,
    localJwtSecretFiles: {
      devVarsPath: '/tmp/bettercrawl/apps/workers/v0/.dev.vars',
      productionDevVarsPath:
        '/tmp/bettercrawl/apps/workers/v0/.dev.vars.production',
    },
  });

  assert.doesNotMatch(card, /user-provided-secret/);
  assert.match(card, /Your JWT secret is saved in both files\./);
});

test('buildDeploymentSuccessCard keeps preview mode separate from real deployment claims', () => {
  const card = buildDeploymentSuccessCard({
    projectDir: '/tmp/bettercrawl',
    workerName: 'bettercrawl-api-worker-preview',
    workerUrl: 'https://bettercrawl-api-worker-preview.example.workers.dev',
    authMode: 'none',
    enableActivityLogs: false,
    previewMode: true,
  });

  assert.match(card, /PREVIEW ONLY/);
  assert.match(card, /No Cloudflare resources were created/);
  assert.match(card, /🧰 Prepared locally/);
  assert.match(card, /Preview worker name/);
  assert.match(card, /Preview URL/);
  assert.match(card, /Not run in preview/);
  assert.match(card, /No auth would be required for a real deploy/);
  assert.doesNotMatch(card, /✅ Created for you/);
  assert.doesNotMatch(card, /Worker ready/);
  assert.doesNotMatch(card, /1 D1 database and 2 KV namespaces/);
  assert.doesNotMatch(card, /Remote D1 migrations applied/);
});
