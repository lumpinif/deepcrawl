import { getDrizzleDB, schema } from '@deepcrawl/db';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  bearer,
  multiSession,
  // oAuthProxy,
  oneTap,
  openAPI,
  organization,
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';

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
}

interface SecondaryStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export const ALLOWED_ORIGINS = [
  // Production origins
  'https://auth.deepcrawl.dev',
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
  'http://localhost:8787', // Auth worker
  'http://127.0.0.1:8787', // Auth worker alternative
];

/** Important: make sure always import this explicitly in workers to resolve process.env issues
 *  Factory function that accepts environment variables from cloudflare env
 */
export function createAuthConfig(env: Env) {
  // use this to determine if we are in development or production instead of process.env.NODE_ENV
  const baseAuthURL = env.BETTER_AUTH_URL;
  const isDevelopment = env.AUTH_WORKER_NODE_ENV === 'development';

  const db = getDrizzleDB({ DATABASE_URL: env.DATABASE_URL });

  // Build trusted origins based on environment
  const trustedOrigins = [...ALLOWED_ORIGINS, baseAuthURL];
  if (isDevelopment) {
    trustedOrigins.push(...DEVELOPMENT_ORIGINS);
  }

  const config = {
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      // async sendResetPassword({ user, url }) {
      // 	await resend.emails.send({
      // 		from,
      // 		to: user.email,
      // 		subject: "Reset your password",
      // 		react: reactResetPasswordEmail({
      // 			username: user.email,
      // 			resetLink: url,
      // 		}),
      // 	});
      // },
    },
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
      passkey(),
      openAPI(),
      multiSession(),
      organization({
        // async sendInvitationEmail(data) {
        // await resend.emails.send({
        // 	from,
        // 	to: data.email,
        // 	subject: "You've been invited to join an organization",
        // 	react: reactInvitationEmail({
        // 		username: data.email,
        // 		invitedByUsername: data.inviter.user.name,
        // 		invitedByEmail: data.inviter.user.email,
        // 		teamName: data.organization.name,
        // 		inviteLink:
        // 			isDevelopment
        // 				? `http://localhost:3000/accept-invitation/${data.id}`
        // 				: `${
        // 						env.BETTER_AUTH_URL ||
        // 						"https://demo.better-auth.com"
        // 					}/accept-invitation/${data.id}`,
        // 	}),
        // });
        // },
      }),
    ],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        // redirectURI: 'https://auth.deepcrawl.dev/api/auth/callback/github',
      },
      google: {
        clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        // redirectURI: 'https://auth.deepcrawl.dev/api/auth/callback/google',
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

      // Cross-subdomain cookies configuration
      crossSubDomainCookies: {
        enabled: !isDevelopment, // Only enable in production
        domain: isDevelopment ? undefined : '.deepcrawl.dev', // Leading period is crucial
      },

      // FIXED: Default cookie attributes for all cookies
      defaultCookieAttributes: {
        httpOnly: true,
        secure: !isDevelopment, // false for development (HTTP), true for production (HTTPS)
        // Cross-subdomain requires sameSite: 'none' in production
        sameSite: (isDevelopment ? 'lax' : 'none') as 'lax' | 'none', // 'lax' for dev, 'none' for production cross-subdomain
        // Partitioned cookies for cross-subdomain in production
        partitioned: !isDevelopment, // Only in production for cross-subdomain cookies
      },

      // IP address tracking for rate limiting and session security
      ipAddress: {
        ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'],
        disableIpTracking: false,
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
  };

  return config;
}
