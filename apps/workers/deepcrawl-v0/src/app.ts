import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from '@orpc/zod';
import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { getRuntimeKey } from 'hono/adapter';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import pino from 'pino';
import pretty from 'pino-pretty';
import { serveEmojiFavicon } from 'stoker/middlewares';
import packageJSON from '../../package.json' with { type: 'json' };
import { type AppBindings, createContext } from './lib/context';
import { router } from './routers/rpc';

const allowedOrigins = [
  'https://api.deepcrawl.dev',
  'https://deepcrawl.dev',
  'https://app.deepcrawl.dev',
  'http://localhost:3000',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

const app = new Hono<AppBindings>();

// Add essential middleware with proper CORS for API docs
app
  .use('*', requestId())
  .use('*', prettyJSON())
  .use('*', secureHeaders())
  .use('*', trimTrailingSlash())
  .use('*', serveEmojiFavicon('🔗'))
  .use(
    '*',
    pinoLogger({
      pino: pino(
        { level: 'info' },
        process.env.NODE_ENV === 'production' ? undefined : pretty(),
      ),
    }),
  )
  .use(
    '*',
    cors({
      credentials: true,
      origin: allowedOrigins,
      allowHeaders: ['content-type', 'authorization', 'x-requested-with'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      maxAge: 86400, // 24 hours
    }),
  );

const openAPIHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('❌ OpenAPIHandler error', error);
    }),
  ],
  plugins: [
    new ZodSmartCoercionPlugin(),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'DeepCrawl',
          version: packageJSON.version,
        },
        servers: [
          {
            url: '/',
            description: 'Current server',
          },
          {
            url: 'http://localhost:8787',
            description: 'Development server',
          },
          {
            url: 'https://api.deepcrawl.dev',
            description: 'Production server',
          },
        ],
        commonSchemas: {},
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
      },
      docsConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: 'default-token',
            },
          },
        },
        defaultServer: {
          url: '/',
          description: 'Current server',
        },
      },
      specPath: '/openapi',
      docsPath: '/docs',
    }),
  ],
});

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('❌ RPCHandler error', error);
    }),
  ],
});

// Handle RPC routes first (more specific)
app.use('/rpc/*', async (c, next) => {
  const context = await createContext({ context: c });
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context: context,
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

// Handle API routes - all routes from your contract
app.all('*', async (c) => {
  const context = await createContext({ context: c });
  const { matched, response } = await openAPIHandler.handle(c.req.raw, {
    context: context,
  });

  if (matched && response) {
    return response;
  }

  // Default response for unmatched routes
  if (c.req.path === '/') {
    if (getRuntimeKey() === 'workerd') {
      return c.text('OK - Cloudflare');
    }
    return c.text('OK');
  }

  return c.notFound();
});

export default app;
