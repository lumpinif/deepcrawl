import { supabaseMiddleware } from '@/middlewares/auth.middleware';
import { errorHandler, errorMiddleware } from '@/middlewares/error';
import authRouter from '@/routers/auth/route';
import linksRouter from '@/routers/links/route';
import readRouter from '@/routers/read/route';
import { Hono } from 'hono';
import type { RateLimitInfo } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';

export type AppVariables = {
  rateLimit: RateLimitInfo;
};

const allowedOrigins = [
  'https://deepcrawl.dev',
  'http://localhost:3000',
  'http://127.0.0.1:8787',
];

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}>();

app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    credentials: true,
    origin: allowedOrigins,
    allowHeaders: ['content-type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
);
app.use('*', supabaseMiddleware);
app.use('*', errorMiddleware);
app.use('*', trimTrailingSlash());
// app.use('*', freeUserRateLimiter);

app
  .get('/', (c) => c.json({ hi: 'Welcome to deepcrawl-v0 API' }))
  .route('/auth', authRouter)
  .route('/links', linksRouter)
  .route('/read', readRouter)
  .onError(errorHandler)
  .notFound((c) => c.json({ error: 'Endpoint Not found' }, 404));

export default app;
