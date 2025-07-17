import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

export const serviceFetcherMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const serviceFetcher = c.env.AUTH_WORKER.fetch.bind(c.env.AUTH_WORKER);
    c.set('serviceFetcher', serviceFetcher);
    return next();
  },
);
