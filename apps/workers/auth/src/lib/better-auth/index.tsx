import { createAuthConfig } from '@deepcrawl/auth/configs/auth.config';
import { betterAuth } from 'better-auth';

export function createAuth(env: CloudflareBindings) {
  const authConfigs = createAuthConfig({
    ...env,
    IS_WORKERD: true,
  });

  return betterAuth({
    ...authConfigs,
    secondaryStorage: {
      get: async (key: string) => {
        return env.DEEPCRAWL_AUTH_KV.get(key);
      },
      set: async (key: string, value: string, ttl?: number) => {
        return env.DEEPCRAWL_AUTH_KV.put(
          key,
          value,
          ttl ? { expirationTtl: ttl } : undefined,
        );
      },
      delete: async (key: string) => {
        return env.DEEPCRAWL_AUTH_KV.delete(key);
      },
    },
    rateLimit: {
      ...authConfigs.rateLimit,
      storage: 'secondary-storage',
    },
  });
}
