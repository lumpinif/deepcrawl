import { getDrizzleDB, schema } from '@deepcrawl/db-auth';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  lastLoginMethod,
  magicLink,
  multiSession,
  oAuthProxy,
  oneTap,
  openAPI,
  organization,
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { emailHarmony } from 'better-auth-harmony';
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
import {
  ALLOWED_ORIGINS,
  BA_API_KEY_RATE_LIMIT,
  COOKIE_CACHE_CONFIG,
  DEVELOPMENT_ORIGINS,
  MAX_SESSIONS,
  PROD_APP_URL,
  PROD_AUTH_WORKER_URL,
  USE_OAUTH_PROXY,
} from './constants';

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
      storeSessionInDatabase: true, // Store sessions in both DB and secondary storage
      preserveSessionInDatabase: false, // Clean up DB when removing from secondary storage
      cookieCache: COOKIE_CACHE_CONFIG,
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
      emailHarmony(),
      lastLoginMethod({
        cookieName: 'dc-lastLoginMethod',
        customResolveMethod: (ctx) => {
          // Track magic link authentication
          if (ctx.path === '/verify-magic-link') {
            return 'magic-link';
          }

          // Track passkey authentication
          if (ctx.path === '/passkey/verify-authentication') {
            return 'passkey';
          }

          // email authentication
          if (ctx.path === '/sign-in/email') {
            return 'email';
          }

          // Replicate default OAuth logic - this is a workaround to fix a known issue where the default logic was not being extended
          const defaultPaths = [
            '/callback/:id',
            '/oauth2/callback/:id',
            '/sign-in/email',
            '/sign-up/email',
          ];
          if (defaultPaths.includes(ctx.path)) {
            return ctx.params?.id ? ctx.params.id : ctx.path.split('/').pop();
          }

          return null;
        },
      }),
      apiKey({
        startingCharactersConfig: {
          charactersLength: 10, // default 6
        },
        rateLimit: {
          enabled: true,
          maxRequests: BA_API_KEY_RATE_LIMIT.maxRequests,
          timeWindow: BA_API_KEY_RATE_LIMIT.timeWindow,
        },
        apiKeyHeaders: ['x-api-key'],
        enableMetadata: true,
        permissions: {
          defaultPermissions: async (userId, ctx) => {
            // Fetch user role or other data to determine permissions
            return {
              // api.deepcrawl.dev services endpoints
              // Permissions follow a resource-based structure
              read: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
              links: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
            };
          },
        },
        customAPIKeyGetter: (ctx) => {
          // First try x-api-key header
          const apiKeyHeader = ctx.headers?.get('x-api-key');

          if (apiKeyHeader) {
            return apiKeyHeader;
          }

          // Then try Authorization Bearer header
          const authHeader = ctx.headers?.get('authorization');

          if (authHeader?.startsWith('Bearer ')) {
            return authHeader.replace('Bearer ', '');
          }

          return null;
        },
      }),
      multiSession({
        maximumSessions: MAX_SESSIONS + 1, // better-auth issue: 3 is actually allowing max 2 sessions
      }),
      magicLink({
        sendMagicLink: async ({ email, token }) => {
          if (!(emailEnabled && resend)) {
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
        rpName: 'DeepCrawl Passkey',
        // always use explicit rpID for simplicity instead of relying on baseAuthURL
        rpID: isDevelopment ? 'localhost' : 'deepcrawl.dev',
      }),
      organization({
        async sendInvitationEmail(data) {
          if (!(emailEnabled && resend)) {
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
        if (!(emailEnabled && resend)) {
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
        if (!(emailEnabled && resend)) {
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
        // GOOGLE AUTH SUPPORTS MORE THAN ONE REDIRECT URI, SO WE DON'T NEED TO USE THE PROXY
        // redirectURI: USE_OAUTH_PROXY
        //   ? useAuthWorker
        //     ? `${PROD_AUTH_WORKER_URL}/api/auth/callback/google`
        //     : `${PROD_APP_URL}/api/auth/callback/google`
        //   : undefined,
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
      },
      // Unified cross-domain cookie configuration
      // Works for both auth worker and integrated auth, all environments
      crossSubDomainCookies: {
        enabled: !isDevelopment,
        domain: isDevelopment ? undefined : '.deepcrawl.dev',
      },
    },
    rateLimit: {
      customRules: {
        '/sign-in/email': {
          window: 10,
          max: 3,
        },
        '/sign-up/email': {
          window: 10,
          max: 3,
        },
        '/forgot-password': {
          window: 10,
          max: 3,
        },
        '/reset-password': {
          window: 10,
          max: 3,
        },
        '/verify-email': {
          window: 10,
          max: 3,
        },
        '/two-factor/*': {
          window: 10,
          max: 3,
        },
        '/magic-link/*': {
          window: 10,
          max: 3,
        },
        '/organization/accept-invitation': {
          window: 10,
          max: 3,
        },
        '/change-password': {
          window: 10,
          max: 3,
        },
        '/change-email': {
          window: 10,
          max: 3,
        },
        '/passkey/*': {
          window: 10,
          max: 3,
        },
      },
    },
  } satisfies BetterAuthOptions;

  return config;
}
