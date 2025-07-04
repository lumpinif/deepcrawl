import type { ResponseHeadersPluginContext } from '@orpc/server/plugins';
import type { Context as HonoContext } from 'hono';

// export interface AppVariables {
// }

export interface AppBindings {
  Bindings: CloudflareBindings;
  // Variables: AppVariables;
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
