import { Hono } from 'hono';
import type { AppContext } from '@/lib/context';

export const validateAPIKeyRouter = new Hono<AppContext>();

validateAPIKeyRouter.post('/getSessionWithAPIKey', async (c) => {
  const { apiKey } = await c.req.json();
  const auth = c.var.betterAuth;
  const session = await auth.api.getSession({
    headers: new Headers({
      ...c.req.raw.headers,
      'x-api-key': apiKey,
    }),
  });
  return c.json(session);
});
