// import type { auth } from '@deepcrawl/auth/lib/auth';
// import {
//   adminClient,
//   genericOAuthClient,
//   inferAdditionalFields,
//   multiSessionClient,
//   oidcClient,
//   organizationClient,
//   passkeyClient,
//   twoFactorClient,
// } from 'better-auth/client/plugins';
// import { createAuthClient } from 'better-auth/react';
// import { toast } from 'sonner';

// export const authClient = createAuthClient({
//   plugins: [
//     organizationClient(),
//     twoFactorClient({
//       onTwoFactorRedirect() {
//         window.location.href = '/two-factor';
//       },
//     }),
//     passkeyClient(),
//     adminClient(),
//     multiSessionClient(),
//     // oneTapClient({
//     // 	clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
//     // 	promptOptions: {
//     // 		maxAttempts: 1,
//     // 	},
//     // }),
//     oidcClient(),
//     genericOAuthClient(),
//     inferAdditionalFields<typeof auth>(),
//   ],
//   baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8787',
//   basePath: '/api/auth',
//   fetchOptions: {
//     credentials: 'include',
//     onError(e) {
//       if (e.error.status === 429) {
//         toast.error('Too many requests. Please try again later.');
//       }
//     },
//   },
// });

// export const {
//   signUp,
//   signIn,
//   signOut,
//   useSession,
//   organization,
//   useListOrganizations,
//   useActiveOrganization,
// } = authClient;
