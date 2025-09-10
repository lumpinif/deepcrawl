import { createAuthClientConfig } from '@deepcrawl/auth/configs';
import type { auth } from '@deepcrawl/auth/lib/auth';
import { assertValidAuthConfiguration } from '@deepcrawl/auth/utils/config-validator';
import type { ClientOptions } from 'better-auth';
import {
  inferAdditionalFields,
  lastLoginMethodClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';

// Support both integrated Next.js auth and external worker for backward compatibility
// Default to using external auth worker (NEXT_PUBLIC_USE_AUTH_WORKER defaults to true)
// Only use Next.js API routes when explicitly set to 'false'
const getAuthBaseURL = () => {
  // Default to true if not set (external auth worker mode)
  const useAuthWorker = process.env.NEXT_PUBLIC_USE_AUTH_WORKER !== 'false';
  const isDevelopment = process.env.NODE_ENV === 'development';

  let baseAuthURL: string;

  // Determine base URL based on auth mode and environment
  if (useAuthWorker) {
    // External auth worker mode
    baseAuthURL = isDevelopment
      ? 'http://localhost:8787'
      : 'https://auth.deepcrawl.dev';
  } else {
    // Next.js integrated auth mode
    baseAuthURL = isDevelopment
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_APP_URL || 'https://deepcrawl.dev';
  }

  // Fallback if no auth URL is configured
  if (!baseAuthURL) {
    console.warn('⚠️ No BETTER_AUTH_URL configured');
    throw new Error('⚠️ No BETTER_AUTH_URL configured');
  }

  // Validate configuration consistency (not graceful)
  assertValidAuthConfiguration({
    useAuthWorker: useAuthWorker,
    betterAuthUrl: baseAuthURL,
    isDevelopment,
    context: 'client',
  });

  return baseAuthURL;
};

const authClientConfig = createAuthClientConfig({
  basePath: '/api/auth',
  baseURL: getAuthBaseURL(),
}) satisfies ClientOptions;

export const authClient = createAuthClient({
  ...authClientConfig,
  plugins: [
    ...authClientConfig.plugins,
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/auth/two-factor';
      },
    }),
    lastLoginMethodClient({
      cookieName: 'dc-lastLoginMethod',
    }),
    inferAdditionalFields<typeof auth>(),
    // oneTapClient({
    // 	clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    // 	promptOptions: {
    // 		maxAttempts: 1,
    // 	},
    // }),
  ],
  fetchOptions: {
    ...authClientConfig.fetchOptions,
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
