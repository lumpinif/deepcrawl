import type { AppContext } from '@/lib/context';
import { createAuthClientConfig } from '@deepcrawl/auth/configs/auth.client.config';
import { type ClientOptions, createAuthClient } from 'better-auth/client';

export function getAuthClient(c: AppContext, options: ClientOptions = {}) {
  const baseAuthClientConfig = createAuthClientConfig({
    baseURL: c.env.BETTER_AUTH_URL,
  });

  return createAuthClient({
    ...baseAuthClientConfig,
    plugins: [...baseAuthClientConfig.plugins, ...(options.plugins || [])],
    fetchOptions: {
      ...baseAuthClientConfig.fetchOptions,
      ...options.fetchOptions,
      headers: c.req.raw.headers, // headers are passed to the fetch function
    },
    ...options,
  });
}

// export const authClientMiddleware = (options: ClientOptions = {}) =>
//   createMiddleware<AppBindings>(async (c, next) => {
//     const authClient = getAuthClient(c, options);

//     if (authClient) {
//       c.set('authClient', authClient);
//     }

//     return next();
//   });
