import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createBetterAuth } from './lib/better-auth';
import type { AppBindings } from './types';

const app = new Hono<AppBindings>();

// create auth instance and set it to context
app.use('*', async (c, next) => {
  const auth = createBetterAuth(c.env);
  c.set('betterAuth', auth);
  await next();
});

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

// auth middleware
app.use('*', async (c, next) => {
  const auth = c.var.betterAuth;
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  // Set both the user and session objects from the session response
  c.set('user', session.user);
  c.set('session', session.session);

  return next();
});

app.get('/', (c) => {
  return c.text('Hello Deepcrawl');
});

app.get('/signup', async (c) => {
  const auth = c.var.betterAuth;
  const email = `test${Date.now().toString().slice(7, 10)}@example.com`;
  const password = 'password';

  const response = await auth.api.signUpEmail({
    returnHeaders: true,
    body: {
      email,
      password,
      name: `test${Date.now().toString().slice(7, 10)}`,
    },
    asResponse: true,
  });
  return response;
});

app.get('/session', (c) => {
  const user = c.var.user;
  const session = c.var.session;

  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  return c.json({
    session,
    user,
  });
});

app.get('/signin', async (c) => {
  const auth = c.var.betterAuth;
  const response = await auth.api.signInEmail({
    body: {
      email: 'test@example.com',
      password: 'password',
    },
    returnHeaders: true,
    asResponse: true,
  });

  return response;
});

app.get('/signout', async (c) => {
  const auth = c.var.betterAuth;
  await auth.api.signOut({
    headers: c.req.raw.headers,
  });

  return c.json({ message: 'Signed out' });
});

export default app;
