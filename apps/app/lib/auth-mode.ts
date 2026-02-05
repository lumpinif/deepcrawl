export type AuthMode = 'better-auth' | 'jwt' | 'none';

const DEFAULT_AUTH_MODE: AuthMode = 'better-auth';

export function getAuthMode(): AuthMode {
  const raw = process.env.AUTH_MODE ?? process.env.NEXT_PUBLIC_AUTH_MODE;
  const normalized = raw?.trim().toLowerCase();
  if (
    normalized === 'better-auth' ||
    normalized === 'jwt' ||
    normalized === 'none'
  ) {
    return normalized;
  }
  if (process.env.AUTH_JWT_TOKEN) {
    return 'jwt';
  }
  return DEFAULT_AUTH_MODE;
}

export function isBetterAuthMode(): boolean {
  return getAuthMode() === 'better-auth';
}

export function isJwtMode(): boolean {
  return getAuthMode() === 'jwt';
}

export function buildDeepcrawlHeaders(requestHeaders: HeadersInit): Headers {
  const nextHeaders = new Headers(requestHeaders);
  if (!isJwtMode()) {
    return nextHeaders;
  }

  const JWT_TOKEN = process.env.AUTH_JWT_TOKEN;
  if (!JWT_TOKEN) {
    return nextHeaders;
  }

  nextHeaders.set('authorization', `Bearer ${JWT_TOKEN}`);
  return nextHeaders;
}
