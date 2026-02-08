import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveBetterAuthApiBaseUrl,
  resolveBetterAuthOriginUrl,
} from '../utils/better-auth-url';

test('resolveBetterAuthApiBaseUrl throws on empty input', () => {
  assert.throws(() => resolveBetterAuthApiBaseUrl(''), /required/i);
  assert.throws(() => resolveBetterAuthApiBaseUrl('   '), /required/i);
});

test('resolveBetterAuthApiBaseUrl appends /api/auth exactly once', () => {
  assert.equal(
    resolveBetterAuthApiBaseUrl('https://example.com'),
    'https://example.com/api/auth',
  );

  assert.equal(
    resolveBetterAuthApiBaseUrl('https://example.com/api/auth'),
    'https://example.com/api/auth',
  );

  assert.equal(
    resolveBetterAuthApiBaseUrl('https://example.com/api/auth/get-session'),
    'https://example.com/api/auth',
  );

  assert.equal(
    resolveBetterAuthApiBaseUrl('https://example.com/api/auth/'),
    'https://example.com/api/auth',
  );
});

test('resolveBetterAuthOriginUrl removes the /api/auth suffix when present', () => {
  assert.equal(
    resolveBetterAuthOriginUrl('https://example.com/api/auth'),
    'https://example.com',
  );

  assert.equal(
    resolveBetterAuthOriginUrl('https://example.com'),
    'https://example.com',
  );
});
