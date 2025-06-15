import createHonoApp from './lib/hono/create-hono-app';

const app = createHonoApp();

app.get('/', (c) => {
  return c.text('Hello Deepcrawl');
});

export default app;
