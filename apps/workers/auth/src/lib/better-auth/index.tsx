import { createAuthConfig } from '@deepcrawl/auth/configs/auth.config';
import { betterAuth } from 'better-auth';

export const API_KEY_CACHE_CONFIG = {
  TTL_SECONDS: 300, // 5 minutes cache
  KEY_PREFIX: 'api_key_session:',
} as const;

export function createAuth(env: CloudflareBindings) {
  const authConfigs = createAuthConfig({
    ...env,
    IS_WORKERD: true,
  });

  return betterAuth({
    ...authConfigs,
    secondaryStorage: {
      get: async (key: string) => {
        const value = await env.DEEPCRAWL_AUTH_KV.get(key);
        return value;
      },
      set: async (key: string, value: string, ttl?: number) => {
        if (ttl) {
          await env.DEEPCRAWL_AUTH_KV.put(key, value, { expirationTtl: ttl });
        } else {
          await env.DEEPCRAWL_AUTH_KV.put(key, value);
        }
      },
      delete: async (key: string) => {
        await env.DEEPCRAWL_AUTH_KV.delete(key);
      },
    },
    rateLimit: {
      ...authConfigs.rateLimit,
      storage: 'secondary-storage',
    },
  });
}
