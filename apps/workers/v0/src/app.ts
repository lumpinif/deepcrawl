import { getRuntimeKey } from 'hono/adapter';
import { getConnInfo } from 'hono/cloudflare-workers';
import { createContext } from '@/lib/context';
import createHonoApp from '@/lib/hono/create-hono-app';
import { openAPIHandler } from '@/lib/orpc/openapi.handler';
import { rpcHandler } from '@/lib/orpc/rpc.handler';

// Preload heavy modules during worker initialization to reduce cold start time
import '@/services/scrape/scrape.service';
import '@/services/link/link.service';
import '@/services/html-cleaning/html-cleaning.service';
import 'cheerio';
import '@paoramen/cheer-reader';

export const EPHEMERAL_CACHE = new Map();

const app = createHonoApp();

// Health check
app.get('/', (c) => {
  const info = getConnInfo(c);

  return c.json({
    message: 'Welcome to Deepcrawl Official API',
    runtime: getRuntimeKey(),
    nodeEnv: c.env.WORKER_NODE_ENV,
    connInfo: info,
    services: {
      scrapeService: !!c.var.scrapeService,
      linkService: !!c.var.linkService,
      markdownConverter: !!c.var.markdownConverter,
    },
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

// Handle API routes - all routes from contract
const routes = [
  { path: '/docs', methods: ['GET'] },
  { path: '/openapi', methods: ['GET'] },
  { path: '/read', methods: ['GET', 'POST', 'OPTIONS'] },
  { path: '/links', methods: ['GET', 'POST', 'OPTIONS'] },
] as const;

for (const route of routes) {
  for (const method of route.methods) {
    app.on(method, route.path, async (c) => {
      const context = await createContext({ context: c });
      const { matched, response } = await openAPIHandler.handle(c.req.raw, {
        context,
      });

      if (matched && response) {
        return c.newResponse(response.body, response);
      }
    });
  }
}

export default app;
