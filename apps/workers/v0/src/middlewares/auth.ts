import type { AppBindings } from '@/lib/context';
import { createMiddleware } from 'hono/factory';

export const requireAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const user = c.get('user');
    const session = c.get('session');

    if (!user || !session) {
      return c.json(
        {
          authenticated: false,
          error: 'You are not authenticated',
        },
        401,
      );
    }

    return next();
  },
);
