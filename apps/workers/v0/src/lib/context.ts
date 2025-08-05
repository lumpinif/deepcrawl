import type { Auth, Session } from '@deepcrawl/auth/types';
import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';
import type { Ratelimit } from '@upstash/ratelimit';
import type { Context as HonoContext } from 'hono';
import type { RequestIdVariables } from 'hono/request-id';
import type { NodeHtmlMarkdown } from 'node-html-markdown';
import type { getAuthClient } from '@/middlewares/client.auth';
import type { LinkService } from '@/services/link/link.service';
import type { ScrapeService } from '@/services/scrape/scrape.service';

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
  /** Shared Services - Created at app level for performance */
  scrapeService: ScrapeService;
  linkService: LinkService;
  markdownConverter: NodeHtmlMarkdown;
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
  };
}
