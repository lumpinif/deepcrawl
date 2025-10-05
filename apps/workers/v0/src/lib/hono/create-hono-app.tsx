import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { notFound, serveEmojiFavicon } from 'stoker/middlewares';
import type { AppBindings } from '@/lib/context';
import { apiKeyAuthMiddleware } from '@/middlewares/api-key-auth.hono';
import { connInfoMiddleware } from '@/middlewares/connInfo.hono';
import { cookieAuthMiddleware } from '@/middlewares/cookie-auth.hono';
import deepCrawlCors from '@/middlewares/cors.hono';
import { dbD1Middleware } from '@/middlewares/d1.cloudflare';
import { serviceFetcherMiddleware } from '@/middlewares/service-fetchers.hono';
import { servicesAppMiddleware } from '@/middlewares/services.app';

export default function createHonoApp() {
  const app = new Hono<AppBindings>();

  // Apply custom CORS middleware first (must be before routes)
  app.use('*', deepCrawlCors);

  // Apply other middleware in order
  app
    .use('*', trimTrailingSlash())
    .use('*', serveEmojiFavicon('⚡'))
    .use('*', logger())
    .use('*', requestId())
    .use('*', secureHeaders())

    .use('*', connInfoMiddleware)
    .use('*', serviceFetcherMiddleware)
    .use('*', apiKeyAuthMiddleware) // api-key auth check before cookie auth
    .use('*', cookieAuthMiddleware)

    .use('*', dbD1Middleware)

    .use('*', servicesAppMiddleware)
    .use('*', prettyJSON());

  app.notFound(notFound);

  return app;
}
