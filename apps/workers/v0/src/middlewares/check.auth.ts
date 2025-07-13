import type { AppBindings } from '@/lib/context';
import type { Session } from '@deepcrawl/auth/types';
import { createMiddleware } from 'hono/factory';
import { getAuthClient } from './auth.client';

export const checkAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const headers = c.req.raw.headers;
    // Create a new Headers object to avoid modification issues
    const requestHeaders = new Headers(headers);

    const serviceFetcher = c.var.serviceFetcher;

    // Custom Service Bindings Fetch
    const customFetcher = async (
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

    try {
      // 1. Try Better Auth client with SBF first
      const authClient = getAuthClient(c, {
        fetchOptions: {
          customFetchImpl: customFetcher,
        },
      });

      const authSession = await authClient.getSession();

      if (c.env.WORKER_NODE_ENV === 'development') {
        console.log(
          '🚀 ~ BETTER-AUTH CLIENT WITH SBF:',
          authSession.data?.session ? 'OK' : 'NO SESSION',
        );
      }

      if (authSession.data) {
        c.set('user', authSession.data.user);
        c.set('session', authSession.data.session);
        return next();
      }

      // 2. Fallback to Service Bindings Fetch
      const request = new Request(
        `${c.env.BETTER_AUTH_URL}/api/auth/get-session`,
        {
          headers: requestHeaders,
        },
      );

      let response = await serviceFetcher(request);

      if (c.env.WORKER_NODE_ENV === 'development') {
        console.log('🚀 ~ SERVICE BINDINGS RPC FETCHER:', response.statusText);
      }

      // fallback to fetch if SBF fails
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
