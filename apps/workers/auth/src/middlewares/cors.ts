import type { AppBindings } from '@/types';
import { ALLOWED_ORIGINS } from '@deepcrawl/auth/configs/auth.config';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';

export const corsMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  cors({
    maxAge: 600,
    credentials: true,
    origin: ALLOWED_ORIGINS,
    exposeHeaders: ['Content-Length'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
  await next();
});
