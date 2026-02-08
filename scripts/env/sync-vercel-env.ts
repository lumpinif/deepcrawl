import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type EnvTarget,
  type EnvVar,
  getEnvVarsForTarget,
} from '@deepcrawl/runtime/env';
import { parseDotenv } from './_dotenv';
import { applyLocalOverridesForTarget, resolveSyncMode } from './_overrides';

type VercelTarget = 'production' | 'preview' | 'development';
type Mode = 'add-missing' | 'upsert';
type DashboardTarget = Extract<EnvTarget, 'dashboard'>;

function parseArgs(argv: string[]) {
  const out: {
    target: VercelTarget;
    mode: Mode;
    apply: boolean;
    sourcePath?: string;
    project?: string;
    token?: string;
    scope?: string;
  } = {
    target: 'production',
    mode: 'add-missing',
    apply: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    switch (key) {
      case '--target':
        if (
          value === 'production' ||
          value === 'preview' ||
          value === 'development'
        ) {
          out.target = value;
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
      case '--project':
        if (value) {
          out.project = value;
          i += 1;
        }
        break;
      case '--token':
        if (value) {
          out.token = value;
          i += 1;
        }
        break;
      case '--scope':
        if (value) {
          out.scope = value;
          i += 1;
        }
        break;
      case '--team':
        // Back-compat alias for `--scope`.
        if (value) {
          out.scope = value;
          i += 1;
        }
        break;
      default:
        break;
    }
  }

  return out;
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

function maskValue(value: string): string {
  if (!value) {
    return '';
  }
  if (value.length <= 6) {
    return '******';
  }
  return `${value.slice(0, 2)}******${value.slice(-2)}`;
}

function requiredNonEmpty(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const cleaned = value.trim();
  return cleaned ? cleaned : null;
}

type LinkedVercelProject = {
  projectId: string;
  orgId?: string;
};

function readLinkedVercelProject(repoRoot: string): LinkedVercelProject | null {
  const candidates = [
    join(repoRoot, 'apps', 'app', '.vercel', 'project.json'),
    join(repoRoot, '.vercel', 'project.json'),
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue;
    }

    try {
      const raw = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        continue;
      }

      const p = parsed as { projectId?: unknown; orgId?: unknown };
      const projectId = requiredNonEmpty(p.projectId);
      if (!projectId) {
        continue;
      }

      const orgId = requiredNonEmpty(p.orgId) ?? undefined;
      return { projectId, orgId };
    } catch {}
  }

  return null;
}

type VercelEnvVar = {
  id?: string;
  key?: string;
  name?: string;
  target?: VercelTarget[] | string[];
  type?: string;
  gitBranch?: string | null;
};

function parseVercelEnvList(stdout: string): Set<string> | null {
  try {
    const parsed = JSON.parse(stdout) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const out = new Set<string>();
    for (const item of parsed as VercelEnvVar[]) {
      const key =
        typeof item?.key === 'string'
          ? item.key.trim()
          : typeof item?.name === 'string'
            ? item.name.trim()
            : '';
      if (key) {
        out.add(key);
      }
    }
    return out;
  } catch {
    return null;
  }
}

function resolveVercelType(v: EnvVar): 'plain' | 'encrypted' {
  return v.secret ? 'encrypted' : 'plain';
}

function resolveVercelCwd(repoRoot: string): string {
  return join(repoRoot, 'apps', 'app');
}

function runVercel(params: {
  repoRoot: string;
  vercelCwd: string;
  args: string[];
  token?: string;
  scope?: string;
  input?: string;
}): { ok: boolean; stdout: string; stderr: string; status: number } {
  const globalArgs = ['--cwd', params.vercelCwd];
  if (params.token) {
    globalArgs.push('--token', params.token);
  }
  if (params.scope) {
    globalArgs.push('--scope', params.scope);
  }

  const result = spawnSync('vercel', [...globalArgs, ...params.args], {
    cwd: params.repoRoot,
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

function isNotLinkedError(stderr: string): boolean {
  const s = stderr.toLowerCase();
  return (
    s.includes("isn't linked") ||
    s.includes('isn’t linked') ||
    s.includes('run `vercel link`') ||
    s.includes('not linked to a project')
  );
}

const repoRoot = process.cwd();
const args = parseArgs(process.argv.slice(2));

async function main() {
  const sourcePath = resolveSourcePath(repoRoot, args.sourcePath);
  if (!existsSync(sourcePath)) {
    process.stderr.write(
      `[vercel] Missing ${sourcePath}.\n\n` +
        'Quick start:\n' +
        '  pnpm env:generate\n' +
        '  cp env/.env.example env/.env\n' +
        '  # edit env/.env\n' +
        '  pnpm env:bootstrap\n',
    );
    process.exit(1);
  }

  const dashboardTarget: DashboardTarget = 'dashboard';
  const syncMode = resolveSyncMode(process.env.DEEPCRAWL_ENV_SYNC_MODE);

  const sourceContent = readFileSync(sourcePath, 'utf-8');
  const rawValues = parseDotenv(sourceContent);
  const values = applyLocalOverridesForTarget(
    dashboardTarget,
    rawValues,
    syncMode,
  );

  const vars = getEnvVarsForTarget(dashboardTarget).filter(
    (v) => v.group !== 'Turbo',
  );
  const metaByKey = new Map(vars.map((v) => [v.key, v] as const));

  const desired = vars
    .map((v) => {
      const value = values[v.key] ?? '';
      return { key: v.key, value, type: resolveVercelType(v) };
    })
    .filter((x) => x.value.trim() !== '');

  if (desired.length === 0) {
    process.stdout.write(`[vercel] No env vars found in ${sourcePath}.\n`);
    process.exit(0);
  }

  process.stdout.write(
    `[vercel] Planned updates: cwd=apps/app target=${args.target} mode=${args.mode}\n`,
  );
  for (const item of desired) {
    const v = metaByKey.get(item.key);
    const typeLabel = v?.secret ? 'secret' : 'plain';
    process.stdout.write(
      `- ${item.key}=${maskValue(item.value)} (${typeLabel})\n`,
    );
  }

  if (!args.apply) {
    process.stdout.write('\n[vercel] Dry-run only. Re-run with --apply.\n');
    process.exit(0);
  }

  const token =
    requiredNonEmpty(args.token) ?? requiredNonEmpty(process.env.VERCEL_TOKEN);
  const scope =
    requiredNonEmpty(args.scope) ?? requiredNonEmpty(process.env.VERCEL_SCOPE);

  const vercelCwd = resolveVercelCwd(repoRoot);

  let existingKeys: Set<string> | null = null;
  const listExisting = () =>
    runVercel({
      repoRoot,
      vercelCwd,
      token: token ?? undefined,
      scope: scope ?? undefined,
      args: ['env', 'list', args.target, '--format', 'json'],
    });

  // Ensure the project is linked before we try to write anything.
  const preflight = listExisting();
  if (!preflight.ok) {
    if (isNotLinkedError(preflight.stderr)) {
      const project = requiredNonEmpty(args.project);
      if (!project) {
        process.stderr.write(
          '[vercel] Project not linked.\n\n' +
            'This environment runs Vercel CLI in non-interactive mode, so you must provide a project to link.\n\n' +
            'Run one of:\n' +
            '  vercel link --cwd apps/app --project <NAME> --yes\n' +
            '  pnpm env:sync:vercel --apply --project <NAME>\n\n' +
            'Optional:\n' +
            '  Add --scope <TEAM> (or set VERCEL_SCOPE) if the project is under a team.\n',
        );
        process.exit(1);
      }

      process.stdout.write(
        `[vercel] Project not linked. Linking apps/app -> ${project}...\n`,
      );
      const link = runVercel({
        repoRoot,
        vercelCwd,
        token: token ?? undefined,
        scope: scope ?? undefined,
        args: ['link', '--project', project, '--yes'],
      });
      if (!link.ok) {
        process.stderr.write(
          `[vercel] Failed to link project (exit=${link.status}).\n` +
            (link.stderr ? `\n${link.stderr}\n` : ''),
        );
        process.exit(1);
      }
    } else {
      process.stderr.write(
        `[vercel] Preflight failed (target=${args.target}).\n` +
          `vercel exit code: ${preflight.status}\n` +
          (preflight.stderr ? `\n${preflight.stderr}\n` : ''),
      );
      process.exit(1);
    }
  }

  if (args.mode === 'add-missing') {
    const list = listExisting();
    if (!list.ok) {
      process.stderr.write(
        `[vercel] Failed to list existing env vars (target=${args.target}).\n` +
          `vercel exit code: ${list.status}\n` +
          (list.stderr ? `\n${list.stderr}\n` : ''),
      );
      process.stderr.write(
        '\nRefusing to apply in add-missing mode without a reliable env list.\n' +
          'Run with:\n' +
          '  --mode upsert --apply\n',
      );
      process.exit(1);
    }

    existingKeys = parseVercelEnvList(list.stdout);
    if (!existingKeys) {
      process.stderr.write(
        '[vercel] Unexpected `vercel env list` output; treating env vars as unknown.\n',
      );
      process.stderr.write(
        '\nRefusing to apply in add-missing mode without a reliable env list.\n' +
          'Run with:\n' +
          '  --mode upsert --apply\n',
      );
      process.exit(1);
    }
  }

  let toWrite = desired;
  if (args.mode === 'add-missing') {
    // `existingKeys` is validated above (we `process.exit(1)` if it can't be
    // parsed), but TS doesn't narrow across that control flow.
    if (!existingKeys) {
      throw new Error('[vercel] Unexpected missing env list (unreachable).');
    }
    const keys = existingKeys;
    toWrite = desired.filter((d) => !keys.has(d.key));
  }

  if (toWrite.length === 0) {
    process.stdout.write('[vercel] No changes (all env vars already exist).\n');
    process.exit(0);
  }

  let failures = 0;
  for (const item of toWrite) {
    try {
      const v = metaByKey.get(item.key);
      const argsForAdd = [
        'env',
        'add',
        item.key,
        args.target,
        ...(v?.secret ? ['--sensitive'] : []),
        ...(args.mode === 'upsert' ? ['--force'] : []),
        '--yes',
      ];

      const result = runVercel({
        repoRoot,
        vercelCwd,
        token: token ?? undefined,
        scope: scope ?? undefined,
        args: argsForAdd,
        input: `${item.value}\n`,
      });

      if (!result.ok) {
        throw new Error(
          `vercel exit code: ${result.status}\n` +
            (result.stderr ? `\n${result.stderr}\n` : ''),
        );
      }

      process.stdout.write(`[vercel] set ${item.key}\n`);
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(
        `\n[vercel] Failed to set ${item.key}.\n${message}\n`,
      );
    }
  }

  if (failures > 0) {
    process.stderr.write(`\n[vercel] Completed with ${failures} failures.\n`);
    process.exit(1);
  }

  process.stdout.write('\n[vercel] Done.\n');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[vercel] Unexpected error: ${message}\n`);
  process.exit(1);
});
