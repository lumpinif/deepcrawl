import { resolveBrandConfigFromEnv } from '@deepcrawl/runtime';
import { getRuntimeKey } from 'hono/adapter';
import { getConnInfo } from 'hono/cloudflare-workers';
import { createContext } from '@/lib/context';
import createHonoApp from '@/lib/hono/create-hono-app';
import { openAPIHandler } from '@/lib/openapi/openapi.handler';
import { rpcHandler } from '@/lib/orpc/rpc.handler';

// Preload heavy modules during worker initialization to reduce cold start time
import '@/services/scrape/scrape.service';
import '@/services/link/link.service';
import '@/services/html-cleaning/html-cleaning.service';
import 'cheerio';
import '@paoramen/cheer-reader';

export const EPHEMERAL_CACHE = new Map();

const app = createHonoApp();

// Index & Health check (debug/info)
app.get('/', async (c) => {
  const brand = resolveBrandConfigFromEnv(c.env);
  const info = getConnInfo(c);
  const apiOrigin = new URL(c.req.url).origin;

  return c.json({
    message: `Welcome to ${brand.name} API`,
    brand,
    runtime: getRuntimeKey(),
    nodeEnv: c.env.WORKER_NODE_ENV,
    timestamp: new Date().toISOString(),
    routes: {
      docs: '/docs',
      openapi: '/openapi',
      read: '/read?=url',
      links: '/links?=url',
      logs: '/logs?id=requestId',
      site: apiOrigin,
    },
    connInfo: c.env.WORKER_NODE_ENV === 'development' ? 'development' : info,
    services: {
      scrapeService: !!c.var.scrapeService,
    },
    authentication: c.var.session?.user
      ? { ...c.var.session }
      : 'You are currently not logged in.',
  });
});

// Handle RPC routes first (more specific)
app.use('/rpc/*', async (c, next) => {
  const context = await createContext({ context: c });
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context,
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

// Handle all other routes with OpenAPI handler
app.all('*', async (c) => {
  const context = await createContext({ context: c });
  const { matched, response } = await openAPIHandler.handle(c.req.raw, {
    context,
  });

  if (matched && response) {
    return c.newResponse(response.body, response);
  }

  return c.text('Not Found', 404);
});

// @deprecated old workaround approach
// Handle API routes - all routes from contract
// const routes = [
//   { path: '/docs', methods: ['GET'] },
//   { path: '/openapi', methods: ['GET'] },
//   { path: '/read', methods: ['GET', 'POST', 'OPTIONS'] },
//   { path: '/links', methods: ['GET', 'POST', 'OPTIONS'] },
//   { path: '/logs', methods: ['POST', 'OPTIONS'] },
//   { path: '/logs/:id', methods: ['GET', 'OPTIONS'] },
// ] as const;

// for (const route of routes) {
//   for (const method of route.methods) {
//     app.on(method, route.path, async (c) => {
//       const context = await createContext({ context: c });
//       const { matched, response } = await openAPIHandler.handle(c.req.raw, {
//         context,
//       });

//       if (matched && response) {
//         return c.newResponse(response.body, response);
//       }
//     });
//   }
// }

export default app;
