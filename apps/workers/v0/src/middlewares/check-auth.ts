import { env } from 'cloudflare:workers';
import type { AppBindings } from '@/lib/context';
import type { Session } from '@deepcrawl/auth/types';
import { createMiddleware } from 'hono/factory';

export const checkAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const headers = c.req.raw.headers;

    const request = new Request(
      `${c.env.BETTER_AUTH_URL}/api/auth/get-session`,
      {
        headers: headers,
      },
    );

    let response: Response;
    try {
      response = await c.env.AUTH_WORKER.fetch(request);

      if (env.WORKER_NODE_ENV === 'development') {
        console.log('🚀 ~ RPC AUTH_WORKER:', response.statusText);
      }

      // fallback to fetch if RPC fails
      if (!response.ok) {
        response = await fetch(request);
      }

      const session: Session = await response.json();

      if (!session || !session.session) {
        c.set('user', null);
        c.set('session', null);
        // Continue to next middleware/handler
        return next();
      }

      // Set both the user and session objects from the session response
      c.set('user', session.user);
      c.set('session', session.session);

      await next();
    } catch (error) {
      return next();
    }
  },
);
