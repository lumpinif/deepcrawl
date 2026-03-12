import assert from 'node:assert/strict';
import test from 'node:test';
import type { runCommand } from '../lib/exec.js';
import {
  deployV0Worker,
  parseDeployV0WorkerOutput,
} from '../steps/deploy-v0-worker.js';

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

test('parseDeployV0WorkerOutput throws when wrangler output is incomplete', () => {
  const rawOutput = `
Uploaded bettercrawl-api-worker-production (24.89 sec)
Current Version ID: 392c17ca-d5ea-4740-9e12-b1ca6c2b345d
`;

  assert.throws(
    () => parseDeployV0WorkerOutput(rawOutput),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /missing worker URL/);
      assert.match(error.message, /Uploaded bettercrawl-api-worker-production/);
      return true;
    },
  );
});

test(
  'deployV0Worker streams deploy logs while keeping parseable output',
  { concurrency: false },
  async () => {
    const stdoutWrites: string[] = [];
    const stderrWrites: string[] = [];
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = ((chunk: string | Uint8Array) => {
      stdoutWrites.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;
    process.stderr.write = ((chunk: string | Uint8Array) => {
      stderrWrites.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;

    try {
      const deployment = await deployV0Worker({
        cwd: '/tmp/bettercrawl',
        configPath: 'apps/workers/v0/wrangler.jsonc',
        env: 'production',
        run: (async (_command, _args, options) => {
          assert.equal(options?.mode, 'pipe');

          options?.onStdout?.(
            'Uploaded bettercrawl-api-worker-production (24.89 sec)\n',
          );
          options?.onStdout?.(
            '  https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev\n',
          );
          options?.onStderr?.(
            'Current Version ID: 392c17ca-d5ea-4740-9e12-b1ca6c2b345d\n',
          );

          return {
            exitCode: 0,
            stdout: [
              'Uploaded bettercrawl-api-worker-production (24.89 sec)',
              '  https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev',
            ].join('\n'),
            stderr:
              'Current Version ID: 392c17ca-d5ea-4740-9e12-b1ca6c2b345d\n',
          };
        }) as typeof runCommand,
      });

      assert.deepEqual(stdoutWrites, [
        'Uploaded bettercrawl-api-worker-production (24.89 sec)\n',
        '  https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev\n',
      ]);
      assert.deepEqual(stderrWrites, [
        'Current Version ID: 392c17ca-d5ea-4740-9e12-b1ca6c2b345d\n',
      ]);
      assert.deepEqual(deployment, {
        workerName: 'bettercrawl-api-worker-production',
        workerUrl:
          'https://bettercrawl-api-worker-production.nbr8rcs5kh.workers.dev',
        versionId: '392c17ca-d5ea-4740-9e12-b1ca6c2b345d',
      });
    } finally {
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
    }
  },
);
