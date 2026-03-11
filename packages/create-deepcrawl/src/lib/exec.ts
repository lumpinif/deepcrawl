import { spawn } from 'node:child_process';

export type RunCommandOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdin?: string;
  allowFailure?: boolean;
  mode?: 'pipe' | 'inherit';
};

export type RunCommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {},
): Promise<RunCommandResult> {
  return new Promise((resolve, reject) => {
    const mode = options.mode ?? 'pipe';
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: mode === 'inherit' ? 'inherit' : ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    if (mode !== 'inherit') {
      child.stdout?.setEncoding('utf8');
      child.stderr?.setEncoding('utf8');

      child.stdout?.on('data', (chunk: string) => {
        stdout += String(chunk);
      });
      child.stderr?.on('data', (chunk: string) => {
        stderr += String(chunk);
      });
    }

    child.on('error', (error: Error) => {
      reject(error);
    });

    child.on('close', (code: number | null) => {
      const exitCode = code ?? 1;
      const result: RunCommandResult = { exitCode, stdout, stderr };
      if (exitCode !== 0 && !options.allowFailure) {
        reject(
          new Error(
            `Command failed: ${command} ${args.join(' ')}\n${stderr || stdout}`,
          ),
        );
        return;
      }
      resolve(result);
    });

    if (options.stdin !== undefined && child.stdin) {
      child.stdin.write(options.stdin);
      child.stdin.end();
    } else {
      child.stdin?.end();
    }
  });
}
