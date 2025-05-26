import configureOpenAPI from './lib/configure-open-api';
import createApp from './lib/create-hono-app';
import linksRouter from './routers/links/links.routes';
import readRouter from './routers/read/read.routes';
import root from './routers/root/root.route';

const app = createApp();

configureOpenAPI(app);

const routes = [
  { router: root, path: '/' },
  { router: readRouter, path: '/read' },
  { router: linksRouter, path: '/links' },
] as const;

for (const route of routes) {
  app.route(route.path, route.router);
}

export default app;
