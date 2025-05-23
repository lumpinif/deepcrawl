import authRouter from '@/routers/auth/route';
import linksRouter from '@/routers/links/route';
import readRouter from '@/routers/read/route';

import configureOpenAPI from './lib/configure-open-api';
import createApp from './lib/create-hono-app';
import root from './routers/root/route';

const app = createApp();

configureOpenAPI(app);

const routes = [root] as const;

for (const route of routes) {
  app.route('/', route);
}

app.route('/auth', authRouter);
app.route('/links', linksRouter);
app.route('/read', readRouter);

export default app;
