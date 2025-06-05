import { createAuthConfig } from '@deepcrawl/auth/configs/auth.config';
import { betterAuth } from 'better-auth';
/**
 * Better Auth Instance
 */
export const auth = (
  env: CloudflareBindings,
): ReturnType<typeof betterAuth> => {
  return betterAuth(
    createAuthConfig(env, {
      trustedOrigins: [
        'http://localhost:8787',
        'https://deepcrawl.dev',
        'https://*.deepcrawl.dev',
        env.BETTER_AUTH_URL,
        // add other domains to trustedOrigins, such as tenant domains
      ],
    }),
  );
};

export function createBetterAuth(env: CloudflareBindings) {
  return auth(env);
}

export type AuthType = ReturnType<typeof createBetterAuth>;
export type Session = AuthType['$Infer']['Session'];
