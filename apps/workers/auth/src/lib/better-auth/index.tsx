import { createAuthConfig } from '@deepcrawl/auth/configs/auth.config';
import { playgroundApiKeyConfig } from '@deepcrawl/auth/lib/auth';
import { betterAuth } from 'better-auth';

export function createBetterAuth(env: CloudflareBindings) {
  const authConfigs = createAuthConfig(env);

  const auth = betterAuth({
    ...authConfigs,
    // HACK TO CREATE A DEFAULT API KEY FOR EVERY NEW USER (ENSURE IT IS ALSO ADDED TO AUTH WORKER IF NEEDED)
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
                  ...playgroundApiKeyConfig,
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

  return auth;
}
