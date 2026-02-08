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

function isProbablyIpAddress(hostname: string): boolean {
  if (hostname.includes(':')) {
    // IPv6
    return true;
  }

  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return false;
  }

  return hostname.split('.').every((part) => {
    const value = Number(part);
    return Number.isInteger(value) && value >= 0 && value <= 255;
  });
}

export function getApexDomainFromHostname(hostname: string): string | null {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!normalized) {
    return null;
  }

  if (normalized === 'localhost' || isProbablyIpAddress(normalized)) {
    return normalized;
  }

  const parts = normalized.split('.').filter(Boolean);
  if (parts.length < 2) {
    return normalized;
  }

  // Naive eTLD+1 approximation (last 2 labels).
  // This keeps the logic small and works for most typical apex domains.
  return parts.slice(-2).join('.');
}

export function getApexDomainFromUrl(rawUrl: string): string | null {
  try {
    const url = new URL(ensureAbsoluteUrl(rawUrl));
    return getApexDomainFromHostname(url.hostname);
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
