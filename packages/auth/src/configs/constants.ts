export type ResolveTrustedOriginsInput = {
  appURL: string;
  authURL: string;
  apiURL?: string;
  isDevelopment?: boolean;
};

const LOCAL_DEV_ORIGINS = [
  // Dashboard
  'http://localhost:3000',
  'https://localhost:3000',
  'http://127.0.0.1:3000',
  // Auth worker
  'http://localhost:8787',
  'http://127.0.0.1:8787',
  // V0 worker
  'http://localhost:8080',
  'http://127.0.0.1:8080',
] as const;

function ensureAbsoluteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function toOrigin(rawUrl: string): string | null {
  try {
    return new URL(ensureAbsoluteUrl(rawUrl)).origin;
  } catch {
    return null;
  }
}

function toWwwOrigin(origin: string): string | null {
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

export function resolveTrustedOrigins(
  input: ResolveTrustedOriginsInput,
): string[] {
  const { appURL, authURL, apiURL, isDevelopment = false } = input;

  const origins = new Set<string>();

  const addOrigin = (raw: string, opts?: { withWww?: boolean }) => {
    const origin = toOrigin(raw);
    if (!origin) {
      return;
    }

    origins.add(origin);

    if (opts?.withWww) {
      const www = toWwwOrigin(origin);
      if (www) {
        origins.add(www);
      }
    }
  };

  addOrigin(appURL, { withWww: true });
  addOrigin(authURL);
  if (apiURL) {
    addOrigin(apiURL);
  }

  if (isDevelopment) {
    for (const origin of LOCAL_DEV_ORIGINS) {
      origins.add(origin);
    }
  }

  return Array.from(origins);
}

export const APP_COOKIE_PREFIX = 'deepcrawl';

export const MAX_SESSIONS = 2;

export const COOKIE_CACHE_CONFIG = {
  enabled: true,
  maxAge: 86400 * 1, // 1 day in seconds
} as const;

export const API_KEY_CACHE_CONFIG = {
  TTL_SECONDS: COOKIE_CACHE_CONFIG.maxAge, // sync with cookie cache config
  KEY_PREFIX: 'api_key_session:',
} as const;

/**
 * This is better-auth built-in rate limiting only used for API Keys validation, and we implement cache for API Keys sessions
 * Currently same as the user-scope free rate limit in backend services worker, but it is better to have max requests higher than the highest service rate limit
 */
export const BA_API_KEY_RATE_LIMIT = {
  maxRequests: 20,
  timeWindow: 1000 * 60, // 60 seconds
} as const;

// BUG: OAUTH PROXY CURRENTLY DOES NOT WORK IN LOCALHOST WITH AUTH WORKER
export const USE_OAUTH_PROXY = true;

export const LAST_USED_LOGIN_METHOD_COOKIE_NAME =
  'deepcrawl.last_used_login_method';

export const EMAIL_CONFIG = {
  /**
   * Time in seconds until the magic link expires.
   * @default (60 * 5) // 5 minutes
   *
   */
  EXpiresIn: {
    resetPassword: 3600, // 1 hour
    magicLink: 60 * 5, // 5 minutes
    emailVerification: 3600, // 1 hour
    invitation: 2 * 24 * 60 * 60, // By default, it's 48 hours (2 days)
  },
};
