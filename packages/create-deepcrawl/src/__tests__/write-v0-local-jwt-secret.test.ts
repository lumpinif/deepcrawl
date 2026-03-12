import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { writeV0LocalJwtSecret } from '../steps/write-v0-local-jwt-secret.js';

test('writeV0LocalJwtSecret writes JWT_SECRET to both worker env files', () => {
  const projectDir = mkdtempSync(join(tmpdir(), 'create-deepcrawl-project-'));

  const result = writeV0LocalJwtSecret({
    projectDir,
    jwtSecret: 'generated-secret',
  });

  assert.match(readFileSync(result.devVarsPath, 'utf8'), /generated-secret/);
  assert.match(
    readFileSync(result.productionDevVarsPath, 'utf8'),
    /generated-secret/,
  );
});
