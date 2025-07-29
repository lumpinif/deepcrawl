import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import type { AppBindings } from '@/lib/context';

/**
 * CORS middleware for public API access
 */
export const deepCrawlCors = createMiddleware<AppBindings>(async (c, next) => {
  // First, try to get API key from x-api-key header
  const xApiKey = c.req.header('x-api-key');
  const authHeader = c.req.header('authorization');

  const apiKey = xApiKey ?? authHeader?.split(' ')[1];

  const hasAuth = !!apiKey;

  return cors({
    origin: (requestOrigin) => requestOrigin, // Allow all origins
    credentials: hasAuth,
    maxAge: 86400,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cookie',
    ],
    exposeHeaders: ['Content-Length', 'Content-Type'],
  })(c, next);
});

export default deepCrawlCors;
