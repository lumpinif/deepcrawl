import {
  API_RATE_LIMIT_RULES,
  type ApiRateLimitOperation,
  resolveApiRateLimitEnabled,
  resolveUpstashRedisCredentials,
} from '@deepcrawl/runtime';
import { type Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';
import { EPHEMERAL_CACHE } from '@/app';
import type { AppBindings } from '@/lib/context';
import { publicProcedures } from '@/orpc';
import { logDebug, logWarn } from '@/utils/loggers';

// Create rate limiters at module level to reuse across requests
const rateLimiters = new Map<string, Ratelimit>();

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
  operation: ApiRateLimitOperation,
  env: AppBindings['Bindings'],
): Ratelimit | null {
  const key = `${operation}-free`; // Using free tier for now

  const rateLimitEnabled = resolveApiRateLimitEnabled(env, true);
  if (!rateLimitEnabled) {
    return null;
  }

  const credentials = resolveUpstashRedisCredentials(env);
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
        API_RATE_LIMIT_RULES[operation].free.limit,
        API_RATE_LIMIT_RULES[operation].free.window as Duration,
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
  operation: ApiRateLimitOperation;
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
