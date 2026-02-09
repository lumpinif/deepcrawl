import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

export const serviceFetcherMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    // Auth worker binding is optional in some deployments (e.g. AUTH_MODE=jwt/none),
    // so we must be defensive at runtime.
    //
    // We intentionally avoid relying on generated binding types here because
    // template/CLI deployments may omit the auth worker entirely.
    const authWorker = (
      c.env as unknown as { AUTH_WORKER?: { fetch: typeof fetch } }
    ).AUTH_WORKER;

    const serviceFetcher =
      typeof authWorker?.fetch === 'function'
        ? authWorker.fetch.bind(authWorker)
        : fetch;
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
