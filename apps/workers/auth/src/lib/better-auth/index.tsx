import { createAuthConfig } from '@deepcrawl/auth/configs/auth.config';
import { betterAuth } from 'better-auth';

export function createAuth(env: CloudflareBindings) {
  const authConfigs = createAuthConfig({
    ...env,
    IS_WORKERD: true,
  });

  return betterAuth({
    ...authConfigs,
  });
}
