import { parseDotenv } from './_dotenv';

export const PRODUCTION_VARS_PREFIX = 'PRODUCTION__';

export type VarsFile = {
  local: Record<string, string>;
  production: Record<string, string>;
};

export function parseVarsFile(content: string): VarsFile {
  const parsed = parseDotenv(content);
  const local: Record<string, string> = {};
  const production: Record<string, string> = {};

  for (const [rawKey, value] of Object.entries(parsed)) {
    if (rawKey.startsWith(PRODUCTION_VARS_PREFIX)) {
      const key = rawKey.slice(PRODUCTION_VARS_PREFIX.length);
      if (key) {
        production[key] = value;
      }
      continue;
    }

    local[rawKey] = value;
  }

  return { local, production };
}
