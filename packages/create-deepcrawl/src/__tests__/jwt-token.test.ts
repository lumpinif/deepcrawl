import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { mintHs256Jwt } from '../lib/jwt-token.js';

function toBase64Url(value: Buffer): string {
  return value
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding =
    normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

test('mintHs256Jwt creates a token with expected payload claims', () => {
  const token = mintHs256Jwt({
    secret: 'secret',
    subject: 'deepcrawl-cli-test',
    expiresInMinutes: 15,
    issuer: 'deepcrawl',
    audience: 'agents',
  });

  const parts = token.split('.');
  assert.equal(parts.length, 3);

  const header = JSON.parse(fromBase64Url(parts[0] ?? ''));
  const payload = JSON.parse(fromBase64Url(parts[1] ?? ''));

  assert.deepEqual(header, {
    alg: 'HS256',
    typ: 'JWT',
  });
  assert.equal(
    parts[2],
    toBase64Url(
      createHmac('sha256', 'secret').update(`${parts[0]}.${parts[1]}`).digest(),
    ),
  );
  assert.equal(payload.sub, 'deepcrawl-cli-test');
  assert.equal(payload.iss, 'deepcrawl');
  assert.equal(payload.aud, 'agents');
  assert.equal(typeof payload.iat, 'number');
  assert.equal(typeof payload.exp, 'number');
  assert.ok(payload.exp > payload.iat);
});

test('mintHs256Jwt rejects invalid input before signing', () => {
  assert.throws(
    () =>
      mintHs256Jwt({
        secret: '',
        subject: 'deepcrawl-cli-test',
      }),
    /JWT secret must not be empty/,
  );
  assert.throws(
    () =>
      mintHs256Jwt({
        secret: 'secret',
        subject: '   ',
      }),
    /JWT subject must not be blank/,
  );
  assert.throws(
    () =>
      mintHs256Jwt({
        secret: 'secret',
        subject: 'deepcrawl-cli-test',
        expiresInMinutes: 0,
      }),
    /JWT expiresInMinutes must be a positive integer/,
  );
  assert.throws(
    () =>
      mintHs256Jwt({
        secret: 'secret',
        subject: 'deepcrawl-cli-test',
        expiresInMinutes: 1.5,
      }),
    /JWT expiresInMinutes must be a positive integer/,
  );
});
