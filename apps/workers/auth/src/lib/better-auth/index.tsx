import { env } from 'cloudflare:workers';
import {
  PLAYGROUND_API_KEY_CONFIG,
  createAuthConfig,
} from '@deepcrawl/auth/configs/auth.config';
import { betterAuth } from 'better-auth';

const authConfigs = createAuthConfig({
  ...env,
  IS_WORKERD: true,
});

export const auth = betterAuth({
  ...authConfigs,
  // HACK TO CREATE A DEFAULT API KEY FOR EVERY NEW USER (ENSURE IT IS ALSO ADDED TO AUTH WORKER IF NEEDED)
  // Not working for cloudflare workers
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Automatically create a default API key for every new user
          // This enables immediate playground access without manual API key creation
          try {
            await auth.api.createApiKey({
              body: {
                userId: user.id,
                ...PLAYGROUND_API_KEY_CONFIG,
              },
            });
          } catch (err) {
            console.error('❌ Failed to create PLAYGROUND_API_KEY:', err);
          }
        },
      },
    },
  },
});
