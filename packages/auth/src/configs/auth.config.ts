import { getDrizzleDB, schema } from '@deepcrawl/db';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  magicLink,
  multiSession,
  oAuthProxy,
  oneTap,
  openAPI,
  organization,
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import EmailVerification from '../templates/email-verification';
import MagicLink from '../templates/magic-link';
import OrganizationInvitation from '../templates/organization-invitation';
import PasswordReset from '../templates/password-reset';
import { assertValidAuthConfiguration } from '../utils/config-validator';
import {
  createResendClient,
  sendEmail,
  validateEmailConfig,
} from '../utils/email';

/** Ensure this is the same as the env in the worker */
interface Env {
  AUTH_WORKER_NODE_ENV: 'production' | 'development';
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  DATABASE_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  // Email configuration
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  // Auth worker configuration - defaults to true (use auth worker), set to false to use Next.js API routes
  NEXT_PUBLIC_USE_AUTH_WORKER?: boolean;
  NEXT_PUBLIC_APP_URL?: string;
  // workerd
  IS_WORKERD?: boolean;
}

// Secondary storage interface for potential future use with rate limiting
// interface SecondaryStorage {
//   get: (key: string) => Promise<string | null>;
//   set: (key: string, value: string, ttl?: number) => Promise<void>;
//   delete: (key: string) => Promise<void>;
// }

const PROD_APP_URL = 'https://app.deepcrawl.dev';
const PROD_AUTH_WORKER_URL = 'https://auth.deepcrawl.dev';

export const ALLOWED_ORIGINS = [
  // Production origins
  PROD_APP_URL,
  PROD_AUTH_WORKER_URL,
  'https://deepcrawl.dev',
  'https://api.deepcrawl.dev',
  'https://*.deepcrawl.dev',
  // Add explicit wildcard support for all deepcrawl.dev subdomains
  '*.deepcrawl.dev',

  // Local development origins
  'http://localhost:3000', // Dashboard
  'https://localhost:3000', // Dashboard HTTPS
  'http://127.0.0.1:3000', // Dashboard alternative
  'http://localhost:8787', // Auth worker
  'http://127.0.0.1:8787', // Auth worker alternative
];

/**
 * Helper function to generate network origins for mobile testing
 * Usage: Add your computer's local IP address to enable mobile device testing
 */
const generateNetworkOrigins = (
  baseIP: string,
  ports: number[] = [3000, 8787],
) => {
  return ports.flatMap((port) => [
    `http://${baseIP}:${port}`,
    `https://${baseIP}:${port}`, // For HTTPS testing
  ]);
};

export const DEVELOPMENT_ORIGINS = [
  // Local development origins
  'http://localhost:3000', // Dashboard
  'https://localhost:3000', // Dashboard HTTPS
  'http://127.0.0.1:3000', // Dashboard alternative
  'http://localhost:8787', // Auth worker
  'http://127.0.0.1:8787', // Auth worker alternative

  // 🔧 TO ADD YOUR NETWORK CONFIGURATION:
  // 1. Find your computer's IP address:
  //    - Windows: Run `ipconfig` and look for IPv4 Address
  //    - Mac: Run `ifconfig | grep "inet "` or check System Preferences > Network
  //    - Linux: Run `ip addr show` or `hostname -I`
  //
  // 2. Uncomment and replace YOUR_COMPUTER_IP with your actual IP:
  // ...generateNetworkOrigins('YOUR_COMPUTER_IP'), // e.g., '192.168.1.100'

  ...generateNetworkOrigins('192.18.0.1'),
  ...generateNetworkOrigins('192.168.50.198'),
  ...generateNetworkOrigins('192.168.50.74'),

  // 3. Common network examples (uncomment if they match your setup):
  ...generateNetworkOrigins('192.168.1.100'), // Common home network IP
  ...generateNetworkOrigins('192.168.0.100'), // Alternative common range
  // ...generateNetworkOrigins('10.0.0.100'),    // Corporate network range
  // ...generateNetworkOrigins('172.16.0.100'),  // Docker/container range

  // 📱 TESTING FROM YOUR IPHONE:
  // 1. Make sure your iPhone is on the same Wi-Fi network
  // 2. Add your computer's IP using generateNetworkOrigins() above
  // 3. On your iPhone, navigate to: http://YOUR_COMPUTER_IP:3000
  // 4. The auth should now work seamlessly across devices!
];

export const MAX_SESSIONS = 2;

const USE_OAUTH_PROXY = true;

const getBaseURL = (envUrl: string | undefined): string => {
  if (!envUrl) {
    throw new Error('❌ [getBaseURL] URL is not defined');
  }

  // Add protocol if missing
  const urlWithProtocol = envUrl.startsWith('http')
    ? envUrl
    : `https://${envUrl}`;

  // Remove trailing slash
  return urlWithProtocol.replace(/\/+$/, '');
};

export const PLAYGROUND_API_KEY_CONFIG = {
  name: 'PLAYGROUND_API_KEY',
  prefix: 'dc_',
  rateLimitMax: 100,
  rateLimitEnabled: true,
  rateLimitTimeWindow: 1000 * 60 * 60 * 24, // 24 hours
  metadata: {
    type: 'auto-generated',
    purpose: 'playground',
    createdAt: new Date().toISOString(),
  },
};

/** Important: make sure always import this explicitly in workers to resolve process.env issues
 *  Factory function that accepts environment variables from cloudflare env
 */
export function createAuthConfig(env: Env) {
  const baseAuthURL = getBaseURL(env.BETTER_AUTH_URL);
  const appURL = getBaseURL(env.NEXT_PUBLIC_APP_URL);
  const isDevelopment = env.AUTH_WORKER_NODE_ENV === 'development';
  // const isWorkerd = env.IS_WORKERD === true;

  // Validate auth configuration consistency
  const useAuthWorker = env.NEXT_PUBLIC_USE_AUTH_WORKER !== false; // defaults to true

  assertValidAuthConfiguration({
    useAuthWorker,
    betterAuthUrl: baseAuthURL,
    isDevelopment,
    context: 'server',
  });

  const db = getDrizzleDB({ DATABASE_URL: env.DATABASE_URL });

  // Email configuration
  const fromEmail = env.FROM_EMAIL || 'DeepCrawl <noreply@deepcrawl.dev>';
  const emailEnabled = validateEmailConfig(env.RESEND_API_KEY, fromEmail);
  const resend = env.RESEND_API_KEY
    ? createResendClient(env.RESEND_API_KEY)
    : null;

  // Build trusted origins based on environment
  const trustedOrigins = [...ALLOWED_ORIGINS, baseAuthURL, appURL];
  if (isDevelopment) {
    trustedOrigins.push(...DEVELOPMENT_ORIGINS);
  }

  const config = {
    appName: 'DeepCrawl',
    /**
     * Base path for Better Auth.
     * Must match the path in the app.on for auth handlers
     * @default "/api/auth"
     */
    basePath: '/api/auth',
    baseURL: baseAuthURL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins,
    database: drizzleAdapter(db, { provider: 'pg', schema: schema }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache session data in cookie for 5 minutes
      },
    },
    plugins: [
      ...(USE_OAUTH_PROXY
        ? [
            oAuthProxy({
              currentURL: baseAuthURL,
              productionURL: useAuthWorker
                ? PROD_AUTH_WORKER_URL
                : PROD_APP_URL,
            }),
          ]
        : []),
      admin(),
      oneTap(),
      openAPI(),
      apiKey({
        startingCharactersConfig: {
          charactersLength: 10, // default 6
        },
        apiKeyHeaders: ['authorization', 'x-api-key'],
        rateLimit: {
          enabled: true,
          timeWindow: 1000 * 60 * 60 * 24, // 1 day
          maxRequests: 100, // 100 requests per day
        },
        /* An API Key can represent a valid session, so we automatically mock a session for the user if we find a valid API key in the request headers. QUESTION: Should we disable this? */
        // disableSessionForAPIKeys: true,
        enableMetadata: true,
        permissions: {
          defaultPermissions: async (userId, ctx) => {
            // Fetch user role or other data to determine permissions
            return {
              // api.deepcrawl.dev services endpoints
              // Permissions follow a resource-based structure
              read: ['GET', 'POST', 'PUT', 'DELETE'],
              links: ['GET', 'POST', 'PUT', 'DELETE'],
            };
          },
        },
      }),
      multiSession({
        maximumSessions: MAX_SESSIONS + 1, // better-auth issue: 3 is actually allowing max 2 sessions
      }),
      magicLink({
        sendMagicLink: async ({ email, token, url }, request) => {
          if (!emailEnabled || !resend) {
            console.warn('⚠️ Magic link email not sent - Resend not configured');
            return;
          }

          // TODO: CHECK THE USER REDIRECTING FUNCTIONALITIES
          // Use custom callback URL instead of built-in URL
          const customUrl = `${appURL}/magic-link?token=${token}`;

          try {
            await sendEmail(resend, {
              to: email,
              subject: 'Sign in to your DeepCrawl account',
              template: MagicLink({
                username: email.split('@')[0], // Use email prefix as fallback username
                magicLinkUrl: customUrl, // Use custom URL for better UX
              }),
              from: fromEmail,
            });
          } catch (error) {
            console.error('❌ Failed to send magic link email:', error);
          }
        },
        expiresIn: 300, // 5 minutes
      }),
      passkey({
        rpName: 'DeepCrawl Auth',
        origin: appURL,
        rpID: isDevelopment ? 'localhost' : 'deepcrawl.dev',
      }),
      organization({
        async sendInvitationEmail(data) {
          if (!emailEnabled || !resend) {
            return;
          }

          const inviteLink = `${appURL}/accept-invitation?invitationId=${data.id}`;

          try {
            await sendEmail(resend, {
              to: data.email,
              subject: `You've been invited to join ${data.organization.name} - DeepCrawl`,
              template: OrganizationInvitation({
                invitedEmail: data.email,
                inviterName: data.inviter.user.name || 'Someone',
                inviterEmail: data.inviter.user.email,
                organizationName: data.organization.name,
                invitationUrl: inviteLink,
              }),
              from: fromEmail,
            });
          } catch (error) {
            console.error('❌ Failed to send organization invitation:', error);
          }
        },
      }),
    ],
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      requireEmailVerification: true,
      async sendResetPassword({ user, url }) {
        if (!emailEnabled || !resend) {
          return;
        }

        try {
          await sendEmail(resend, {
            to: user.email,
            subject: 'Reset your password - DeepCrawl',
            template: PasswordReset({
              username: user.name || user.email,
              resetUrl: url,
            }),
            from: fromEmail,
          });
        } catch (error) {
          console.error('❌ Failed to send password reset email:', error);
        }
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }, _request) => {
        if (!emailEnabled || !resend) {
          console.warn('⚠️ Email verification not sent - Resend not configured');
          return;
        }

        // Use custom callback URL instead of built-in URL
        const customUrl = isDevelopment
          ? `http://localhost:3000/verify-email?token=${token}`
          : `${appURL}/verify-email?token=${token}`;

        try {
          await sendEmail(resend, {
            to: user.email,
            subject: 'Verify your email address - DeepCrawl',
            template: EmailVerification({
              username: user.name || user.email,
              verificationUrl: customUrl, // Use custom URL for better UX
            }),
            from: fromEmail,
          });
        } catch (error) {
          console.error('❌ Failed to send verification email:', error);
          console.error('📧 Email config - From Email:', fromEmail);
        }
      },
      autoSignInAfterVerification: true,
      expiresIn: 3600, // 1 hour
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        redirectURI: USE_OAUTH_PROXY
          ? useAuthWorker
            ? `${PROD_AUTH_WORKER_URL}/api/auth/callback/github`
            : `${PROD_APP_URL}/api/auth/callback/github`
          : undefined,
      },
      google: {
        clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI: USE_OAUTH_PROXY
          ? useAuthWorker
            ? `${PROD_AUTH_WORKER_URL}/api/auth/callback/google`
            : `${PROD_APP_URL}/api/auth/callback/google`
          : undefined,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
      },
    },
    advanced: {
      cookiePrefix: 'deepcrawl',
      // IP address tracking for rate limiting and session security
      ipAddress: {
        ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'],
        disableIpTracking: false,
      },
      // Unified cross-domain cookie configuration
      // Works for both auth worker and integrated auth, all environments
      crossSubDomainCookies: {
        enabled: !isDevelopment, // Only enable in production for .deepcrawl.dev
        domain: isDevelopment ? undefined : '.deepcrawl.dev',
      },
      defaultCookieAttributes: {
        secure: !isDevelopment, // HTTPS only in production
        sameSite: isDevelopment ? 'lax' : 'none', // 'lax' for localhost, 'none' for cross-domain
        partitioned: !isDevelopment, // Enable partitioned cookies in production
        // Let browser handle domain properly in development
        domain: isDevelopment ? undefined : '.deepcrawl.dev',
      },
    },
    // rateLimit: {
    // window: 60, // time window in seconds
    // max: 100, // max requests in the window
    // customRules: {
    //     "/sign-in/email": {
    //         window: 10,
    //         max: 3,
    //     },
    //     "/two-factor/*": async (request)=> {
    //         // custom function to return rate limit window and max
    //         return {
    //             window: 10,
    //             max: 3,
    //         }
    //     }
    // },
    //   storage: 'secondary-storage',
    //   modelName: 'rateLimit', //optional by default "rateLimit" is used
    // },
  } satisfies BetterAuthOptions;

  return config;
}
