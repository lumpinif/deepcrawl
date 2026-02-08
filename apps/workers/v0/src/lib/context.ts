import type { Auth, Session } from '@deepcrawl/auth/types';
import type { createDBD1 } from '@deepcrawl/db-d1';
import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';
import type { Ratelimit } from '@upstash/ratelimit';
import type { ExecutionContext, Context as HonoContext } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';
import type { getAuthClient } from '@/middlewares/client.auth';
import type { ScrapeService } from '@/services/scrape/scrape.service';

export interface AppVariables extends RequestIdVariables {
  /** D1 Database */
  dbd1: ReturnType<typeof createDBD1>;
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
  /** Core Service - Always available in context */
  scrapeService: ScrapeService;
}

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}

export interface AppContext extends HonoContext<AppBindings> {}

export interface ORPCContext extends ResponseHeadersPluginContext {
  env: AppBindings['Bindings'];
  var: AppVariables;
  signal?: AbortSignal | null;
  executionCtx: ExecutionContext;
  /** Cache Hit Flag for Activity Logging */
  cacheHit: boolean;
  /** Stable key for links endpoints hash (root key aligned with KV) */
  linksRootKey?: string;
}

export async function createContext({
  context,
}: {
  context: AppContext;
}): Promise<ORPCContext> {
  return {
    env: context.env,
    var: context.var,
    signal: context.req.raw.signal,
    executionCtx: context.executionCtx,
    cacheHit: false,
  };
}
