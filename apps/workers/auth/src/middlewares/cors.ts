import {
  ALLOWED_ORIGINS,
  DEVELOPMENT_ORIGINS,
} from '@deepcrawl/auth/configs/constants';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import type { AppContext } from '@/lib/context';

/**
 * CORS middleware for DeepCrawl auth service - only allows trusted origins
 */
export const deepCrawlCors = createMiddleware<AppContext>(async (c, next) => {
  const isDevelopment = c.env.AUTH_WORKER_NODE_ENV === 'development';

  // Only allow trusted DeepCrawl origins
  const allowedOrigins = [
    ...ALLOWED_ORIGINS,
    ...(isDevelopment ? DEVELOPMENT_ORIGINS : []),
  ];

  return cors({
    origin: (origin) => {
      // Allow requests with no origin (server-to-server, mobile apps, curl)
      if (!origin) {
        return origin;
      }

      // Check if origin is in allowed list
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '[^.]+');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowed === origin;
      });

      return isAllowed ? origin : null;
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
    exposeHeaders: ['Content-Length', 'Content-Type'],
  })(c, next);
});

export default deepCrawlCors;
