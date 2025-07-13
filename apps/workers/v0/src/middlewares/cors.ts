import type { AppBindings } from '@/lib/context';
import {
  ALLOWED_ORIGINS,
  DEVELOPMENT_ORIGINS,
} from '@deepcrawl/auth/configs/auth.config';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';

/**
 * Hybrid CORS middleware: supports both dashboard cookies and public API access
 */
export const deepCrawlCors = createMiddleware<AppBindings>(async (c, next) => {
  const origin = c.req.header('Origin');
  const hasAuth = !!c.req.header('Authorization');

  // Check if origin is trusted (dashboard, auth worker, etc.)
  const isTrusted =
    origin &&
    [...ALLOWED_ORIGINS, ...DEVELOPMENT_ORIGINS].some((allowed) => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '[^.]+');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    });

  return cors({
    origin: (requestOrigin) => requestOrigin, // Allow all origins
    credentials: isTrusted || hasAuth, // Enable credentials for trusted origins or auth requests
    maxAge: 86400,
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
