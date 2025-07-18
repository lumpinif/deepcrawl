import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

export const apiKeyAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    // First, try to get API key from x-api-key header
    let apiKey = c.req.header('x-api-key');

    // If not found, try to extract from Authorization Bearer token
    if (!apiKey) {
      const authHeader = c.req.header('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        // Extract token from "Bearer <token>" format
        apiKey = authHeader.slice(7); // Remove "Bearer " prefix
      }
    }

    // if (!apiKey) {
    //     return c.json(
    //         {
    //             authenticated: false,
    //             error:
    //             'You are not authenticated. Provide API key via x-api-key header or Authorization Bearer token.',
    //         },
    //         401,
    //     );
    // }

    console.log('🚀 ~ apiKey:', apiKey);

    // Store the API key in context for potential use in downstream handlers
    // c.set('apiKey', apiKey);

    return next();
  },
);
