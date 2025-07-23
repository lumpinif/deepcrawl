import type { Session } from '@deepcrawl/auth/types';
import { createMiddleware } from 'hono/factory';
import type { AppBindings, AppContext, AppVariables } from '@/lib/context';
import { logDebug, logError, logWarn } from '@/utils/loggers';
import { getAuthClient } from './client.auth';

const setAuthContext = (c: AppContext, session: Session | null) => {
  c.set('session', session);
};

const parseSessionResponse = async (
  response: Response,
  env: AppBindings['Bindings'],
  source: string,
): Promise<Session | null> => {
  try {
    const responseText = await response.text();

    if (!responseText?.trim()) {
      logWarn(env, `⚠️ [checkAuth] Empty response from ${source}`);
      return null;
    }

    const session: Session = JSON.parse(responseText);
    return session;
  } catch (error) {
    logError(env, `❌ [checkAuth] JSON parse failed (${source}):`, error);
    return null;
  }
};

const fetchWithFallback = async (
  request: Request,
  serviceFetcher: AppVariables['serviceFetcher'],
  env: AppBindings['Bindings'],
): Promise<{ response: Response; source: string }> => {
  // Try service binding first
  let response = await serviceFetcher(request);
  logDebug(env, '🚀 SERVICE BINDINGS RPC FETCHER:', response.statusText);

  if (response.ok) {
    const text = await response.clone().text();
    if (text?.trim()) {
      return { response, source: 'service binding' };
    }
  }

  // Fallback to direct fetch
  logDebug(env, `⚠️ [checkAuth] Service binding failed, trying direct fetch...`);
  response = await fetch(request);
  return { response, source: 'direct fetch' };
};

export const cookieAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const start = performance.now();
    if (
      c.get('session') ||
      c.get('session')?.session ||
      c.get('session')?.user
    ) {
      logDebug(c.env, '✅ Skipping [checkCookieAuthMiddleware] Session found');
      return next();
    }

    const serviceFetcher = c.var.serviceFetcher;
    const customFetcher = c.var.customFetcher;

    try {
      // 1. Try Better Auth client first
      const authClient = getAuthClient(c, {
        fetchOptions: {
          customFetchImpl: customFetcher,
        },
      });

      const authSession = await authClient.getSession();
      logDebug(
        c.env,
        '🛡️  BETTER-AUTH CLIENT WITH SBF:',
        authSession.data?.session ? 'OK' : 'NO SESSION',
      );

      if (authSession.data) {
        setAuthContext(c, authSession.data);
        const end = performance.now();
        logDebug(
          c.env,
          '⌚ Cookie auth middleware took:',
          ((end - start) / 1000).toFixed(3),
          'seconds',
        );
        return next();
      }

      // 2. Fallback to direct API calls
      const authUrl = `${c.env.BETTER_AUTH_URL}/api/auth/get-session`;
      const request = new Request(authUrl, {
        headers: new Headers(c.req.raw.headers),
      });

      const { response, source } = await fetchWithFallback(
        request,
        serviceFetcher,
        c.env,
      );

      const session = await parseSessionResponse(response, c.env, source);
      setAuthContext(c, session);

      const end = performance.now();
      logDebug(
        c.env,
        '⌚ Cookie auth middleware took:',
        ((end - start) / 1000).toFixed(3),
        'seconds',
      );
      return next();
    } catch (error) {
      // Never throw - always continue gracefully
      logError(c.env, `❌ [checkAuth] Authentication error:`, error);
      setAuthContext(c, null);
      return next();
    }
  },
);
