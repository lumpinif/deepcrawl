import type { Session } from '@deepcrawl/auth/types';
import { resolveBetterAuthApiBaseUrl } from '@deepcrawl/auth/utils/better-auth-url';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';
import { resolveAuthMode } from '@/utils/auth-mode';
import { logDebug, logWarn } from '@/utils/loggers';

interface AuthWorkerLike {
  getSessionWithAPIKey(apiKey: string): Promise<Session | undefined>;
}

function isAuthWorkerLike(value: unknown): value is AuthWorkerLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).getSessionWithAPIKey ===
      'function'
  );
}

function normalizeApiKey(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractApiKeyFromAuthorizationHeader(
  authorization: string | undefined,
): string | null {
  if (!authorization) {
    return null;
  }

  // Per RFC 7235, auth scheme comparison is case-insensitive.
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token && token.length > 0 ? token : null;
}

export const apiKeyAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const start = performance.now();
    if (resolveAuthMode(c.env.AUTH_MODE) !== 'better-auth') {
      return next();
    }

    if (c.get('session')) {
      logDebug('✅ Skipping [apiKeyAuthMiddleware] Session found');
      return next();
    }

    // First, try to get API key from x-api-key header
    const xApiKey = c.req.header('x-api-key');
    const authHeader = c.req.header('authorization');

    const apiKey =
      normalizeApiKey(xApiKey) ??
      extractApiKeyFromAuthorizationHeader(authHeader);

    logDebug('🔑 API key provided:', apiKey);

    if (!apiKey) {
      logDebug('🔑 No API key provided, skipping to next auth method');

      // skip to next cookie-based auth method
      return next();
    }

    try {
      let sessionData: Session | undefined;

      // First, try using the service binding RPC call
      // AUTH_WORKER is an optional binding in template deployments.
      // Better Auth can run in the dashboard (Next.js) instead of a dedicated auth worker,
      // so we treat the service binding as a best-effort optimization.
      //
      // Note: We intentionally keep this binding loosely typed because some
      // template/CLI deployments do not include an auth worker at all.
      const authWorkerCandidate = (
        c.env as unknown as { AUTH_WORKER?: unknown }
      ).AUTH_WORKER;
      if (isAuthWorkerLike(authWorkerCandidate)) {
        try {
          logDebug(
            '🔄 Attempting RPC call to AUTH_WORKER.getSessionWithAPIKey',
          );
          const rpcStartTime = performance.now();

          sessionData = await authWorkerCandidate.getSessionWithAPIKey(apiKey);

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
          const betterAuthUrl = c.env.BETTER_AUTH_URL;
          if (typeof betterAuthUrl !== 'string' || !betterAuthUrl.trim()) {
            logWarn(
              '⚠️ [apiKeyAuthMiddleware] BETTER_AUTH_URL is missing; skipping Better Auth get-session fetch fallback.',
            );
            return next();
          }

          const authApiBaseUrl = resolveBetterAuthApiBaseUrl(betterAuthUrl);
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
