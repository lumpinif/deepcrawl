import type { AppContext } from '@auth/lib/context';
import { resolveTrustedOrigins } from '@deepcrawl/auth/configs/constants';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';

/**
 * CORS middleware for Deepcrawl auth service - only allows trusted origins
 */
export const deepCrawlCors = createMiddleware<AppContext>(async (c, next) => {
  const isDevelopment = c.env.AUTH_WORKER_NODE_ENV === 'development';

  const allowedOrigins = new Set(
    resolveTrustedOrigins({
      appURL: c.env.NEXT_PUBLIC_APP_URL,
      authURL: c.env.BETTER_AUTH_URL,
      isDevelopment,
    }),
  );

  return cors({
    origin: (origin) => {
      // Allow requests with no origin (server-to-server, mobile apps, curl)
      if (!origin) {
        return origin;
      }

      return allowedOrigins.has(origin) ? origin : null;
    },
    credentials: true, // Always allow credentials for trusted origins
    maxAge: 600,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cookie',
    ],
    exposeHeaders: ['Content-Length', 'Content-Type', 'X-Retry-After'],
  })(c, next);
});

export default deepCrawlCors;
