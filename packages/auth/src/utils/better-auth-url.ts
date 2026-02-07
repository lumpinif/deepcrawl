import { stripTrailingSlashes } from '@deepcrawl/runtime/urls';

const API_AUTH_PATH = '/api/auth';

/**
 * Better Auth URL helpers.
 *
 * Note:
 * - Prefer these helpers over hand-rolling string concatenation like
 *   `baseUrl + '/api/auth'` or manually stripping `/api/auth/...`.
 * - Keep this in `@deepcrawl/auth` (not `@deepcrawl/runtime`) because the logic
 *   is specific to Better Auth's `basePath`.
 */

/**
 * Returns the Better Auth API base URL that ends with `/api/auth` exactly once.
 *
 * Examples:
 * - `https://example.com` => `https://example.com/api/auth`
 * - `https://example.com/api/auth` => `https://example.com/api/auth`
 * - `https://example.com/api/auth/get-session` => `https://example.com/api/auth`
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
 * - `https://example.com/api/auth` => `https://example.com`
 * - `https://example.com` => `https://example.com`
 */
export function resolveBetterAuthOriginUrl(rawUrl: string): string {
  const apiBase = resolveBetterAuthApiBaseUrl(rawUrl);
  return apiBase.slice(0, apiBase.length - API_AUTH_PATH.length);
}
