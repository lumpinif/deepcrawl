import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveTrustedOrigins } from '../configs/constants';

test('resolveTrustedOrigins includes app/auth/api origins and www variant for appURL', () => {
  const origins = resolveTrustedOrigins({
    appURL: 'https://example.com/some/path',
    authURL: 'https://auth.example.com',
    apiURL: 'https://api.example.com/v0',
  });

  assert.ok(origins.includes('https://example.com'));
  assert.ok(origins.includes('https://www.example.com'));
  assert.ok(origins.includes('https://auth.example.com'));
  assert.ok(origins.includes('https://api.example.com'));

  assert.equal(new Set(origins).size, origins.length);
});

test('resolveTrustedOrigins omits api origin when apiURL is not provided', () => {
  const origins = resolveTrustedOrigins({
    appURL: 'https://example.com',
    authURL: 'https://auth.example.com',
  });

  assert.ok(origins.includes('https://example.com'));
  assert.ok(origins.includes('https://www.example.com'));
  assert.ok(origins.includes('https://auth.example.com'));
});

test('resolveTrustedOrigins includes local dev origins when isDevelopment=true', () => {
  const origins = resolveTrustedOrigins({
    appURL: 'https://example.com',
    authURL: 'https://auth.example.com',
    isDevelopment: true,
  });

  assert.ok(origins.includes('http://localhost:3000'));
  assert.ok(origins.includes('http://localhost:8787'));
  assert.ok(origins.includes('http://localhost:8080'));
});
