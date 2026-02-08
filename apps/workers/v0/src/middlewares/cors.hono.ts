import { resolveTrustedOrigins } from '@deepcrawl/auth/configs/constants';
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
  // Default to non-credentialed CORS. The Hono middleware enables credentials
  // only for trusted origins to support cookie sessions safely.
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
  const isDevelopment = c.env.WORKER_NODE_ENV === 'development';
  const appUrl = c.env.NEXT_PUBLIC_APP_URL;
  const requestOrigin = c.req.header('Origin');

  // Public API should be callable from anywhere (including browsers) using API keys.
  // If a trusted origin is calling us, allow credentialed requests (cookies).
  // Otherwise, keep credentials disabled to avoid leaking sessions across origins.
  const betterAuthUrl = c.env.BETTER_AUTH_URL;
  const apiUrl = c.env.API_URL;

  // Note: in AUTH_MODE=jwt/none (API-only deployments), BETTER_AUTH_URL may be
  // intentionally unset. In that case, we do not enable credentialed CORS.
  const trustedOrigins =
    appUrl && betterAuthUrl && apiUrl
      ? new Set(
          resolveTrustedOrigins({
            appURL: appUrl,
            authURL: betterAuthUrl,
            apiURL: apiUrl,
            isDevelopment,
          }),
        )
      : new Set<string>();

  const allowCredentials = !!requestOrigin && trustedOrigins.has(requestOrigin);

  return cors({
    origin: (origin) => origin,
    credentials: allowCredentials,
    maxAge: CORS_OPTIONS.maxAge,
    allowMethods: CORS_OPTIONS.allowMethods,
    allowHeaders: CORS_OPTIONS.allowHeaders,
    exposeHeaders: CORS_OPTIONS.exposeHeaders,
  })(c, next);
});

export default deepCrawlCors;
