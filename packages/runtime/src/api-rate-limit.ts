export type ApiRateLimitTier = 'free' | 'pro';

export type ApiRateLimitRule = Readonly<{
  limit: number;
  window: string;
}>;

// Single source of truth for the v0 API rate limit policy.
//
// Notes:
// - The v0 API worker enforces these limits (not the auth service).
// - Today, all users are treated as `free`. The `pro` tier is only a placeholder
//   example and is not used anywhere yet.
// - These defaults are intentionally small; operators can disable enforcement
//   entirely via `ENABLE_API_RATE_LIMIT=false`.
//
// If we ever need grouped rate limits (shared quotas across multiple
// operations), do it via a stable "group key" that becomes the limiter prefix:
// - Add an operation -> group mapping (e.g. `read`, `crawl`, `logs`)
// - Define rules as `group -> tier -> { limit, window }`
// - In the middleware, resolve the group + tier, and use `ratelimit:${group}`
//   as the Upstash prefix so all operations in the group share the same bucket.
export const API_RATE_LIMIT_RULES = {
  getMarkdown: {
    free: {
      limit: 20,
      window: '60 s',
    },
    pro: {
      limit: 100,
      window: '60 s',
    },
  },
  readURL: {
    free: {
      limit: 20,
      window: '60 s',
    },
    pro: {
      limit: 100,
      window: '60 s',
    },
  },
  getLinks: {
    free: {
      limit: 20,
      window: '60 s',
    },
    pro: {
      limit: 100,
      window: '60 s',
    },
  },
  extractLinks: {
    free: {
      limit: 20,
      window: '60 s',
    },
    pro: {
      limit: 100,
      window: '60 s',
    },
  },
  listLogs: {
    free: {
      limit: 30,
      window: '60 s',
    },
    pro: {
      limit: 100,
      window: '60 s',
    },
  },
  getOne: {
    free: {
      limit: 50,
      window: '60 s',
    },
    pro: {
      limit: 200,
      window: '60 s',
    },
  },
} as const satisfies Record<string, Record<ApiRateLimitTier, ApiRateLimitRule>>;

export type ApiRateLimitOperation = keyof typeof API_RATE_LIMIT_RULES;

function getEnvValue(env: unknown, key: string): unknown {
  if (!env || typeof env !== 'object') {
    return;
  }

  return (env as Record<string, unknown>)[key];
}

function getEnvString(env: unknown, key: string): string | undefined {
  const value = getEnvValue(env, key);
  if (typeof value !== 'string') {
    return;
  }

  return value;
}

function resolveBool(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized);
}

export function resolveApiRateLimitEnabled(
  env: unknown,
  fallback = true,
): boolean {
  return resolveBool(getEnvValue(env, 'ENABLE_API_RATE_LIMIT'), fallback);
}

export function resolveUpstashRedisCredentials(
  env: unknown,
): { url: string; token: string } | null {
  const url = getEnvString(env, 'UPSTASH_REDIS_REST_URL')?.trim();
  const token = getEnvString(env, 'UPSTASH_REDIS_REST_TOKEN')?.trim();

  if (!(url && token)) {
    return null;
  }

  return { url, token };
}
