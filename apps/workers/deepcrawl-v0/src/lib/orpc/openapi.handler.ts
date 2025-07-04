import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import { ZodSmartCoercionPlugin } from '@orpc/zod';
import { experimental_ZodToJsonSchemaConverter as ZodV4ToJsonSchemaConverter } from '@orpc/zod/zod4';

import { env } from 'cloudflare:workers';
import { router } from '@/routers/rpc';
import {
  LinksErrorResponseSchema,
  LinksOptionsSchema,
  LinksSuccessResponseSchema,
  ReadErrorResponseSchema,
  ReadOptionsSchema,
  ReadSuccessResponseSchema,
} from '@deepcrawl/types';
import type { OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { ResponseHeadersPlugin } from '@orpc/server/plugins';
import packageJSON from '../../../package.json' with { type: 'json' };

export const SchemaConverters = [new ZodV4ToJsonSchemaConverter()];

export const OpenAPISpecGenerateOptions = {
  info: {
    title: 'DeepCrawl',
    version: packageJSON.version,
  },
  security: [{ bearerAuth: [] }],
  servers: [
    {
      url: (() => {
        try {
          return new URL(env.API_URL).toString();
        } catch {
          return new URL(`https://${env.API_URL}`).toString();
        }
      })(),
      description: 'Deepcrawl Official API server',
    },
  ],
  tags: [
    {
      name: 'Read Website',
      description: 'API endpoints for reading and extracting content from URLs',
    },
    {
      name: 'Extract Links',
      description: 'API endpoints for extracting links and building sitemaps',
    },
  ],
  commonSchemas: {
    ReadOptions: {
      schema: ReadOptionsSchema,
    },
    ReadSuccessResponse: {
      schema: ReadSuccessResponseSchema,
    },
    ReadErrorResponse: {
      schema: ReadErrorResponseSchema,
    },
    LinksOptions: {
      schema: LinksOptionsSchema,
    },
    LinksSuccessResponse: {
      schema: LinksSuccessResponseSchema,
    },
    LinksErrorResponse: {
      schema: LinksErrorResponseSchema,
    },
    UndefinedError: {
      error: 'UndefinedError',
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
} satisfies OpenAPIGeneratorGenerateOptions;

export const openAPIHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('❌ OpenAPIHandler error', error);
    }),
  ],
  plugins: [
    new ResponseHeadersPlugin(),
    new ZodSmartCoercionPlugin(),
    new OpenAPIReferencePlugin({
      schemaConverters: SchemaConverters,
      specGenerateOptions: OpenAPISpecGenerateOptions,
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
