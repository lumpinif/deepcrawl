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
  ReadErrorResponseSchema,
  ReadOptionsSchema,
  ReadSuccessResponseSchema,
} from '@deepcrawl/types';
import { ResponseHeadersPlugin } from '@orpc/server/plugins';
import packageJSON from '../../../package.json' with { type: 'json' };

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
      schemaConverters: [new ZodV4ToJsonSchemaConverter()],
      specGenerateOptions: {
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
            description:
              'API endpoints for reading and extracting content from URLs',
          },
          {
            name: 'Extract Links',
            description:
              'API endpoints for extracting links and building sitemaps',
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
      },
      docsConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: 'your-api-key',
            },
          },
        },
      },
      specPath: '/openapi',
      docsPath: '/docs',
    }),
  ],
});
