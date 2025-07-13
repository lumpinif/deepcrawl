import { Hono } from 'hono';

import type { AppBindings } from '@/lib/context';
import { checkAuthMiddleware } from '@/middlewares/check-auth';
import deepCrawlCors from '@/middlewares/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { notFound, serveEmojiFavicon } from 'stoker/middlewares';

export default function createHonoApp() {
  const app = new Hono<AppBindings>();

  // Apply custom CORS middleware first (must be before routes)
  app.use('*', deepCrawlCors);

  // Apply other middleware in order
  app
    .use('*', logger())
    .use('*', requestId())
    .use('*', secureHeaders())
    .use('*', trimTrailingSlash())
    .use('*', serveEmojiFavicon('⚡'))
    .use('*', checkAuthMiddleware)
    .use('*', prettyJSON());

  // Register check-auth route
  app.get('/check-auth', (c) => {
    return c.json({
      user: c.var.user,
      session: c.var.session,
    });
  });

  app.notFound(notFound);

  return app;
}
