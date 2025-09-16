import { createAuth } from '@auth/lib/better-auth';
import type { AppContext } from '@auth/lib/context';
import { createMiddleware } from 'hono/factory';

export const authInstanceMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const auth = createAuth(c.env);
    c.set('betterAuth', auth);
    await next();
  },
);

export const authContextMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const auth = c.var.betterAuth;
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.session) {
      c.set('user', null);
      c.set('session', null);
      return next();
    }

    // Set both the user and session objects from the session response
    c.set('user', session.user);
    c.set('session', session.session);

    await next();
  },
);
