import { getDrizzleDB, schema } from '@deepcrawl/db';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  bearer,
  // oAuthProxy,
  magicLink,
  multiSession,
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
}

// Secondary storage interface for potential future use with rate limiting
// interface SecondaryStorage {
//   get: (key: string) => Promise<string | null>;
//   set: (key: string, value: string, ttl?: number) => Promise<void>;
//   delete: (key: string) => Promise<void>;
// }

export const ALLOWED_ORIGINS = [
  // Production origins
  'https://auth.deepcrawl.dev', // Auth worker (legacy)
  'https://deepcrawl.dev',
  'https://app.deepcrawl.dev',
  'https://*.deepcrawl.dev',
  // Add explicit wildcard support for all deepcrawl.dev subdomains
  '*.deepcrawl.dev',
];

export const DEVELOPMENT_ORIGINS = [
  // Development origins
  'http://localhost:3000', // Dashboard
  'https://localhost:3000', // Dashboard HTTPS
  'http://127.0.0.1:3000', // Dashboard alternative
  'http://localhost:8787', // Auth worker (legacy)
  'http://127.0.0.1:8787', // Auth worker alternative (legacy)
];

export const MAX_SESSIONS = 3; // better-auth issue: 3 is allowing max 2 sessions

const crossSubDomainConfigs = {
  crossSubDomainCookies: {
    enabled: true,
    domain: '.deepcrawl.dev',
  },
  defaultCookieAttributes: {
    secure: true,
    sameSite: 'none',
    partitioned: true,
  },
} satisfies BetterAuthOptions['advanced'];

/** Important: make sure always import this explicitly in workers to resolve process.env issues
 *  Factory function that accepts environment variables from cloudflare env
 */
export function createAuthConfig(env: Env) {
  // use this to determine if we are in development or production instead of process.env.NODE_ENV
  const baseAuthURL = env.BETTER_AUTH_URL;
  const isDevelopment = env.AUTH_WORKER_NODE_ENV === 'development';

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
  const trustedOrigins = [...ALLOWED_ORIGINS, baseAuthURL];
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
      admin(),
      apiKey(),
      oneTap(),
      bearer(),
      openAPI(),
      multiSession({
        maximumSessions: MAX_SESSIONS,
      }),
      magicLink({
        sendMagicLink: async ({ email, token, url }, request) => {
          if (!emailEnabled || !resend) {
            console.warn('⚠️ Magic link email not sent - Resend not configured');
            return;
          }

          // Use custom callback URL instead of built-in URL
          const customUrl = isDevelopment
            ? `http://localhost:3000/magic-link?token=${token}`
            : `https://app.deepcrawl.dev/magic-link?token=${token}`;

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
        disableSignUp: false, // Allow new users to sign up via magic link
      }),
      passkey({
        rpID: isDevelopment ? 'localhost' : 'deepcrawl.dev',
        rpName: 'DeepCrawl Auth',
        origin: isDevelopment
          ? 'http://localhost:3000'
          : 'https://app.deepcrawl.dev',
      }),
      organization({
        async sendInvitationEmail(data) {
          if (!emailEnabled || !resend) {
            return;
          }

          const inviteLink = isDevelopment
            ? `http://localhost:3000/accept-invitation?invitationId=${data.id}`
            : `https://app.deepcrawl.dev/accept-invitation?invitationId=${data.id}`;

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
      // disable oAuthProxy as it is not working
      // oAuthProxy({
      //   productionURL: 'https://app.deepcrawl.dev',
      //   currentURL: 'http://localhost:3000',
      // }),
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
          : `https://app.deepcrawl.dev/verify-email?token=${token}`;

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
        // disable for oAuthProxy as it is not working
        // redirectURI: useAuthWorker
        //   ? 'https://auth.deepcrawl.dev/api/auth/callback/github'
        //   : 'https://app.deepcrawl.dev/api/auth/callback/github',
      },
      google: {
        clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        // disable for oAuthProxy as it is not working
        // redirectURI: useAuthWorker
        //   ? 'https://auth.deepcrawl.dev/api/auth/callback/google'
        //   : 'https://app.deepcrawl.dev/api/auth/callback/google',
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

      // Enable cross-subdomain in production when using auth worker (default behavior)
      // Only disable when explicitly using Next.js API routes (NEXT_PUBLIC_USE_AUTH_WORKER='false')
      ...(isDevelopment
        ? {}
        : env.NEXT_PUBLIC_USE_AUTH_WORKER === false
          ? {} // Disable crossSubDomainConfigs when explicitly using Next.js API routes
          : crossSubDomainConfigs), // Default: enable crossSubDomainConfigs for auth worker
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
