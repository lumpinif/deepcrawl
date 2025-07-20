import type { Session } from '@deepcrawl/auth/types';
import { createMiddleware } from 'hono/factory';
import type { AppBindings, AppContext, AppVariables } from '@/lib/context';
import { logDebug, logError, logWarn } from '@/utils/loggers';
import { getAuthClient } from './auth.client';

interface AuthResult {
  user: Session['user'] | null;
  session: Session['session'] | null;
}

const setAuthContext = (c: AppContext, result: AuthResult) => {
  c.set('user', result.user);
  c.set('session', result.session);
};

const parseSessionResponse = async (
  response: Response,
  env: AppBindings['Bindings'],
  source: string,
): Promise<AuthResult> => {
  try {
    const responseText = await response.text();

    if (!responseText?.trim()) {
      logWarn(env, `⚠️ [checkAuth] Empty response from ${source}`);
      return { user: null, session: null };
    }

    const session: Session = JSON.parse(responseText);
    return session?.session
      ? { user: session.user, session: session.session }
      : { user: null, session: null };
  } catch (error) {
    logError(env, `❌ [checkAuth] JSON parse failed (${source}):`, error);
    return { user: null, session: null };
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

export const checkCookieAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    if (c.get('session') && c.get('user')) {
      logDebug(
        c.env,
        '✅ Skipping [checkCookieAuthMiddleware] Session and user found',
      );
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
        setAuthContext(c, {
          user: authSession.data.user,
          session: authSession.data.session,
        });
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

      const authResult = await parseSessionResponse(response, c.env, source);
      setAuthContext(c, authResult);

      return next();
    } catch (error) {
      // Never throw - always continue gracefully
      logError(c.env, `❌ [checkAuth] Authentication error:`, error);
      setAuthContext(c, { user: null, session: null });
      return next();
    }
  },
);
