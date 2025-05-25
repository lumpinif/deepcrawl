// import authRouter from '@/routers/auth/route';
import linksRouter from '@/routers/links/route';

import configureOpenAPI from './lib/configure-open-api';
import createApp from './lib/create-hono-app';
import readRouter from './routers/read/read.routes';
import root from './routers/root/root.route';

const app = createApp();

configureOpenAPI(app);

const routes = [
  { router: root, path: '/' },
  { router: readRouter, path: '/read' },
] as const;

for (const route of routes) {
  app.route(route.path, route.router);
}

// app.route('/auth', authRouter);
app.route('/links', linksRouter);

export default app;
