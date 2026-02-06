const API_AUTH_PATH = '/api/auth';

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

/**
 * Returns the Better Auth API base URL that ends with `/api/auth` exactly once.
 *
 * Examples:
 * - `https://deepcrawl.dev` => `https://deepcrawl.dev/api/auth`
 * - `https://deepcrawl.dev/api/auth` => `https://deepcrawl.dev/api/auth`
 * - `https://deepcrawl.dev/api/auth/get-session` => `https://deepcrawl.dev/api/auth`
 */
export function resolveBetterAuthApiBaseUrl(rawUrl: string): string {
  const trimmed = stripTrailingSlashes(rawUrl.trim());

  // Match `/api/auth` as a path segment (not `/api/authentication`).
  const match = trimmed.match(/\/api\/auth(?=$|\/|\?|#)/);
  if (match?.index !== undefined) {
    return trimmed.slice(0, match.index + API_AUTH_PATH.length);
  }

  return `${trimmed}${API_AUTH_PATH}`;
}

/**
 * Returns the origin-like base URL without the `/api/auth` suffix (if present).
 *
 * Examples:
 * - `https://deepcrawl.dev/api/auth` => `https://deepcrawl.dev`
 * - `https://deepcrawl.dev` => `https://deepcrawl.dev`
 */
export function resolveBetterAuthOriginUrl(rawUrl: string): string {
  const apiBase = resolveBetterAuthApiBaseUrl(rawUrl);
  return apiBase.slice(0, apiBase.length - API_AUTH_PATH.length);
}
