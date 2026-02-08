/**
 * Configuration validation utilities for Deepcrawl Auth.
 *
 * Important:
 * - This must work for Deepcrawl official domains AND for self-hosted/template
 *   deployments (custom domains, free domains, etc).
 * - Validation should be helpful, but not hardcode deepcrawl.dev patterns.
 */

import {
  ensureAbsoluteUrl,
  stripTrailingSlashes,
} from '@deepcrawl/runtime/urls';

interface ValidationConfig {
  useAuthWorker: boolean;
  betterAuthUrl: string;
  isDevelopment: boolean;
  context?: string; // 'client' | 'server' for better error messages
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

function hasApiAuthPath(value: string): boolean {
  // Match `/api/auth` as a path segment (not `/api/authentication`).
  return /\/api\/auth(?=$|\/|\?|#)/.test(value);
}

/**
 * Validates consistency between NEXT_PUBLIC_USE_AUTH_WORKER and the provided
 * Better Auth base URL.
 *
 * This is intentionally permissive:
 * - We validate shape (must be an absolute URL).
 * - We warn for common footguns (e.g. including `/api/auth` in auth-worker mode).
 */
export function validateAuthConfiguration(
  config: ValidationConfig,
): ValidationResult {
  const {
    useAuthWorker,
    betterAuthUrl,
    isDevelopment,
    context = 'unknown',
  } = config;

  if (!betterAuthUrl) {
    return {
      isValid: false,
      error: `[${context}] BETTER_AUTH_URL is required but not provided`,
    };
  }

  const normalized = stripTrailingSlashes(ensureAbsoluteUrl(betterAuthUrl));

  try {
    new URL(normalized);
  } catch {
    return {
      isValid: false,
      error: `[${context}] BETTER_AUTH_URL must be an absolute URL. Received: "${betterAuthUrl}"`,
    };
  }

  let warning: string | undefined;

  if (useAuthWorker && hasApiAuthPath(normalized)) {
    warning = `[${context}] BETTER_AUTH_URL includes "/api/auth", but auth worker mode is enabled. Prefer the auth origin only (e.g. "https://auth.example.com").`;
  }

  if (!useAuthWorker && hasApiAuthPath(normalized)) {
    warning = `[${context}] BETTER_AUTH_URL includes "/api/auth". Prefer the origin only (e.g. "https://app.example.com") and keep basePath separate.`;
  }

  if (
    isDevelopment &&
    normalized.startsWith('https://') &&
    /localhost/.test(normalized)
  ) {
    warning = `[${context}] BETTER_AUTH_URL is https://localhost... If you're not running HTTPS locally, use http://localhost...`;
  }

  return {
    isValid: true,
    warning,
  };
}

/**
 * Throws an error if auth configuration is invalid.
 * Use this for critical validation that should stop execution.
 */
export function assertValidAuthConfiguration(config: ValidationConfig): void {
  const result = validateAuthConfiguration(config);

  if (!result.isValid) {
    throw new Error(`Auth Configuration Error: ${result.error}`);
  }

  if (result.warning && config.isDevelopment) {
    console.warn(`Auth Configuration Warning: ${result.warning}`);
  }
}
