import { env } from 'cloudflare:workers';
import {
  ExtractedLinksSchema,
  LinksErrorResponseSchema,
  LinksOptionsSchema,
  LinksSuccessResponseSchema,
  LinksTreeSchema,
  PageMetadataSchema,
  ReadErrorResponseSchema,
  ReadOptionsSchema,
  ReadSuccessResponseSchema,
  ScrapedDataSchema,
  SkippedLinksSchema,
  SkippedUrlSchema,
  VisitedUrlSchema,
} from '@deepcrawl/types';
import type { OpenAPIGeneratorGenerateOptions } from '@orpc/openapi';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import { ResponseHeadersPlugin } from '@orpc/server/plugins';
import {
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
  experimental_ZodToJsonSchemaConverter as ZodV4ToJsonSchemaConverter,
} from '@orpc/zod/zod4';
import { router } from '@/routers';
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
      // url: 'https://api.deepcrawl.dev',
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
      name: 'Read URL',
      description: 'API endpoints for reading and extracting content from URLs',
    },
    {
      name: 'Extract Links',
      description: 'API endpoints for extracting links and building links tree',
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
    LinksTree: {
      schema: LinksTreeSchema,
    },
    ScrapedData: {
      schema: ScrapedDataSchema,
    },
    PageMetadata: {
      schema: PageMetadataSchema,
    },
    ExtractedLinks: {
      schema: ExtractedLinksSchema,
    },
    SkippedLinks: {
      schema: SkippedLinksSchema,
    },
    SkippedUrl: {
      schema: SkippedUrlSchema,
    },
    VisitedUrl: {
      schema: VisitedUrlSchema,
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
