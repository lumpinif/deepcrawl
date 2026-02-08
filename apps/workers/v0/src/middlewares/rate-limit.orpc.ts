import { type Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';
import { EPHEMERAL_CACHE } from '@/app';
import type { AppBindings } from '@/lib/context';
import { publicProcedures } from '@/orpc';
import { logDebug, logWarn } from '@/utils/loggers';

const RATE_LIMIT_RULES: Record<
  string,
  {
    free: { limit: number; window: Duration };
    pro: { limit: number; window: Duration };
  }
> = {
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
} as const;

// Create rate limiters at module level to reuse across requests
const rateLimiters = new Map<string, Ratelimit>();

type RateLimitEnv = Partial<{
  ENABLE_API_RATE_LIMIT: boolean | string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}>;

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

function resolveUpstashCredentials(
  env: AppBindings['Bindings'],
): { url: string; token: string } | null {
  const url = (env as unknown as RateLimitEnv).UPSTASH_REDIS_REST_URL;
  const token = (env as unknown as RateLimitEnv).UPSTASH_REDIS_REST_TOKEN;

  if (!(typeof url === 'string' && url.trim())) {
    return null;
  }

  if (!(typeof token === 'string' && token.trim())) {
    return null;
  }

  return { url, token };
}

let didWarnMissingUpstash = false;
function warnMissingUpstashOnce() {
  if (didWarnMissingUpstash) {
    return;
  }
  didWarnMissingUpstash = true;
  logWarn(
    '[rate-limit] Upstash is not configured; API rate limiting is disabled. ' +
      'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.',
  );
}

function getRateLimiter(
  operation: keyof typeof RATE_LIMIT_RULES,
  env: AppBindings['Bindings'],
): Ratelimit | null {
  const key = `${operation}-free`; // Using free tier for now

  const rateLimitEnabled = resolveBool(
    (env as unknown as RateLimitEnv).ENABLE_API_RATE_LIMIT,
    true,
  );
  if (!rateLimitEnabled) {
    return null;
  }

  const credentials = resolveUpstashCredentials(env);
  if (!credentials) {
    warnMissingUpstashOnce();
    return null;
  }

  let ratelimit = rateLimiters.get(key);
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      // Avoid Redis.fromEnv() warnings by validating credentials first.
      redis: Redis.fromEnv(env),
      limiter: Ratelimit.slidingWindow(
        RATE_LIMIT_RULES[operation].free.limit,
        RATE_LIMIT_RULES[operation].free.window,
      ),
      ephemeralCache: EPHEMERAL_CACHE,
      analytics: true,
      prefix: `ratelimit:${operation}`,
    });
    rateLimiters.set(key, ratelimit);
  }

  return ratelimit;
}

export function rateLimitMiddleware({
  operation,
}: {
  operation: keyof typeof RATE_LIMIT_RULES;
}) {
  return publicProcedures.middleware(async ({ context: c, next, errors }) => {
    const user = c.var.session?.user;
    const identifier = `${user?.id ?? 'anonymous'}-${c.var.userIP ?? 'unknown-ip'}`;

    const ratelimit = getRateLimiter(operation, c.env);
    if (!ratelimit) {
      return next();
    }

    let result: Awaited<ReturnType<typeof ratelimit.limit>>;
    try {
      result = await ratelimit.limit(identifier);
    } catch (error) {
      // Fail-open: rate limiting is an optional protection layer.
      logWarn('[rate-limit] Failed to enforce rate limit; allowing request.', {
        operation,
        error: error instanceof Error ? error.message : String(error),
      });
      return next();
    }
    c.executionCtx.waitUntil(result.pending);

    logDebug(
      '🧮 RATE_LIMIT_RESULT - REMAINING/TOTAL:',
      result.remaining,
      '/',
      result.limit,
    );

    // If rate limit exceeded, throw error
    if (!result.success) {
      const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000);
      const retryAfterMinutes = Math.floor(retryAfterSeconds / 60);
      const remainingSeconds = retryAfterSeconds % 60;

      const defaultRetryMessage = `Please try again in ${retryAfterMinutes} minutes and ${remainingSeconds} seconds.`;

      throw errors.RATE_LIMITED({
        message: defaultRetryMessage,
        data: {
          operation: operation,
          retryAfter: retryAfterSeconds,
        },
      });
    }

    return next();
  });
}
