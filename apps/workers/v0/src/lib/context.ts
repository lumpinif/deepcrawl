import type { getAuthClient } from '@/middlewares/auth.client';
import type { Session } from '@deepcrawl/auth/types';
import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';

import type { Context as HonoContext } from 'hono';

export interface AppVariables {
  /** Better Auth Client */
  authClient: ReturnType<typeof getAuthClient> | null;
  /** Service Bindings Fetcher */
  serviceFetcher: typeof fetch;
  /** Current User */
  user: Session['user'] | null;
  /** Current Session */
  session: Session['session'] | null;
}

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}

export interface AppContext
  extends HonoContext<AppBindings>,
    ResponseHeadersPluginContext {}

export type CreateContextOptions = {
  context: AppContext;
};

export async function createContext({
  context,
}: CreateContextOptions): Promise<AppContext> {
  return context;
}
