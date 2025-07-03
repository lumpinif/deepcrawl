import { createContext } from '@/lib/context';
import createHonoApp from '@/lib/hono/create-hono-app';
import { openAPIHandler } from '@/lib/orpc/openapi.handler';
import { rpcHandler } from '@/lib/orpc/rpc.handler';
import { getRuntimeKey } from 'hono/adapter';
import { getConnInfo } from 'hono/cloudflare-workers';

const app = createHonoApp();

// Health check
app.get('/', (c) => {
  const info = getConnInfo(c);

  return c.json({
    message: 'Deepcrawl Official API',
    runtime: getRuntimeKey(),
    nodeEnv: c.env.WORKER_NODE_ENV,
    connInfo: info,
  });
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

  return c.notFound();
});

export default app;
