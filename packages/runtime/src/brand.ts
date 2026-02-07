export const DEFAULT_BRAND_NAME = 'Deepcrawl';

export type BrandConfig = {
  name: string;
  token: string;
};

function getEnvString(env: unknown, key: string): string | undefined {
  if (!env || typeof env !== 'object') {
    return;
  }

  const value = (env as Record<string, unknown>)[key];
  if (typeof value !== 'string') {
    return;
  }

  return value;
}

export function resolveBrandName(raw: string | undefined): string {
  const normalized = raw?.trim().replace(/\s+/g, ' ') ?? '';
  if (!normalized) {
    return DEFAULT_BRAND_NAME;
  }

  return normalized;
}

export function toBrandToken(brandName: string): string {
  const token = brandName.replace(/[^A-Za-z0-9]+/g, '');
  return token || DEFAULT_BRAND_NAME;
}

export function resolveBrandConfigFromEnv(env: unknown): BrandConfig {
  const name = resolveBrandName(getEnvString(env, 'NEXT_PUBLIC_BRAND_NAME'));
  const token = toBrandToken(name);
  return { name, token };
}
