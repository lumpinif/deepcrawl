import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

export const serviceFetcherMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const serviceFetcher = c.env.AUTH_WORKER.fetch.bind(c.env.AUTH_WORKER);
    c.set('serviceFetcher', serviceFetcher);

    const authClientServiceFetcher = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const headers = new Headers(init?.headers);

      // Forward session cookies
      const cookieHeader = c.req.header('cookie');
      if (cookieHeader) {
        headers.set('cookie', cookieHeader);
      }

      return serviceFetcher(input, {
        ...init,
        headers,
      });
    };

    c.set('customFetcher', authClientServiceFetcher);

    return next();
  },
);
