import { getConnInfo } from 'hono/cloudflare-workers';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

export const connInfoMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    if (c.env.WORKER_NODE_ENV === 'development') {
      c.set('userIP', c.env.API_URL ?? 'localhost');
    } else {
      const connInfo = getConnInfo(c);
      c.set('userIP', connInfo.remote.address ?? null);
    }

    return next();
  },
);
