import { Hono } from 'hono';

import type { AppBindings } from '@/lib/context';
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
    // .use('*', authInstanceMiddleware)
    .use('*', prettyJSON());

  // app.use('*', authInstanceMiddleware).use('*', authContextMiddleware);

  /* Mount the handler, the path should be synced with the configs in auth.worker.ts */
  // app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  //   return c.var.betterAuth.handler(c.req.raw);
  // });

  app.notFound(notFound);

  return app;
}
