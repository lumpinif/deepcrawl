import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type EnvTarget, getEnvVarsForTarget } from '@deepcrawl/runtime/env';
import { parseDotenv } from './_dotenv';

type WorkerTarget = Extract<EnvTarget, 'worker-auth' | 'worker-v0'>;

type Mode = 'add-missing' | 'upsert';

function parseArgs(argv: string[]) {
  const out: {
    target: WorkerTarget;
    env: string;
    mode: Mode;
    apply: boolean;
    sourcePath?: string;
  } = {
    target: 'worker-v0',
    env: 'production',
    mode: 'add-missing',
    apply: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    switch (key) {
      case '--target':
        if (value === 'worker-auth' || value === 'worker-v0') {
          out.target = value;
          i += 1;
        }
        break;
      case '--env':
        if (value) {
          out.env = value;
          i += 1;
        }
        break;
      case '--mode':
        if (value === 'add-missing' || value === 'upsert') {
          out.mode = value;
          i += 1;
        }
        break;
      case '--apply':
        out.apply = true;
        break;
      case '--source':
        if (value) {
          out.sourcePath = value;
          i += 1;
        }
        break;
      default:
        break;
    }
  }

  return out;
}

function runWrangler(params: { cwd: string; args: string[]; input?: string }): {
  ok: boolean;
  stdout: string;
  stderr: string;
  status: number;
} {
  const result = spawnSync('pnpm', ['exec', 'wrangler', ...params.args], {
    cwd: params.cwd,
    input: params.input,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

function resolveSourcePath(repoRoot: string, override?: string): string {
  if (override) {
    return override;
  }

  const primary = join(repoRoot, 'env', '.env');
  const legacy = join(repoRoot, 'env', '.env.local');
  if (existsSync(primary)) {
    return primary;
  }
  if (existsSync(legacy)) {
    return legacy;
  }
  return primary;
}

function resolveWorkerCwd(repoRoot: string, target: WorkerTarget): string {
  return target === 'worker-auth'
    ? join(repoRoot, 'apps', 'workers', 'auth')
    : join(repoRoot, 'apps', 'workers', 'v0');
}

type WranglerSecretListItem = {
  name?: string;
  type?: string;
};

function parseWranglerSecretList(stdout: string): Set<string> | null {
  try {
    const parsed = JSON.parse(stdout) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const out = new Set<string>();
    for (const item of parsed as WranglerSecretListItem[]) {
      const name = typeof item?.name === 'string' ? item.name.trim() : '';
      if (name) {
        out.add(name);
      }
    }
    return out;
  } catch {
    return null;
  }
}

function maskValue(value: string): string {
  if (!value) {
    return '';
  }
  if (value.length <= 6) {
    return '******';
  }
  return `${value.slice(0, 2)}******${value.slice(-2)}`;
}

const repoRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));

const sourcePath = resolveSourcePath(repoRoot, args.sourcePath);
if (!existsSync(sourcePath)) {
  process.stderr.write(
    `[cloudflare] Missing ${sourcePath}.\n\n` +
      'Quick start:\n' +
      '  pnpm env:generate\n' +
      '  cp env/.env.example env/.env\n' +
      '  # edit env/.env\n' +
      '  pnpm env:bootstrap\n',
  );
  process.exit(1);
}

const sourceContent = readFileSync(sourcePath, 'utf-8');
const values = parseDotenv(sourceContent);

const workerCwd = resolveWorkerCwd(repoRoot, args.target);

const secretKeys = new Set(
  getEnvVarsForTarget(args.target)
    .filter((v) => v.secret)
    .map((v) => v.key),
);

const desired = Object.entries(values)
  .filter(([key, value]) => secretKeys.has(key) && value.trim() !== '')
  .map(([key, value]) => ({ key, value }));

if (desired.length === 0) {
  process.stdout.write(
    `[cloudflare] No secrets found in ${sourcePath} for target ${args.target}.\n`,
  );
  process.exit(0);
}

let existing: Set<string> | null = null;
if (args.mode === 'add-missing') {
  const list = runWrangler({
    cwd: workerCwd,
    args: ['secret', 'list', '--env', args.env, '--format', 'json'],
  });

  if (list.ok) {
    existing = parseWranglerSecretList(list.stdout);
    if (!existing) {
      process.stderr.write(
        '[cloudflare] Unexpected wrangler secret list output; treating secrets as unknown.\n',
      );
      if (args.apply) {
        process.stderr.write(
          '\nRefusing to apply in add-missing mode without a reliable secret list.\n' +
            'Run with:\n' +
            '  --mode upsert --apply\n',
        );
        process.exit(1);
      }
    }
  } else {
    process.stderr.write(
      `[cloudflare] Failed to list existing secrets (target=${args.target}, env=${args.env}).\n` +
        `wrangler exit code: ${list.status}\n` +
        (list.stderr ? `\n${list.stderr}\n` : ''),
    );
    if (args.apply) {
      process.stderr.write(
        '\nRefusing to apply in add-missing mode without a reliable secret list.\n' +
          'Fix your Wrangler auth and retry, or run with:\n' +
          '  --mode upsert --apply\n',
      );
      process.exit(1);
    }
  }
}

// Use a const snapshot so TypeScript can safely narrow inside the filter closure.
const existingSet = existing;
const toWrite =
  args.mode === 'upsert' || !existingSet
    ? desired
    : desired.filter(({ key }) => !existingSet.has(key));

if (toWrite.length === 0) {
  process.stdout.write(
    `[cloudflare] No changes (all secrets already exist). target=${args.target} env=${args.env}\n`,
  );
  process.exit(0);
}

process.stdout.write(
  `[cloudflare] Planned updates: target=${args.target} env=${args.env} mode=${args.mode}\n`,
);
for (const { key, value } of toWrite) {
  process.stdout.write(`- ${key}=${maskValue(value)}\n`);
}

if (!args.apply) {
  process.stdout.write('\n[cloudflare] Dry-run only. Re-run with --apply.\n');
  process.exit(0);
}

let failures = 0;
for (const { key, value } of toWrite) {
  const result = runWrangler({
    cwd: workerCwd,
    args: ['secret', 'put', key, '--env', args.env],
    input: `${value}\n`,
  });

  if (result.ok) {
    process.stdout.write(`[cloudflare] set ${key}\n`);
  } else {
    failures += 1;
    process.stderr.write(
      `\n[cloudflare] Failed to set secret ${key} (exit=${result.status}).\n` +
        (result.stderr ? `${result.stderr}\n` : ''),
    );
  }
}

if (failures > 0) {
  process.stderr.write(`\n[cloudflare] Completed with ${failures} failures.\n`);
  process.exit(1);
}

process.stdout.write('\n[cloudflare] Done.\n');
