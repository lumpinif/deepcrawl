import type { Schema } from 'hono';

import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { notFound, serveEmojiFavicon } from 'stoker/middlewares';

// import { supabaseMiddleware } from '@/middlewares/auth.middleware';
import { pinoLogger } from '@/middlewares/pino-logger';

import { defaultErrorHook, errorHandler } from '@/middlewares/error';
import type { AppBindings, AppOpenAPI } from './types';

const allowedOrigins = [
  'https://deepcrawl.dev',
  'http://localhost:3000',
  'http://127.0.0.1:8787',
];

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: defaultErrorHook,
  });
}

export default function createApp() {
  const app = createRouter();

  app
    .use('*', requestId())
    .use('*', secureHeaders())
    .use('*', serveEmojiFavicon('🔗'))
    .use('*', trimTrailingSlash())
    .use('*', async (c, next) => {
      pinoLogger({ c });
      await next();
    })
    .use(
      '*',
      cors({
        credentials: true,
        origin: allowedOrigins,
        allowHeaders: ['content-type'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
      }),
    )
    .use('/openapi/*', prettyJSON());

  // .use('*', supabaseMiddleware);
  // app.use('*', freeUserRateLimiter);

  app.onError(errorHandler);
  app.notFound(notFound);
  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route('/', router);
}
