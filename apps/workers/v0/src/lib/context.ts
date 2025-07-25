import type { Auth, Session } from '@deepcrawl/auth/types';
import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';
import type { Ratelimit } from '@upstash/ratelimit';
import type { Context as HonoContext } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';
import type { getAuthClient } from '@/middlewares/client.auth';

export interface AppVariables extends RequestIdVariables {
  /** Auth Instance */
  auth: Auth;
  /** Better Auth Client */
  authClient: ReturnType<typeof getAuthClient> | null;
  /** Service Bindings Fetcher */
  serviceFetcher: typeof fetch;
  /** Custom Service Bindings Fetcher */
  customFetcher: typeof fetch;
  /** Current Session */
  session: Session | null;
  /** User IP */
  userIP: string | null;
  /** Rate Limiter */
  rateLimiter: Ratelimit;
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
  executionCtx: ExecutionContext;
}

export async function createContext({
  context,
}: CreateContextOptions): Promise<ORPCContext> {
  return {
    env: context.env,
    var: context.var,
    executionCtx: context.executionCtx,
  };
}
