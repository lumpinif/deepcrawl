import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDeployV0WorkerOutput } from '../steps/deploy-v0-worker.js';

test('parseDeployV0WorkerOutput extracts worker name, url, and version', () => {
  const result = parseDeployV0WorkerOutput(`
Uploaded bettercrawl-api-worker-production (24.89 sec)
Deployed bettercrawl-api-worker-production triggers (1.77 sec)
  https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev
Current Version ID: 392c17ca-d5ea-4740-9e12-b1ca6c2b345d
`);

  assert.deepEqual(result, {
    workerName: 'bettercrawl-api-worker-production',
    workerUrl:
      'https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev',
    versionId: '392c17ca-d5ea-4740-9e12-b1ca6c2b345d',
  });
});
