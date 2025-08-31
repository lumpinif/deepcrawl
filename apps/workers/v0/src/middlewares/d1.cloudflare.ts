import { createDBD1 } from '@deepcrawl/db-d1';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

export const dbD1Middleware = createMiddleware<AppBindings>(async (c, next) => {
  c.set('dbd1', createDBD1(c.env.DB_V0));
  return next();
});
