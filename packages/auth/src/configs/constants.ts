export const PROD_APP_URL = 'https://deepcrawl.dev';
export const PROD_AUTH_WORKER_URL = 'https://auth.deepcrawl.dev';

export const ALLOWED_ORIGINS = [
  // Production origins
  PROD_APP_URL,
  PROD_AUTH_WORKER_URL,
  'https://deepcrawl.dev',
  'https://www.deepcrawl.dev',
  'https://api.deepcrawl.dev',
  'https://*.deepcrawl.dev',
  // Add explicit wildcard support for all deepcrawl.dev subdomains
  '*.deepcrawl.dev',

  // Local development origins
  'http://localhost:3000', // Dashboard
  'https://localhost:3000', // Dashboard HTTPS
  'http://127.0.0.1:3000', // Dashboard alternative
  'http://localhost:8787', // Auth worker
  'http://127.0.0.1:8787', // Auth worker alternative
  'http://localhost:8080', // V0 worker
  'http://127.0.0.1:8080', // V0 worker alternative
];

export const DEVELOPMENT_ORIGINS = [
  // Local development origins
  'http://localhost:3000', // Dashboard
  'https://localhost:3000', // Dashboard HTTPS
  'http://127.0.0.1:3000', // Dashboard alternative
  'http://localhost:8787', // Auth worker
  'http://127.0.0.1:8787', // Auth worker alternative
  'http://localhost:8080', // V0 worker
  'http://127.0.0.1:8080', // V0 worker alternative
];

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
