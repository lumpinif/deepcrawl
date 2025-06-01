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
   * @default "/api/auth"
   */
  basePath: '/api/auth',

  // .... More options
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), apiKey()],
};
