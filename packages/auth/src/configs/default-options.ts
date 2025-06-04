import type { BetterAuthOptions } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { apiKey } from 'better-auth/plugins';

export interface SecondaryStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

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
  plugins: [admin(), apiKey()],
  advanced: {
    cookiePrefix: 'deepcrawl',
    crossSubDomainCookies: {
      enabled: true,
      domain: '.deepcrawl.dev', // Domain with a leading period
    },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      partitioned: true, // New browser standards will mandate this for foreign cookies
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
