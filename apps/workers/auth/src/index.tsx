import { WorkerEntrypoint } from 'cloudflare:workers';
import type { AppContext } from '@/lib/context';
import createHonoApp from '@/lib/hono/create-hono-app';
import { createAuth } from './lib/better-auth';
import { validateAPIKeyRouter } from './router/auth';

const app = createHonoApp();

app.get('/', (c) => {
  return c.text('Welcome to Deepcrawl Auth Worker');
});

app.route('/', validateAPIKeyRouter);

export default class AuthWorker extends WorkerEntrypoint<
  AppContext['Bindings']
> {
  async fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx);
  }

  // cf services binding rpc call (no correct types generated in the consumer worker for now)
  async getSessionWithAPIKey(apiKey: string) {
    const auth = createAuth(this.env);
    const session = await auth.api.getSession({
      headers: new Headers({
        'x-api-key': apiKey,
      }),
    });
    return session;
  }
}
