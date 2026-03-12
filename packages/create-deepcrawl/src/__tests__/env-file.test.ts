import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { upsertEnvFile } from '../lib/env-file.js';

test('upsertEnvFile creates a new env file with JWT_SECRET', () => {
  const root = mkdtempSync(join(tmpdir(), 'create-deepcrawl-env-'));
  const filePath = join(root, '.dev.vars');

  upsertEnvFile(filePath, {
    JWT_SECRET: 'generated-secret',
  });

  const output = readFileSync(filePath, 'utf8');
  assert.match(output, /# Added by create-deepcrawl/);
  assert.match(output, /JWT_SECRET=generated-secret/);
});

test('upsertEnvFile updates JWT_SECRET and keeps other lines', () => {
  const root = mkdtempSync(join(tmpdir(), 'create-deepcrawl-env-'));
  const filePath = join(root, '.dev.vars.production');

  upsertEnvFile(filePath, {
    API_KEY: 'kept',
    JWT_SECRET: 'first-secret',
  });

  upsertEnvFile(filePath, {
    JWT_SECRET: 'second-secret',
  });

  const output = readFileSync(filePath, 'utf8');
  assert.match(output, /API_KEY=kept/);
  assert.match(output, /JWT_SECRET=second-secret/);
  assert.equal(output.match(/JWT_SECRET=/g)?.length, 1);
});

test('upsertEnvFile quotes values that would break dotenv parsing', () => {
  const root = mkdtempSync(join(tmpdir(), 'create-deepcrawl-env-'));
  const filePath = join(root, '.dev.vars');

  upsertEnvFile(filePath, {
    JWT_SECRET: 'abc#def with spaces',
  });

  const output = readFileSync(filePath, 'utf8');
  assert.match(output, /JWT_SECRET="abc#def with spaces"/);
});
