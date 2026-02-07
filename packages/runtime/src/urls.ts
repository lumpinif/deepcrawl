/**
 * URL helpers used across dashboard/workers.
 *
 * If you find yourself writing patterns like:
 * - `value.startsWith('http') ? value : \`https://${value}\``
 * - `try { new URL(value) } catch { new URL(\`https://${value}\`) }`
 *
 * Prefer `ensureAbsoluteUrl()` / `toOrigin()` from this module instead, so we
 * don't re-implement URL normalization in multiple places.
 */
export const OFFICIAL_APP_URL = 'https://deepcrawl.dev';
export const OFFICIAL_API_URL = 'https://api.deepcrawl.dev';
export const OFFICIAL_AUTH_URL = 'https://auth.deepcrawl.dev';

export function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

export function ensureAbsoluteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function toOrigin(rawUrl: string): string | null {
  try {
    return new URL(ensureAbsoluteUrl(rawUrl)).origin;
  } catch {
    return null;
  }
}

export function toWwwOrigin(origin: string): string | null {
  try {
    const url = new URL(origin);
    const host = url.hostname;

    if (
      host === 'localhost' ||
      !host.includes('.') ||
      host.startsWith('www.')
    ) {
      return null;
    }

    url.hostname = `www.${host}`;
    return url.origin;
  } catch {
    return null;
  }
}
