import { type Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';
import { EPHEMERAL_CACHE } from '@/app';
import type { AppBindings } from '@/lib/context';
import { publicProcedures } from '@/orpc';
import { logDebug } from '@/utils/loggers';

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
  getLogs: {
    free: {
      limit: 30,
      window: '60 s',
    },
    pro: {
      limit: 100,
      window: '60 s',
    },
  },
  getLog: {
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

function getRateLimiter(
  operation: keyof typeof RATE_LIMIT_RULES,
  env: AppBindings['Bindings'],
): Ratelimit {
  const key = `${operation}-free`; // Using free tier for now

  let ratelimit = rateLimiters.get(key);
  if (!ratelimit) {
    ratelimit = new Ratelimit({
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
    const result = await ratelimit.limit(identifier);
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
