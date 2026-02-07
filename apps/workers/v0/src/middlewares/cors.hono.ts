import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

type CORSOptions = {
  credentials: boolean;
  maxAge: number;
  allowMethods?: string[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
};

export const CORS_OPTIONS = {
  // Public API should be callable from anywhere (including browsers) using API keys.
  // Keep credentials disabled to avoid leaking cookie-based sessions across origins.
  credentials: false,
  maxAge: 86400,
  allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Cookie',
    'User-Agent',
    'Cache-Control',
    'Pragma',
    'If-Modified-Since',
    'If-None-Match',
  ],
  exposeHeaders: [
    'Content-Length',
    'Content-Type',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Retry-After',
  ],
} satisfies CORSOptions;

/**
 * CORS middleware for public API access
 */
export const deepCrawlCors = createMiddleware<AppBindings>(async (c, next) => {
  return cors({
    origin: (requestOrigin) => requestOrigin,
    credentials: CORS_OPTIONS.credentials,
    maxAge: CORS_OPTIONS.maxAge,
    allowMethods: CORS_OPTIONS.allowMethods,
    allowHeaders: CORS_OPTIONS.allowHeaders,
    exposeHeaders: CORS_OPTIONS.exposeHeaders,
  })(c, next);
});

export default deepCrawlCors;
