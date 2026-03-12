import { runCommand } from '../lib/exec.js';

export type DeployV0WorkerResult = {
  workerName?: string;
  workerUrl?: string;
  versionId?: string;
};

export function parseDeployV0WorkerOutput(
  output: string,
): DeployV0WorkerResult {
  const workerName = output.match(/Uploaded\s+([^\s]+)\s+\(/)?.[1];
  const workerUrl = output.match(/https:\/\/[^\s]+\.workers\.dev\b/)?.[0];
  const versionId = output.match(/Current Version ID:\s*([a-f0-9-]+)/i)?.[1];

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
}: {
  cwd: string;
  configPath: string;
  env: string;
}) {
  const result = await runCommand(
    'wrangler',
    ['deploy', '--config', configPath, '--env', env, '--minify'],
    { cwd, mode: 'pipe' },
  );

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return parseDeployV0WorkerOutput(`${result.stdout}\n${result.stderr}`);
}
