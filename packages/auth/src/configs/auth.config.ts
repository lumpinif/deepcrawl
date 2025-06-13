import { getDrizzleDB, schema } from '@deepcrawl/db';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  bearer,
  multiSession,
  oAuthProxy,
  // twoFactor,
  oneTap,
  openAPI,
  organization,
  // customSession
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

/** Important: make sure always import this explicitly in workers to resolve process.env issues
 *  Factory function that accepts environment variables from cloudflare env
 */
export function createAuthConfig(env: Env) {
  // use this to determine if we are in development or production instead of process.env.NODE_ENV
  const isDevelopment = env.AUTH_WORKER_NODE_ENV === 'development';

  const db = getDrizzleDB({ DATABASE_URL: env.DATABASE_URL });

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
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
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
      oAuthProxy(),
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
      // twoFactor({
      // 	otpOptions: {
      // 		async sendOTP({ user, otp }) {
      // 			await resend.emails.send({
      // 				from,
      // 				to: user.email,
      // 				subject: "Your OTP",
      // 				html: `Your OTP is ${otp}`,
      // 			});
      // 		},
      // 	},
      //       }),
    ],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
      },
    },
    trustedOrigins: [
      // Development origins
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8787',
      'http://127.0.0.1:8787',
      // Production origins (add your actual domains)
      'https://auth.deepcrawl.dev',
      'https://deepcrawl.dev',
      'https://app.deepcrawl.dev',
    ],
    advanced: {
      cookiePrefix: 'deepcrawl',
      crossSubDomainCookies: {
        enabled: !isDevelopment, // Only enable in production
        domain: isDevelopment ? undefined : '.deepcrawl.dev',
      },
      defaultCookieAttributes: {
        secure: !isDevelopment, // false for development (HTTP), true for production (HTTPS)
        httpOnly: true,
        sameSite: (isDevelopment ? 'lax' : 'none') as 'lax' | 'none', // 'lax' for dev, 'none' for production cross-origin
        partitioned: !isDevelopment, // Only in production for cross-origin cookies
      },
      // Ensure cookies work in development
      useSecureCookies: !isDevelopment,
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
