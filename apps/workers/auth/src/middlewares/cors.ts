import type { AppBindings } from '@/types';
import {
  ALLOWED_ORIGINS,
  DEVELOPMENT_ORIGINS,
} from '@deepcrawl/auth/configs/auth.config';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';

/**
 * Custom CORS middleware factory for DeepCrawl auth service
 *
 * Features:
 * - Environment-aware origin configuration
 * - Enhanced wildcard domain support for subdomains
 * - Development-mode debugging and logging
 * - Proper handling of requests without origin headers
 *
 * @example
 * ```typescript
 * import { deepCrawlCors } from '@/middlewares/cors';
 *
 * app.use('*', deepCrawlCors);
 * ```
 */
export const deepCrawlCors = createMiddleware<AppBindings>(async (c, next) => {
  // Determine environment - fallback to production if AUTH_WORKER_NODE_ENV is not set
  const isDevelopment = c.env.AUTH_WORKER_NODE_ENV === 'development';

  // Build allowed origins list based on environment
  const allowedOrigins = [...ALLOWED_ORIGINS];
  if (isDevelopment) {
    allowedOrigins.push(...DEVELOPMENT_ORIGINS);
  }

  // Create and apply CORS middleware with custom origin validation
  const corsMiddleware = cors({
    origin: (origin, c) => {
      // Allow requests with no origin (e.g., mobile apps, curl, Postman)
      if (!origin) return origin;

      // Check if origin is in allowed list
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        // Handle wildcard subdomains (e.g., https://*.deepcrawl.dev)
        if (allowedOrigin.includes('*')) {
          // Convert wildcard pattern to regex
          // https://*.deepcrawl.dev -> https://[^.]+\.deepcrawl\.dev
          const pattern = allowedOrigin
            .replace(/\./g, '\\.') // Escape dots for regex
            .replace(/\*/g, '[^.]+'); // Replace * with subdomain pattern (non-greedy)
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }
        return allowedOrigin === origin;
      });

      // Development-mode warning for rejected origins
      // if (isDevelopment && !isAllowed) {
      //   console.warn(`🚫 CORS: Origin "${origin}" not allowed.`);
      //   console.warn(`📋 Allowed origins:`, allowedOrigins);
      // } else if (isDevelopment && isAllowed) {
      //   console.log(`✅ CORS: Origin "${origin}" allowed.`);
      // }

      // Return the origin if allowed, null if not
      return isAllowed ? origin : null;
    },
    maxAge: 600, // Cache preflight for 10 minutes
    credentials: true, // Allow cookies and authorization headers
    exposeHeaders: ['Content-Length'], // Headers that client can access
    allowMethods: ['POST', 'GET', 'OPTIONS'], // Allowed HTTP methods
    allowHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
  });

  // Apply the CORS middleware
  return corsMiddleware(c, next);
});

/**
 * Export the middleware as default for convenience
 */
export default deepCrawlCors;
