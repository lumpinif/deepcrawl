import { Hono } from 'hono';

import {
  authContextMiddleware,
  authInstanceMiddleware,
} from '@/middlewares/auth';
import type { AppBindings } from '@/types';
import { ALLOWED_ORIGINS } from '@deepcrawl/auth/configs/auth.config';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';

export default function createHonoApp() {
  const app = new Hono<AppBindings>();

  app.use(
    '*',
    cors({
      maxAge: 600,
      credentials: true,
      origin: ALLOWED_ORIGINS,
      exposeHeaders: ['Content-Length'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app
    .use(logger())
    .use('*', requestId())
    .use('*', secureHeaders())
    .use('*', trimTrailingSlash())
    .use('*', serveEmojiFavicon('🗝️'))
    .use('*', authInstanceMiddleware)
    .use('*', prettyJSON());

  app.use('*', authInstanceMiddleware).use('*', authContextMiddleware);

  /* Mount the handler, the path should be synced with the configs in auth.worker.ts */
  app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return c.var.betterAuth.handler(c.req.raw);
  });

  app.onError(onError);
  app.notFound(notFound);

  return app;
}
