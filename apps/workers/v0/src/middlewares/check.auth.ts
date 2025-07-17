import type { Session } from '@deepcrawl/auth/types';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';
import { getAuthClient } from './auth.client';

export const checkAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const serviceFetcher = c.var.serviceFetcher;

    // Custom Service Bindings Fetch for Better Auth client
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
      // 1. Try Better Auth client with service bindings first
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

      // 2. Fallback to direct service binding call if Better Auth client fails
      const authUrl = `${c.env.BETTER_AUTH_URL}/api/auth/get-session`;
      const headers = new Headers(c.req.raw.headers);

      const request = new Request(authUrl, {
        headers: headers,
      });

      let response = await serviceFetcher(request);

      if (c.env.WORKER_NODE_ENV === 'development') {
        console.log('🚀 ~ SERVICE BINDINGS RPC FETCHER:', response.statusText);
      }

      let usingDirectFetch = false;

      // 3. Final fallback to direct fetch if service binding fails
      if (!response.ok) {
        if (c.env.WORKER_NODE_ENV === 'development') {
          console.log(
            `⚠️ [checkAuth] Service binding failed, trying direct fetch...`,
          );
        }
        response = await fetch(request);
        usingDirectFetch = true;
      }

      // Parse response - gracefully handle any parsing errors
      try {
        const responseText = await response.text();
        const session: Session = JSON.parse(responseText);

        if (session?.session) {
          c.set('user', session.user);
          c.set('session', session.session);
        } else {
          c.set('user', null);
          c.set('session', null);
        }
      } catch (parseError) {
        // Don't throw - just log and set null values
        if (c.env.WORKER_NODE_ENV === 'development') {
          console.error(
            `❌ [checkAuth] JSON parse failed (${usingDirectFetch ? 'direct fetch' : 'service binding'}):`,
            parseError,
          );
        }
        c.set('user', null);
        c.set('session', null);
      }

      return next();
    } catch (error) {
      // Never throw - always continue gracefully
      if (c.env.WORKER_NODE_ENV === 'development') {
        console.error(`❌ [checkAuth] Authentication error:`, error);
      }
      c.set('user', null);
      c.set('session', null);
      return next();
    }
  },
);
