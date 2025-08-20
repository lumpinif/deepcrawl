import { createD1DB } from '@deepcrawl/db-d1';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

export const servicesAppMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    c.set('db', createD1DB(c.env.DB_V0));
    return next();
  },
);
