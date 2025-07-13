import { WorkerEntrypoint } from 'cloudflare:workers';
import type { AppContext } from '@/lib/context';
import createHonoApp from '@/lib/hono/create-hono-app';

const app = createHonoApp();

app.get('/', (c) => {
  return c.text('Welcome to Deepcrawl Auth Worker');
});

export default class AuthWorker extends WorkerEntrypoint<
  AppContext['Bindings']
> {
  async fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx);
  }

  async add(a: number, b: number) {
    return a + b;
  }
}
