import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';
import type { Context as HonoContext } from 'hono';
import type { PinoLogger } from 'hono-pino';

export interface AppVariables {
  logger: PinoLogger;
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
