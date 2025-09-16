import type { AppContext } from '@auth/lib/context';
import {
  authContextMiddleware,
  authInstanceMiddleware,
} from '@auth/middlewares/auth';
import { deepCrawlCors } from '@auth/middlewares/cors';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';

export default function createHonoApp() {
  const app = new Hono<AppContext>();

  // Apply custom CORS middleware first (must be before routes)
  app.use('*', deepCrawlCors);

  // Apply other middleware in order
  app
    .use('*', logger())
    .use('*', requestId())
    .use('*', prettyJSON())
    .use('*', secureHeaders())
    .use('*', trimTrailingSlash())
    .use('*', serveEmojiFavicon('🛡️'))
    .use('*', authInstanceMiddleware)
    .use('*', authContextMiddleware);

  // /* Mount the handler, the path should be synced with the configs in auth.worker.ts */
  app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return c.var.betterAuth.handler(c.req.raw);
  });

  app.onError(onError);
  app.notFound(notFound);

  return app;
}
