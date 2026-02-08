import type { Session } from '@deepcrawl/auth/types';
import { resolveBetterAuthApiBaseUrl } from '@deepcrawl/auth/utils/better-auth-url';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';
import { resolveAuthMode } from '@/utils/auth-mode';
import { logDebug } from '@/utils/loggers';

export const apiKeyAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const start = performance.now();
    if (resolveAuthMode(c.env.AUTH_MODE) !== 'better-auth') {
      return next();
    }

    if (
      c.get('session') ||
      c.get('session')?.session ||
      c.get('session')?.user
    ) {
      logDebug('✅ Skipping [apiKeyAuthMiddleware] Session found');
      return next();
    }

    // First, try to get API key from x-api-key header
    const xApiKey = c.req.header('x-api-key');
    const authHeader = c.req.header('authorization');

    const apiKey = xApiKey ?? authHeader?.split(' ')[1];

    logDebug('🔑 API key provided:', apiKey);

    if (!apiKey) {
      logDebug('🔑 No API key provided, skipping to next auth method');

      // skip to next cookie-based auth method
      return next();
    }

    try {
      let sessionData: Session | undefined;

      // First, try using the service binding RPC call
      const authWorker = (
        c.env as unknown as {
          AUTH_WORKER?: {
            getSessionWithAPIKey?: (key: string) => Promise<unknown>;
          };
        }
      ).AUTH_WORKER;

      if (typeof authWorker?.getSessionWithAPIKey === 'function') {
        try {
          logDebug(
            '🔄 Attempting RPC call to AUTH_WORKER.getSessionWithAPIKey',
          );
          const rpcStartTime = performance.now();

          sessionData = (await authWorker.getSessionWithAPIKey(
            apiKey,
          )) as Session;

          const rpcEndTime = performance.now();
          logDebug(
            '✅ RPC call successful, took:',
            ((rpcEndTime - rpcStartTime) / 1000).toFixed(3),
            'seconds',
          );
        } catch (rpcError) {
          logDebug('⚠️ RPC call failed, falling back to HTTP fetch:', rpcError);
        }
      } else {
        logDebug('ℹ️ AUTH_WORKER binding missing, skipping RPC call');
      }

      const fetcher = c.var.serviceFetcher;

      // Preferred HTTP fallback:
      // Better Auth supports returning a session for API keys on `/get-session`
      // when the api-key plugin is enabled with `enableSessionForAPIKeys`.
      if (!sessionData) {
        try {
          const authApiBaseUrl = resolveBetterAuthApiBaseUrl(
            c.env.BETTER_AUTH_URL,
          );
          const request = new Request(`${authApiBaseUrl}/get-session`, {
            method: 'GET',
            headers: {
              'x-api-key': apiKey,
              authorization: `Bearer ${apiKey}`,
            },
          });

          const response = await fetcher(request);
          if (response.ok) {
            sessionData = (await response.json()) as Session;
          } else {
            const errorText = await response.text();
            logDebug('🚨 Auth get-session error:', {
              status: response.status,
              error: errorText,
            });
          }
        } catch (fetchError) {
          logDebug('⚠️ Auth get-session fetch failed:', fetchError);
        }
      }

      // Validate session structure
      if (!sessionData || typeof sessionData !== 'object') {
        logDebug('🚨 Invalid session data structure:', sessionData);
        return next();
      }

      // Check if session exists
      if (!(sessionData.session && sessionData.user)) {
        logDebug('🚨 Missing session or user data:', {
          hasSession: !!sessionData.session,
          hasUser: !!sessionData.user,
        });
        return next();
      }

      // Validate session is active
      if (sessionData.session.expiresAt) {
        const expiresAt = new Date(sessionData.session.expiresAt);
        if (expiresAt < new Date()) {
          logDebug('🚨 Session expired:', {
            expiresAt: sessionData.session.expiresAt,
            now: new Date().toISOString(),
          });
          return next();
        }
      }

      // Type assertion after validation
      const session = sessionData as Session;

      // Set validated session data
      c.set('session', session);

      logDebug('✅ API key authenticated successfully:', {
        userId: session.user.id,
        sessionId: session.session.id,
      });

      const end = performance.now();
      logDebug(
        '⌚ API key auth middleware took:',
        ((end - start) / 1000).toFixed(3),
        'seconds',
      );

      return next();
    } catch (error) {
      logDebug('🚨 Unexpected error in auth middleware:', error);
      // On any unexpected error, continue to next middleware
      return next();
    }
  },
);
