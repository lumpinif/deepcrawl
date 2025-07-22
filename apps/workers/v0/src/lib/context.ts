import type { Session } from '@deepcrawl/auth/types';
import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';
import type { Context as HonoContext } from 'hono';
import type { getAuthClient } from '@/middlewares/auth.client';

export interface AppVariables {
  /** Better Auth Client */
  authClient: ReturnType<typeof getAuthClient> | null;
  /** Service Bindings Fetcher */
  serviceFetcher: typeof fetch;
  /** Custom Service Bindings Fetcher */
  customFetcher: typeof fetch;
  /** Current Session */
  session: Session | null;
}

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}

export interface AppContext extends HonoContext<AppBindings> {}

export type CreateContextOptions = {
  context: AppContext;
};

export interface ORPCContext extends ResponseHeadersPluginContext {
  env: AppBindings['Bindings'];
  var: AppVariables;
  headers: HonoContext['header'];
}

export async function createContext({
  context,
}: CreateContextOptions): Promise<ORPCContext> {
  return {
    env: context.env,
    var: context.var,
    headers: context.header,
  };
}
