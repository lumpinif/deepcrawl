import type { Session } from '@deepcrawl/auth/types';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';
import { logDebug } from '@/utils/loggers';

export const apiKeyAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const start = performance.now();
    // First, try to get API key from x-api-key header
    const xApiKey = c.req.header('x-api-key');
    const authHeader = c.req.header('authorization');

    const apiKey = xApiKey ?? authHeader?.split(' ')[1];

    if (apiKey === 'demo-key-for-playground') {
      logDebug('🏗️  skipping API key auth, using cookie auth instead');
      return next();
    }

    logDebug('🔑 apiKey:', apiKey);

    if (!apiKey) {
      logDebug('🔑 No API key provided, skipping to next auth method');
      // return c.json(
      //   { success: false, error: 'Unauthorized: No API key provided' },
      //   401,
      // );

      // skip to next auth method
      return next();
    }

    try {
      let sessionData: Session | undefined;

      // First, try using the service binding RPC call
      try {
        logDebug('🔄 Attempting RPC call to AUTH_WORKER.getSessionWithAPIKey');
        const rpcStartTime = performance.now();

        sessionData = (await c.env.AUTH_WORKER.getSessionWithAPIKey(
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

        // Fallback to HTTP fetch approach
        const request = new Request(
          `${c.env.BETTER_AUTH_URL}/getSessionWithAPIKey`,
          {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey }),
          },
        );

        const fetcher = c.var.serviceFetcher;
        const response = await fetcher(request);

        // Check if the request was successful
        if (!response.ok) {
          const errorText = await response.text();
          logDebug('🚨 Auth service error:', {
            status: response.status,
            error: errorText,
          });

          // For service errors, let it through - auth guard will handle
          if (response.status === 404 || response.status >= 500) {
            logDebug('⚠️ Auth service issue, proceeding to next middleware');
            return next();
          }

          // For invalid API key, also proceed - let auth guard decide
          logDebug('⚠️ Invalid API key, proceeding to next middleware');
          return next();
        }

        // Parse response
        try {
          sessionData = await response.json();
        } catch (parseError) {
          logDebug('🚨 Failed to parse auth response:', parseError);
          // Continue to next middleware on parse errors
          return next();
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
