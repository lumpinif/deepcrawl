// import type { Schema } from 'hono';

// import { OpenAPIHono } from '@hono/zod-openapi';
// import { cors } from 'hono/cors';
// import { prettyJSON } from 'hono/pretty-json';
// import { requestId } from 'hono/request-id';
// import { secureHeaders } from 'hono/secure-headers';
// import { trimTrailingSlash } from 'hono/trailing-slash';
// import { notFound, serveEmojiFavicon } from 'stoker/middlewares';

// import type { AppBindings } from '@/lib/context';
// import { defaultErrorHook, errorHandler } from '@/middlewares/error';
// import type { AppOpenAPI } from './types';

// const allowedOrigins = [
//   'https://api.deepcrawl.dev',
//   'https://deepcrawl.dev',
//   'https://deepcrawl.dev',
//   'http://localhost:3000',
//   'http://127.0.0.1:8787',
// ];

// export function createRouter() {
//   return new OpenAPIHono<AppBindings>({
//     strict: false,
//     defaultHook: defaultErrorHook,
//   });
// }

// export default function createApp() {
//   const app = createRouter();

//   app
//     .use('*', requestId())
//     .use('*', secureHeaders())
//     .use('*', serveEmojiFavicon('🔗'))
//     .use('*', trimTrailingSlash())
//     .use(
//       '*',
//       cors({
//         credentials: true,
//         origin: allowedOrigins,
//         allowHeaders: ['content-type'],
//         allowMethods: ['GET', 'POST', 'OPTIONS'],
//       }),
//     )
//     .use('*', prettyJSON());

//   // app.use('*', freeUserRateLimiter);

//   app.notFound(notFound);
//   app.onError(errorHandler);
//   return app;
// }

// export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
//   return createApp().route('/', router);
// }
