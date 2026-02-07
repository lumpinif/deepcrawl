import { env } from 'cloudflare:workers';
import { ensureAbsoluteUrl, OFFICIAL_API_URL } from '@deepcrawl/runtime/urls';
import { SmartCoercionPlugin } from '@orpc/json-schema';
import type { OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import type { ORPCContext } from '@/lib/context';
import { router } from '@/routers';
import { OpenAPISpecBaseOptions, SchemaConverters } from './configs';

const OpenAPISpecOptions = {
  ...OpenAPISpecBaseOptions,
  servers: [
    {
      ...OpenAPISpecBaseOptions.servers[0],
      url: (() => {
        const raw = env.API_URL || OFFICIAL_API_URL;
        try {
          return new URL(ensureAbsoluteUrl(raw)).toString();
        } catch {
          return OFFICIAL_API_URL;
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
