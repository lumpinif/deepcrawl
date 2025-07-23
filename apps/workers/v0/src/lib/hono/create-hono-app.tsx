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
import { serviceFetcherMiddleware } from '@/middlewares/service-fetchers.hono';

export default function createHonoApp() {
  const app = new Hono<AppBindings>();

  // Apply custom CORS middleware first (must be before routes)
  app.use('*', deepCrawlCors);

  // Apply other middleware in order
  app
    .use('*', serveEmojiFavicon('⚡'))
    .use('*', logger())
    .use('*', requestId())
    .use('*', secureHeaders())
    .use('*', trimTrailingSlash())

    .use('*', serviceFetcherMiddleware)
    .use('*', apiKeyAuthMiddleware)
    .use('*', cookieAuthMiddleware)
    .use('*', connInfoMiddleware)

    .use('*', prettyJSON());

  // Register check-auth route
  // app.get('/check-auth', (c) => {
  //   return c.json({
  //     user: c.var.user,
  //     session: c.var.session,
  //   });
  // });

  app.notFound(notFound);

  return app;
}
