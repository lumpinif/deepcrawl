import type { BetterAuthOptions } from 'better-auth';

//todo: optional passing c.env.BETTER_AUTH_URL to construct the options

/**
 * Custom options for Better Auth
 *
 * Docs: https://www.better-auth.com/docs/reference/options
 */
export const betterAuthOptions: BetterAuthOptions = {
  /**
   * The name of the application.
   */
  appName: 'DeepCrawl',
  /**
   * Base path for Better Auth.
   * @default "/api/auth"
   */
  basePath: '/api/auth',

  // .... More options
  emailAndPassword: {
    enabled: true,
  },
};
