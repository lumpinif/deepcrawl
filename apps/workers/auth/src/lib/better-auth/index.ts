import { createAuthConfig } from '@deepcrawl/auth/configs/auth.config';
import { betterAuth } from 'better-auth';
/**
 * Better Auth Instance
 */
export const auth = (env: CloudflareBindings) => {
  return betterAuth(createAuthConfig(env));
};

export function createBetterAuth(env: CloudflareBindings) {
  return auth(env);
}
