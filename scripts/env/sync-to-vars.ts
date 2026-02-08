import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getWranglerVarsForTarget,
  WRANGLER_VARS,
  type WranglerTarget,
  type WranglerVar,
} from '@deepcrawl/runtime/vars';
import { parseDotenv, writeFileIfChanged } from './_dotenv';
import type { JsoncValue } from './_jsonc';
import { applyLocalOverridesForTarget, resolveSyncMode } from './_overrides';
import { parseVarsFile, type VarsFile } from './_vars';
import { syncWranglerJsoncVars } from './_wrangler-jsonc-vars';

function parseBoolean(raw: string): boolean | null {
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  return null;
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^[-+]?\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return null;
  }

  return n;
}

function coerceVarsValue(def: WranglerVar, raw: string): JsoncValue {
  if (def.type === 'string') {
    return raw;
  }

  if (def.type === 'boolean') {
    const v = parseBoolean(raw);
    if (v == null) {
      throw new Error(`[vars] ${def.key} must be "true" or "false"`);
    }
    return v;
  }

  const v = parseNumber(raw);
  if (v == null) {
    throw new Error(`[vars] ${def.key} must be a number`);
  }
  return v;
}

function resolveVarsValue(params: {
  def: WranglerVar;
  env: 'local' | 'production';
  localVars: Record<string, string>;
  productionVars: Record<string, string>;
}): JsoncValue | undefined {
  const { def } = params;

  if (params.env === 'local') {
    if (Object.hasOwn(params.localVars, def.key)) {
      const raw = params.localVars[def.key] ?? '';
      if (raw.trim() !== '') {
        return coerceVarsValue(def, raw);
      }
    }
    if (def.localDefault !== undefined) {
      return def.localDefault;
    }
    return;
  }

  if (Object.hasOwn(params.productionVars, def.key)) {
    const raw = params.productionVars[def.key] ?? '';
    if (raw.trim() !== '') {
      return coerceVarsValue(def, raw);
    }
  }
  if (def.productionDefault !== undefined) {
    return def.productionDefault;
  }
}

const repoRoot = process.cwd();
const varsPath = join(repoRoot, 'env', '.vars');

const primaryEnvPath = join(repoRoot, 'env', '.env');
const legacyEnvPath = join(repoRoot, 'env', '.env.local');
const fallbackEnvPath = existsSync(primaryEnvPath)
  ? primaryEnvPath
  : existsSync(legacyEnvPath)
    ? legacyEnvPath
    : primaryEnvPath;

const knownKeys = new Set(WRANGLER_VARS.map((v) => v.key));

type VarsSource =
  | { kind: 'vars'; filePath: string; parsed: VarsFile }
  | {
      kind: 'env';
      filePath: string;
      values: Record<string, string>;
      syncMode: ReturnType<typeof resolveSyncMode>;
    };

const source: VarsSource = (() => {
  if (existsSync(varsPath)) {
    const varsContent = readFileSync(varsPath, 'utf-8');
    return {
      kind: 'vars',
      filePath: varsPath,
      parsed: parseVarsFile(varsContent),
    };
  }

  if (existsSync(fallbackEnvPath)) {
    console.warn(
      `[vars] ${varsPath} not found; falling back to ${fallbackEnvPath} for local values.\n` +
        '[vars] For production overrides, create env/.vars (see env/.vars.example).',
    );

    const envContent = readFileSync(fallbackEnvPath, 'utf-8');
    return {
      kind: 'env',
      filePath: fallbackEnvPath,
      values: parseDotenv(envContent),
      syncMode: resolveSyncMode(process.env.DEEPCRAWL_ENV_SYNC_MODE),
    };
  }

  console.error(
    `[vars] Missing ${varsPath} and ${fallbackEnvPath}. Create one to sync Wrangler vars.\n` +
      '\n' +
      'Quick start:\n' +
      '  pnpm env:generate\n' +
      '  cp env/.env.example env/.env\n' +
      '  # edit env/.env\n' +
      '  cp env/.vars.example env/.vars\n' +
      '  # edit env/.vars\n' +
      '  pnpm env:bootstrap\n',
  );
  process.exit(1);
})();

if (source.kind === 'vars') {
  for (const key of Object.keys(source.parsed.local)) {
    if (!knownKeys.has(key)) {
      console.warn(`[vars] unknown local key: ${key}`);
    }
  }
  for (const key of Object.keys(source.parsed.production)) {
    if (!knownKeys.has(key)) {
      console.warn(`[vars] unknown production key: ${key}`);
    }
  }
}

const outputs: Array<{ target: WranglerTarget; filePath: string }> = [
  {
    target: 'worker-auth',
    filePath: join(repoRoot, 'apps', 'workers', 'auth', 'wrangler.jsonc'),
  },
  {
    target: 'worker-v0',
    filePath: join(repoRoot, 'apps', 'workers', 'v0', 'wrangler.jsonc'),
  },
];

let changed = 0;

for (const out of outputs) {
  const raw = readFileSync(out.filePath, 'utf-8');

  const defs = getWranglerVarsForTarget(out.target);
  const rootEntries: Array<{ key: string; value: JsoncValue }> = [];
  const prodEntries: Array<{ key: string; value: JsoncValue }> = [];

  const localVars =
    source.kind === 'vars'
      ? source.parsed.local
      : applyLocalOverridesForTarget(
          out.target,
          source.values,
          source.syncMode,
        );
  const productionVars = source.kind === 'vars' ? source.parsed.production : {};

  for (const def of defs) {
    const localValue = resolveVarsValue({
      def,
      env: 'local',
      localVars,
      productionVars,
    });
    if (localValue !== undefined) {
      rootEntries.push({ key: def.key, value: localValue });
    }

    const productionValue = resolveVarsValue({
      def,
      env: 'production',
      localVars,
      productionVars,
    });
    if (productionValue !== undefined) {
      prodEntries.push({ key: def.key, value: productionValue });
    }
  }

  const result = syncWranglerJsoncVars({
    source: raw,
    rootEntries,
    productionEntries: prodEntries,
  });
  if (!result) {
    console.warn(`[vars] skipped ${out.filePath} (missing root object)`);
    continue;
  }

  const didWrite = writeFileIfChanged(out.filePath, result.content);
  if (didWrite) {
    changed += 1;
    console.log(`[vars] wrote ${out.filePath}`);
  } else {
    console.log(`[vars] up-to-date ${out.filePath}`);
  }
}

if (changed === 0) {
  console.log('[vars] no changes');
}
