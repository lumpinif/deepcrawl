import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findJsoncObjectRangeForPath, listJsoncObjectKeys } from '../_jsonc';
import { stripWranglerJsoncServices } from '../_wrangler-jsonc-services';

test('stripWranglerJsoncServices removes services at root and env.production', () => {
  const input = `{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "example-worker",
  "main": "src/index.ts",
  "services": [
    {
      "binding": "AUTH_WORKER",
      "service": "example-auth-worker"
    }
  ],
  "vars": {
    "ENABLE_ACTIVITY_LOGS": true
  },
  "env": {
    "production": {
      "services": [
        {
          "binding": "AUTH_WORKER",
          "service": "example-auth-worker-production"
        }
      ],
      "vars": {
        "ENABLE_ACTIVITY_LOGS": true
      }
    }
  }
}
`;

  const result = stripWranglerJsoncServices(input);
  assert.ok(result.didChange);

  const rootRange = findJsoncObjectRangeForPath(result.content, []);
  assert.ok(rootRange);
  const rootKeys = listJsoncObjectKeys(result.content, rootRange);
  assert.ok(!rootKeys.has('services'));
  assert.ok(rootKeys.has('vars'));

  const prodRange = findJsoncObjectRangeForPath(result.content, [
    'env',
    'production',
  ]);
  assert.ok(prodRange);
  const prodKeys = listJsoncObjectKeys(result.content, prodRange);
  assert.ok(!prodKeys.has('services'));
  assert.ok(prodKeys.has('vars'));
});
