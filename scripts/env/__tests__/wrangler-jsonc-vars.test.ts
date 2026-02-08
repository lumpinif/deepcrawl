import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findJsoncObjectRangeForPath, listJsoncObjectKeys } from '../_jsonc';
import { syncWranglerJsoncVars } from '../_wrangler-jsonc-vars';

test('syncWranglerJsoncVars creates vars objects when missing', () => {
  const input = `/**
 * Wrangler JSONC can include comments. The sync must preserve parseability.
 */
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "example-worker",
  "main": "src/index.ts"
}
`;

  const result = syncWranglerJsoncVars({
    source: input,
    rootEntries: [{ key: 'ENABLE_ACTIVITY_LOGS', value: true }],
    productionEntries: [{ key: 'ENABLE_ACTIVITY_LOGS', value: true }],
  });

  assert.ok(result);
  const { content } = result;

  const rootVarsRange = findJsoncObjectRangeForPath(content, ['vars']);
  assert.ok(rootVarsRange);
  assert.ok(
    listJsoncObjectKeys(content, rootVarsRange).has('ENABLE_ACTIVITY_LOGS'),
  );

  const prodVarsRange = findJsoncObjectRangeForPath(content, [
    'env',
    'production',
    'vars',
  ]);
  assert.ok(prodVarsRange);
  assert.ok(
    listJsoncObjectKeys(content, prodVarsRange).has('ENABLE_ACTIVITY_LOGS'),
  );
});

test('syncWranglerJsoncVars creates vars objects in a nested wrangler file', () => {
  const input = `/**
 * For more details on how to configure Wrangler, refer to:
 * https://developers.cloudflare.com/workers/wrangler/configuration/
 */
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "example-worker",
  "main": "src/index.ts",
  "observability": {
    "enabled": true
  },
  "kv_namespaces": [
    {
      "binding": "EXAMPLE_KV",
      "id": "deadbeef"
    }
  ],
  "env": {
    "production": {
      "kv_namespaces": [
        {
          "binding": "EXAMPLE_KV",
          "id": "deadbeef"
        }
      ]
    }
  }
}
`;

  const result = syncWranglerJsoncVars({
    source: input,
    rootEntries: [{ key: 'ENABLE_ACTIVITY_LOGS', value: true }],
    productionEntries: [{ key: 'ENABLE_ACTIVITY_LOGS', value: true }],
  });

  assert.ok(result);
  const { content } = result;

  // Root "vars" should be inserted above root KV bindings (not at the very top
  // of the file).
  const schemaIdx = content.indexOf('\n  "$schema":');
  const rootVarsIdx = content.indexOf('\n  "vars": {');
  const rootKvIdx = content.indexOf('\n  "kv_namespaces": [');

  assert.ok(schemaIdx !== -1);
  assert.ok(rootVarsIdx !== -1);
  assert.ok(rootKvIdx !== -1);
  assert.ok(schemaIdx < rootVarsIdx);
  assert.ok(rootVarsIdx < rootKvIdx);

  const rootVarsRange = findJsoncObjectRangeForPath(content, ['vars']);
  assert.ok(rootVarsRange);
  assert.ok(
    listJsoncObjectKeys(content, rootVarsRange).has('ENABLE_ACTIVITY_LOGS'),
  );

  const prodVarsRange = findJsoncObjectRangeForPath(content, [
    'env',
    'production',
    'vars',
  ]);
  assert.ok(prodVarsRange);
  assert.ok(
    listJsoncObjectKeys(content, prodVarsRange).has('ENABLE_ACTIVITY_LOGS'),
  );
});

test('syncWranglerJsoncVars creates env.production.vars when env is missing', () => {
  const input = `/**
 * Nested structure but no "env" object.
 */
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "example-worker",
  "main": "src/index.ts",
  "routes": [
    {
      "pattern": "api.example.com",
      "custom_domain": true
    }
  ],
  "observability": {
    "enabled": true
  }
}
`;

  const result = syncWranglerJsoncVars({
    source: input,
    rootEntries: [{ key: 'ENABLE_ACTIVITY_LOGS', value: true }],
    productionEntries: [{ key: 'ENABLE_ACTIVITY_LOGS', value: true }],
  });

  assert.ok(result);
  const { content } = result;

  const rootVarsRange = findJsoncObjectRangeForPath(content, ['vars']);
  assert.ok(rootVarsRange);
  assert.ok(
    listJsoncObjectKeys(content, rootVarsRange).has('ENABLE_ACTIVITY_LOGS'),
  );

  const prodVarsRange = findJsoncObjectRangeForPath(content, [
    'env',
    'production',
    'vars',
  ]);
  assert.ok(prodVarsRange);
  assert.ok(
    listJsoncObjectKeys(content, prodVarsRange).has('ENABLE_ACTIVITY_LOGS'),
  );
});

test('syncWranglerJsoncVars inserts JWT hints when JWT vars are present', () => {
  const input = `{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "example-worker",
  "main": "src/index.ts",
  "compatibility_flags": ["nodejs_compat"],
  "kv_namespaces": []
}
`;

  const result = syncWranglerJsoncVars({
    source: input,
    rootEntries: [
      { key: 'JWT_ISSUER', value: '' },
      { key: 'JWT_AUDIENCE', value: '' },
    ],
    productionEntries: [
      { key: 'JWT_ISSUER', value: '' },
      { key: 'JWT_AUDIENCE', value: '' },
    ],
  });

  assert.ok(result);
  const { content } = result;

  assert.ok(
    content.includes(
      'JWT_* are only needed when AUTH_MODE=jwt, JWT_ISSUER and JWT_AUDIENCE are optional.',
    ),
  );
  assert.ok(content.includes('Or add it to .dev.vars for local development.'));
  assert.ok(
    content.includes(
      'Or add it to .dev.vars.production for production secrets.',
    ),
  );

  assert.equal(
    content.split('JWT_* are only needed when AUTH_MODE=jwt').length - 1,
    2,
  );
});
