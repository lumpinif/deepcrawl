import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildQuickTestPreviewResult,
  runQuickTestV0Worker,
} from '../steps/quick-test-v0-worker.js';

test('runQuickTestV0Worker adds an Authorization header for JWT quick tests', async () => {
  let authorizationHeader: string | null = null;

  const result = await runQuickTestV0Worker({
    workerUrl: 'https://example-worker.workers.dev',
    kind: 'read',
    targetUrl: 'https://example.com',
    authMode: 'jwt',
    jwtSecret: 'secret',
    jwtIssuer: 'deepcrawl',
    jwtAudience: 'agents',
    fetcher: async (_input, init) => {
      authorizationHeader =
        (init?.headers as Record<string, string> | undefined)?.Authorization ??
        null;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    },
  });

  if (authorizationHeader === null) {
    assert.fail('Expected Authorization header to be set.');
  }
  assert.match(authorizationHeader, /^Bearer /);
  assert.equal(result.ok, true);
  assert.match(result.preview, /"ok": true/);
  assert.match(result.curlCommand, /Authorization: Bearer /);
});

test('runQuickTestV0Worker skips Authorization for no-auth tests', async () => {
  let authorizationHeader: string | null = null;

  const result = await runQuickTestV0Worker({
    workerUrl: 'https://example-worker.workers.dev',
    kind: 'links',
    targetUrl: 'https://example.com',
    authMode: 'none',
    fetcher: async (_input, init) => {
      authorizationHeader =
        (init?.headers as Record<string, string> | undefined)?.Authorization ??
        null;

      return new Response('plain text response', {
        status: 200,
      });
    },
  });

  assert.equal(authorizationHeader, null);
  assert.equal(result.ok, true);
  assert.equal(
    result.curlCommand,
    'curl "https://example-worker.workers.dev/links?url=https%3A%2F%2Fexample.com"',
  );
});

test('runQuickTestV0Worker pretty prints and truncates JSON previews', async () => {
  const longBody = JSON.stringify({
    body: 'x'.repeat(2000),
  });

  const result = await runQuickTestV0Worker({
    workerUrl: 'https://example-worker.workers.dev',
    kind: 'read',
    targetUrl: 'https://example.com',
    authMode: 'none',
    fetcher: async () =>
      new Response(longBody, {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
  });

  assert.match(result.preview, /"body": "x+/);
  assert.ok(result.preview.endsWith('...'));
  assert.ok(result.preview.length <= 1203);
});

test('runQuickTestV0Worker escapes terminal control characters in previews', async () => {
  const result = await runQuickTestV0Worker({
    workerUrl: 'https://example-worker.workers.dev',
    kind: 'read',
    targetUrl: 'https://example.com',
    authMode: 'none',
    fetcher: async () =>
      new Response('hello\u001b[31mred\u001b[0m\rreset\u0007bell', {
        status: 200,
      }),
  });

  assert.equal(
    result.preview,
    'hello\\u001b[31mred\\u001b[0m\\rreset\\u0007bell',
  );
  for (const char of ['\u001b', '\r', '\u0007']) {
    assert.equal(result.preview.includes(char), false);
  }
});

test('runQuickTestV0Worker returns a readable failure result', async () => {
  const result = await runQuickTestV0Worker({
    workerUrl: 'https://example-worker.workers.dev',
    kind: 'read',
    targetUrl: 'https://example.com',
    authMode: 'jwt',
    jwtSecret: 'secret',
    fetcher: async () => {
      throw new Error('Network down');
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 0);
  assert.equal(result.statusText, 'Request failed');
  assert.match(result.preview, /Network down/);
  assert.match(result.curlCommand, /Authorization: Bearer /);
});

test('runQuickTestV0Worker escapes terminal control characters in failures', async () => {
  const result = await runQuickTestV0Worker({
    workerUrl: 'https://example-worker.workers.dev',
    kind: 'read',
    targetUrl: 'https://example.com',
    authMode: 'none',
    fetcher: async () => {
      throw new Error('boom\u001b]2;pwnd\u0007');
    },
  });

  assert.equal(result.preview, 'boom\\u001b]2;pwnd\\u0007');
  for (const char of ['\u001b', '\u0007']) {
    assert.equal(result.preview.includes(char), false);
  }
});

test('buildQuickTestPreviewResult creates a simulated success result', () => {
  const result = buildQuickTestPreviewResult({
    workerUrl: 'https://preview-worker.example.workers.dev',
    kind: 'links',
    targetUrl: 'https://example.com',
    authMode: 'jwt',
    jwtSecret: 'secret',
  });

  assert.equal(result.ok, true);
  assert.equal(result.statusCode, 200);
  assert.equal(result.statusText, 'Preview only');
  assert.match(result.preview, /https:\/\/www\.iana\.org\/domains\/example/);
  assert.match(result.curlCommand, /Authorization: Bearer /);
});
