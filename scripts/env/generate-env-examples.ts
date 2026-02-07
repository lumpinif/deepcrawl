import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  ENV_VARS,
  type EnvTarget,
  type EnvVarGroup,
  getEnvVarsForTarget,
} from '@deepcrawl/runtime/env';
import { formatDotenvValue, writeFileIfChanged } from './_dotenv';

type OutputFile = {
  target: EnvTarget;
  filePath: string;
  headerLines: string[];
};

const GROUP_ORDER: EnvVarGroup[] = [
  'App',
  'Auth',
  'JWT',
  'Workers',
  'Logs',
  'OAuth',
  'Email',
  'Upstash',
  'Cloudflare',
  'Turbo',
  'SDK',
];

const renderExampleFile = (target: EnvTarget, headerLines: string[]) => {
  const vars = getEnvVarsForTarget(target).filter((v) =>
    target === 'worker-auth' || target === 'worker-v0' ? v.secret : true,
  );

  const lines: string[] = [...headerLines, ''];

  for (const group of GROUP_ORDER) {
    const groupVars = vars.filter((v) => v.group === group);
    if (groupVars.length === 0) {
      continue;
    }

    lines.push(`# ${group}`);

    for (const v of groupVars) {
      if (v.description) {
        lines.push(`# ${v.description}`);
      }

      lines.push(`${v.key}=${v.example ? formatDotenvValue(v.example) : ''}`);
      lines.push('');
    }
  }

  return `${lines.join('\n').trimEnd()}\n`;
};

const renderLocalSourceExample = (headerLines: string[]) => {
  const lines: string[] = [...headerLines, ''];

  for (const group of GROUP_ORDER) {
    const groupVars = ENV_VARS.filter((v) => v.group === group);
    if (groupVars.length === 0) {
      continue;
    }

    lines.push(`# ${group}`);

    for (const v of groupVars) {
      if (v.description) {
        lines.push(`# ${v.description}`);
      }

      lines.push(`${v.key}=${v.example ? formatDotenvValue(v.example) : ''}`);
      lines.push('');
    }
  }

  return `${lines.join('\n').trimEnd()}\n`;
};

const repoRoot = process.cwd();

const outputs: OutputFile[] = [
  {
    target: 'dashboard',
    filePath: join(repoRoot, 'apps', 'app', '.env.example'),
    headerLines: [
      '# Used for local development and CLI tools such as:',
      '#',
      '# - Drizzle CLI',
      '# - Better Auth CLI',
    ],
  },
  {
    target: 'worker-auth',
    filePath: join(repoRoot, 'apps', 'workers', 'auth', '.dev.vars.example'),
    headerLines: [
      '# Used by Wrangler in local development (secrets only)',
      '# In production, these should be set as Cloudflare Worker Secrets.',
      '# Non-secrets are configured via Wrangler vars (see wrangler.jsonc).',
    ],
  },
  {
    target: 'worker-v0',
    filePath: join(repoRoot, 'apps', 'workers', 'v0', '.dev.vars.example'),
    headerLines: [
      '# Used by Wrangler in local development (secrets only)',
      '# In production, these should be set as Cloudflare Worker Secrets.',
      '# Non-secrets are configured via Wrangler vars (see wrangler.jsonc).',
    ],
  },
];

let changed = 0;

for (const out of outputs) {
  const content = renderExampleFile(out.target, out.headerLines);
  const didWrite = writeFileIfChanged(out.filePath, content);
  if (didWrite) {
    changed += 1;
    console.log(`[env] wrote ${out.filePath}`);
  } else {
    console.log(`[env] up-to-date ${out.filePath}`);
  }
}

const localSourceExamplePath = join(repoRoot, 'env', '.env.example');
const localSourceHeader = [
  '# Single source of truth for local development.',
  '#',
  '# 1) Copy this file to env/.env',
  '# 2) Fill in values',
  '# 3) Run: pnpm env:sync:local',
  '#',
  '# Note: This file is NOT read by Next.js or Wrangler directly.',
];

const localSourceContent = renderLocalSourceExample(localSourceHeader);
mkdirSync(join(repoRoot, 'env'), { recursive: true });

const localDidWrite = writeFileIfChanged(
  localSourceExamplePath,
  localSourceContent,
);
if (localDidWrite) {
  changed += 1;
  console.log(`[env] wrote ${localSourceExamplePath}`);
} else {
  console.log(`[env] up-to-date ${localSourceExamplePath}`);
}

if (changed === 0) {
  console.log('[env] no changes');
}
