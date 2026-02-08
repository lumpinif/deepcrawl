import {
  ensureAbsoluteUrl,
  getApexDomainFromUrl,
} from '@deepcrawl/runtime/urls';
import { isBetterAuthMode } from '@/lib/auth-mode';

function resolveDashboardOrigin(): string | null {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  const envOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.VERCEL_URL;

  return envOrigin ? ensureAbsoluteUrl(envOrigin) : null;
}

function resolveApiBaseUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL?.trim();
  return value ? value : null;
}

/**
 * `PLAYGROUND_API_KEY` is a cross-domain escape hatch for self-hosted deployments
 * where session cookies cannot be shared with the dashboard domain.
 *
 * If the API and dashboard are on the same apex domain, the user can (and
 * should) rely on cookie sessions instead of generating API keys.
 */
export function shouldUsePlaygroundApiKey(): boolean {
  if (!isBetterAuthMode()) {
    return false;
  }

  const useAuthWorker = process.env.NEXT_PUBLIC_USE_AUTH_WORKER !== 'false';
  if (!useAuthWorker) {
    return false;
  }

  const dashboardOrigin = resolveDashboardOrigin();
  const apiBaseUrl = resolveApiBaseUrl();

  if (!(dashboardOrigin && apiBaseUrl)) {
    // Conservative default: avoid generating sensitive keys when we can't
    // confidently determine the deployment topology.
    return false;
  }

  const dashboardApex = getApexDomainFromUrl(dashboardOrigin);
  const apiApex = getApexDomainFromUrl(apiBaseUrl);
  if (!(dashboardApex && apiApex)) {
    return false;
  }

  return dashboardApex !== apiApex;
}
