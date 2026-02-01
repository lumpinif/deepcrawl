import { env } from 'cloudflare:workers';
import { SmartCoercionPlugin } from '@orpc/json-schema';
import type { OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import { CORSPlugin } from '@orpc/server/plugins';
import type { ORPCContext } from '@/lib/context';
import { CORS_OPTIONS } from '@/middlewares/cors.hono';
import { router } from '@/routers';
import { OpenAPISpecBaseOptions, SchemaConverters } from './configs';

const OpenAPISpecOptions = {
  ...OpenAPISpecBaseOptions,
  servers: [
    {
      ...OpenAPISpecBaseOptions.servers[0],
      url: (() => {
        try {
          return new URL(env.API_URL).toString();
        } catch {
          return new URL(`https://${env.API_URL}`).toString();
        }
      })(),
    },
  ],
} satisfies OpenAPIGeneratorGenerateOptions;

export const openAPIHandler = new OpenAPIHandler<ORPCContext>(router, {
  interceptors: [
    onError((error: unknown) => {
      console.error('❌ OpenAPIHandler error', error);
    }),
  ],
  plugins: [
    new CORSPlugin({
      origin: (origin) => origin, // Allow all origins (same as Hono)
      credentials: CORS_OPTIONS.credentials,
      maxAge: CORS_OPTIONS.maxAge,
      allowMethods: CORS_OPTIONS.allowMethods,
      allowHeaders: CORS_OPTIONS.allowHeaders,
      exposeHeaders: CORS_OPTIONS.exposeHeaders,
    }),
    new SmartCoercionPlugin({
      schemaConverters: SchemaConverters,
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: SchemaConverters,
      specGenerateOptions: OpenAPISpecOptions,
      docsConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: 'dc-YOUR_API_KEY',
            },
          },
        },
      },
      specPath: '/openapi',
      docsPath: '/docs',
    }),
  ],
});
