import { runCommand } from '../lib/exec.js';

type Run = typeof runCommand;

export type DeployV0WorkerResult = {
  workerName: string;
  workerUrl: string;
  versionId?: string;
};

export function parseDeployV0WorkerOutput(
  output: string,
): DeployV0WorkerResult {
  const workerName = output.match(/Uploaded\s+([^\s]+)\s+\(/)?.[1];
  const workerUrl = output.match(/https:\/\/[^\s]+\.workers\.dev\b/)?.[0];
  const versionId = output.match(/Current Version ID:\s*([a-f0-9-]+)/i)?.[1];

  if (!(workerName && workerUrl)) {
    const missingFields = [
      workerName ? null : 'worker name',
      workerUrl ? null : 'worker URL',
    ]
      .filter(Boolean)
      .join(' and ');

    throw new Error(
      `Could not parse wrangler deploy output: missing ${missingFields}.\n${output}`,
    );
  }

  return {
    workerName,
    workerUrl,
    versionId,
  };
}

export async function deployV0Worker({
  cwd,
  configPath,
  env,
  run = runCommand,
}: {
  cwd: string;
  configPath: string;
  env: string;
  run?: Run;
}) {
  const result = await run(
    'wrangler',
    ['deploy', '--config', configPath, '--env', env, '--minify'],
    {
      cwd,
      mode: 'pipe',
      onStdout(chunk) {
        process.stdout.write(chunk);
      },
      onStderr(chunk) {
        process.stderr.write(chunk);
      },
    },
  );

  return parseDeployV0WorkerOutput(`${result.stdout}\n${result.stderr}`);
}
