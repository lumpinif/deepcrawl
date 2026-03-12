import { spawn } from 'node:child_process';

export type RunCommandOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdin?: string;
  allowFailure?: boolean;
  mode?: 'pipe' | 'inherit';
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
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
        const value = String(chunk);
        stdout += value;
        options.onStdout?.(value);
      });
      child.stderr?.on('data', (chunk: string) => {
        const value = String(chunk);
        stderr += value;
        options.onStderr?.(value);
      });
    }

    child.on('error', (error: Error) => {
      reject(error);
    });

    child.on('close', (code: number | null) => {
      const exitCode = code ?? 1;
      const result: RunCommandResult = { exitCode, stdout, stderr };
      if (exitCode !== 0 && !options.allowFailure) {
        const combinedOutput = [stdout, stderr].filter(Boolean).join('\n');
        reject(
          new Error(
            combinedOutput
              ? `Command failed: ${command} ${args.join(' ')}\n${combinedOutput}`
              : `Command failed: ${command} ${args.join(' ')}`,
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
