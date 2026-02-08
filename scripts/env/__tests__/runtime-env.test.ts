import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ENV_VARS,
  getEnvVarsForTarget,
  listEnvKeysForTarget,
} from '@deepcrawl/runtime/env';

test('ENV_VARS includes expected entries', () => {
  assert.ok(ENV_VARS.length > 0);

  assert.ok(ENV_VARS.some((v) => v.key === 'NEXT_PUBLIC_APP_URL'));
  assert.ok(ENV_VARS.some((v) => v.key === 'NEXT_PUBLIC_BRAND_NAME'));

  // JWT_SECRET is worker-only but should exist in the manifest.
  assert.ok(ENV_VARS.some((v) => v.key === 'JWT_SECRET'));
});

test('getEnvVarsForTarget returns only entries that include the given target', () => {
  const target = 'dashboard' as const;
  const vars = getEnvVarsForTarget(target);

  assert.ok(vars.length > 0);
  assert.ok(vars.every((v) => v.targets.includes(target)));
  assert.ok(vars.some((v) => v.key === 'NEXT_PUBLIC_APP_URL'));
});

test('listEnvKeysForTarget matches getEnvVarsForTarget keys', () => {
  const target = 'worker-v0' as const;
  const vars = getEnvVarsForTarget(target);

  assert.deepEqual(
    listEnvKeysForTarget(target),
    vars.map((v) => v.key),
  );
});

test('unknown target returns empty array', () => {
  const unknownTarget = 'unknown-target' as unknown as Parameters<
    typeof getEnvVarsForTarget
  >[0];

  assert.deepEqual(getEnvVarsForTarget(unknownTarget), []);
  assert.deepEqual(listEnvKeysForTarget(unknownTarget), []);
});
