import type { auth } from '@deepcrawl/auth/lib/auth';
import { assertValidAuthConfiguration } from '@deepcrawl/auth/utils/config-validator';
import {
  adminClient,
  apiKeyClient,
  genericOAuthClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';

// Support both integrated Next.js auth and external worker for backward compatibility
// Default to using external auth worker (NEXT_PUBLIC_USE_AUTH_WORKER defaults to true)
// Only use Next.js API routes when explicitly set to 'false'
const getAuthBaseURL = () => {
  // Check if we should use Next.js API routes (only when explicitly set to 'false')
  const useNextJSAuth = process.env.NEXT_PUBLIC_USE_AUTH_WORKER === 'false';
  const isDevelopment = process.env.NODE_ENV === 'development';

  let baseAuthURL: string;

  // In client-side code, only variables are available
  const authURL = !useNextJSAuth
    ? isDevelopment // nextjs app
      ? 'http://localhost:3000'
      : 'https://app.deepcrawl.dev'
    : isDevelopment // auth worker (workerd)
      ? 'http://localhost:8787'
      : process.env.NEXT_PUBLIC_APP_URL;

  if (useNextJSAuth) {
    // Next.js integrated auth mode (when explicitly disabled worker)
    if (process.env.NODE_ENV === 'production') {
      // enfore to use nextjs app url for production
      baseAuthURL = authURL as string;
    } else {
      baseAuthURL = authURL || 'http://localhost:3000';
    }
  } else {
    // Default: external auth worker mode
    baseAuthURL =
      process.env.NODE_ENV === 'production'
        ? (authURL as string)
        : authURL || 'http://localhost:8787';
  }

  // Fallback if no auth URL is configured
  if (!baseAuthURL) {
    console.warn('⚠️ No BETTER_AUTH_URL configured, using fallback');
    baseAuthURL = isDevelopment
      ? 'http://localhost:3000'
      : 'https://app.deepcrawl.dev';
  }

  // Validate configuration consistency (not graceful)
  assertValidAuthConfiguration({
    useAuthWorker: !useNextJSAuth,
    betterAuthUrl: baseAuthURL,
    isDevelopment,
    context: 'client',
  });

  return baseAuthURL;
};

export const authClient = createAuthClient({
  basePath: '/api/auth',
  baseURL: getAuthBaseURL(),
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/auth/two-factor';
      },
    }),
    adminClient(),
    apiKeyClient(),
    passkeyClient(),
    magicLinkClient(),
    multiSessionClient(),
    genericOAuthClient(),
    inferAdditionalFields<typeof auth>(),
    // oneTapClient({
    // 	clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    // 	promptOptions: {
    // 		maxAttempts: 1,
    // 	},
    // }),
  ],
  fetchOptions: {
    credentials: 'include',
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
      // Enhanced debugging for production issues
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Auth Client Error:', {
          status: e.error.status,
          message: e.error.message,
          url: e.error.url,
          baseURL: getAuthBaseURL(),
          authMode:
            process.env.NEXT_PUBLIC_USE_AUTH_WORKER === 'false'
              ? 'nextjs-integrated'
              : 'external-worker',
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
});
