/* eslint-disable ts/no-empty-object-type */
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { Context, Schema } from 'hono';
import type { PinoLogger } from 'hono-pino';
import type { RateLimitInfo } from 'hono-rate-limiter';

export interface AppVariables {
  rateLimit: RateLimitInfo;
  logger: PinoLogger;
}

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}

export interface AppContext extends Context<AppBindings> {}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
