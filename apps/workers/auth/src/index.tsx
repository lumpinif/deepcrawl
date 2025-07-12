import createHonoApp from '@/lib/hono/create-hono-app';

const app = createHonoApp();

app.get('/', (c) => {
  return c.text('Deepcrawl Auth Worker');
});

export default app;
