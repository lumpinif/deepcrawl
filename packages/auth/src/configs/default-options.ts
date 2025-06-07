import type { BetterAuthOptions } from 'better-auth';

export interface SecondaryStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

// TODO: MOVE TO AUTH WORKER FOR CORS AND SECURITY
// Environment detection
const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === undefined ||
  typeof process === 'undefined';

/**
 * Custom options for Better Auth
 *
 * Docs: https://www.better-auth.com/docs/reference/options
 */
export const defaultOptions: BetterAuthOptions = {
  /**
   * The name of the application.
   */
  appName: 'DeepCrawl',
  /**
   * Base path for Better Auth.
   * Must match the path in the app.on for auth handlers
   * @default "/api/auth"
   */
  basePath: '/auth',

  // .... More options
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
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
      sameSite: isDevelopment ? 'lax' : 'none', // 'lax' for dev, 'none' for production cross-origin
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
