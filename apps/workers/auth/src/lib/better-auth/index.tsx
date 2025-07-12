import { env } from 'cloudflare:workers';
import { createAuthConfig } from '@deepcrawl/auth/configs/auth.config';
import { betterAuth } from 'better-auth';

const authConfigs = createAuthConfig({
  ...env,
  IS_WORKERD: true,
});

export const auth = betterAuth({
  ...authConfigs,
});
