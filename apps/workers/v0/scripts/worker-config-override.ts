import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerConfigPath = join(__dirname, '..', 'worker-configuration.d.ts');

// Read the generated file
let content = readFileSync(workerConfigPath, 'utf-8');

// Replace any generated AUTH_WORKER binding with a stable, type-only RPC surface.
const searchPattern = /AUTH_WORKER:\s*[^;]+;/g;
const replacement =
  'AUTH_WORKER: Service<typeof import("@deepcrawl/auth-worker/rpc").default>;';

content = content.replace(searchPattern, replacement);

const parseEnvKeys = (raw: string) =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('=')[0]?.trim())
    .filter((key): key is string => Boolean(key));

const parseVarsKeys = (raw: string) => {
  const keys = new Set<string>();
  const varsBlocks = raw.match(/"vars"\s*:\s*\{[\s\S]*?\}/g) ?? [];

  for (const block of varsBlocks) {
    for (const match of block.matchAll(/"([A-Z0-9_]+)"\s*:/g)) {
      keys.add(match[1]);
    }
  }

  return keys;
};

const envExamplePath = join(__dirname, '..', '.dev.vars.example');
const wranglerPath = join(__dirname, '..', 'wrangler.jsonc');

const exampleKeys = new Set<string>(
  parseEnvKeys(readFileSync(envExamplePath, 'utf-8')),
);
const varsKeys = parseVarsKeys(readFileSync(wranglerPath, 'utf-8'));

const skipKeys = new Set(['JWT_ISSUER', 'JWT_AUDIENCE']);

const keysToEnsure = Array.from(exampleKeys).filter(
  (key) => !(varsKeys.has(key) || skipKeys.has(key)),
);

const ensureFields = (
  source: string,
  interfaceName: 'Env' | 'ProductionEnv',
) => {
  const patterns: Record<'Env' | 'ProductionEnv', RegExp> = {
    Env: /interface Env \{([\s\S]*?)\n\t\}/m,
    ProductionEnv: /interface ProductionEnv \{([\s\S]*?)\n\t\}/m,
  };
  const pattern = patterns[interfaceName];
  const match = source.match(pattern);
  if (!match) {
    return source;
  }

  const block = match[0];
  const existing = new Set<string>();

  for (const fieldMatch of block.matchAll(/\t\t([A-Z0-9_]+)\??:/g)) {
    existing.add(fieldMatch[1]);
  }

  const missing = keysToEnsure.filter((key) => !existing.has(key));
  if (!missing.length) {
    return source;
  }

  const insert = missing.map((key) => `\t\t${key}: string;`).join('\n');
  const updated = block.replace(/\n\t\}/, `\n${insert}\n\t}`);

  return source.replace(block, updated);
};

content = ensureFields(content, 'Env');
content = ensureFields(content, 'ProductionEnv');

content = content.replace(/\t\tJWT_ISSUER\?: string;\n/g, '');
content = content.replace(/\t\tJWT_AUDIENCE\?: string;\n/g, '');

const processEnvPattern = /Pick<Cloudflare\.Env,\s*([^>]+)>/m;
const processMatch = content.match(processEnvPattern);
if (processMatch) {
  const segment = processMatch[1];
  const keys = Array.from(segment.matchAll(/"([A-Z0-9_]+)"/g)).map(
    (match) => match[1],
  );
  const seen = new Set<string>();
  const ordered = keys.filter((key) => {
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  for (const key of keysToEnsure) {
    if (!seen.has(key)) {
      ordered.push(key);
      seen.add(key);
    }
  }

  const replacementSegment = ordered.map((key) => `"${key}"`).join(' | ');
  content = content.replace(
    processEnvPattern,
    `Pick<Cloudflare.Env, ${replacementSegment}>`,
  );
}

// Write back to file
writeFileSync(workerConfigPath, content, 'utf-8');

console.log('🧑‍🏭 AUTH_WORKER import path has been overridden successfully');
