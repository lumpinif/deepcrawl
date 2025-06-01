import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './lib/better-auth';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  '*', // or replace with "*" to enable cors for all routes
  cors({
    origin: 'http://localhost:8787', // replace with your origin
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(['GET', 'POST'], '/api/auth/*', (c) => {
  return auth(c.env).handler(c.req.raw);
});

app.get('/', (c) => {
  return c.text('Hello Deepcrawl');
});

export default app;
