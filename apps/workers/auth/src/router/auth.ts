import type { AppContext } from '@auth/lib/context';
import { Hono } from 'hono';

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
