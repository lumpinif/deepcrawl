import type { auth } from '@deepcrawl/auth/lib/auth';
import {
  adminClient,
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
const getAuthBaseURL = () => {
  // Check if we should use external auth worker (legacy mode)
  const useExternalWorker = process.env.NEXT_PUBLIC_USE_AUTH_WORKER === 'true';

  if (useExternalWorker) {
    // Legacy external worker mode
    return process.env.NODE_ENV === 'production'
      ? 'https://auth.deepcrawl.dev'
      : 'http://localhost:8787';
  }

  // Default: integrated Next.js auth mode (recommended)
  if (process.env.NODE_ENV === 'production') {
    return (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      'https://app.deepcrawl.dev'
    );
  }

  return 'http://localhost:3000';
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
            process.env.NEXT_PUBLIC_USE_AUTH_WORKER === 'true'
              ? 'external-worker'
              : 'nextjs-integrated',
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
        });
      }
    },
  },
});
