import { type AuthMode, resolveAuthMode } from '@deepcrawl/runtime/auth-mode';

export type { AuthMode } from '@deepcrawl/runtime/auth-mode';

export function getAuthMode(): AuthMode {
  return resolveAuthMode(
    process.env.AUTH_MODE ?? process.env.NEXT_PUBLIC_AUTH_MODE,
  );
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
