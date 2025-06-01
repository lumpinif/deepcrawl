import type { BetterAuthOptions } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { apiKey } from 'better-auth/plugins';

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
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      partitioned: true, // New browser standards will mandate this for foreign cookies
    },
  },
};
