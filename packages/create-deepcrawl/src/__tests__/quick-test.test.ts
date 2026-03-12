import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildQuickTestSuccessCard,
  normalizeQuickTestTargetUrl,
} from '../ui/quick-test.js';

test('normalizeQuickTestTargetUrl falls back to the default URL for blank input', () => {
  assert.equal(normalizeQuickTestTargetUrl(''), 'https://example.com');
  assert.equal(normalizeQuickTestTargetUrl('   '), 'https://example.com');
  assert.equal(
    normalizeQuickTestTargetUrl(' https://openai.com/docs '),
    'https://openai.com/docs',
  );
});

test('buildQuickTestSuccessCard preserves JSON indentation in the preview block', () => {
  const card = buildQuickTestSuccessCard({
    ok: true,
    requestPath: '/links?url=https%3A%2F%2Fexample.com',
    authLabel: 'No auth required',
    statusCode: 200,
    statusText: 'OK',
    preview: [
      '{',
      '  "links": [',
      '    "https://example.com"',
      '  ]',
      '}',
    ].join('\n'),
    curlCommand:
      'curl "https://example-worker.workers.dev/links?url=https%3A%2F%2Fexample.com"',
  });

  assert.match(card, /\n {4}"links": \[/);
  assert.match(card, /\n {6}"https:\/\/example\.com"/);
});
