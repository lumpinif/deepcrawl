import { env } from 'cloudflare:workers';
import {
  CacheOptionsSchema,
  ExtractedLinksSchema,
  FetchOptionsSchema,
  GetLogsOptionsSchema,
  GetLogsResponseSchema,
  HTMLRewriterOptionsSchema,
  LinkExtractionOptionsSchema,
  LinksErrorResponseSchema,
  LinksOptionsSchema,
  LinksSuccessResponseSchema,
  LinksTreeSchema,
  MetadataOptionsSchema,
  PageMetadataSchema,
  ReadErrorResponseSchema,
  ReaderCleaningOptionsSchema,
  ReadOptionsSchema,
  ReadSuccessResponseSchema,
  ScrapedDataSchema,
  ScrapeOptionsSchema,
  SkippedLinksSchema,
  SkippedUrlSchema,
  VisitedUrlSchema,
} from '@deepcrawl/types';
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from '@orpc/json-schema';
import type {
  ConditionalSchemaConverter,
  OpenAPIGeneratorGenerateOptions,
} from '@orpc/openapi';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import { CORSPlugin } from '@orpc/server/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { CORS_OPTIONS } from '@/middlewares/cors.hono';

import { router } from '@/routers';
import packageJSON from '../../../package.json' with { type: 'json' };

export const SchemaConverters: ConditionalSchemaConverter[] = [
  new ZodToJsonSchemaConverter(),
] satisfies ConditionalSchemaConverter[];

export const OpenAPISpecGenerateOptions = {
  info: {
    title: 'Deepcrawl',
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
    LinkExtractionOptions: {
      schema: LinkExtractionOptionsSchema,
    },
    MetadataOptions: {
      schema: MetadataOptionsSchema,
    },
    ReaderCleaningOptions: {
      schema: ReaderCleaningOptionsSchema,
    },
    HTMLRewriterOptions: {
      schema: HTMLRewriterOptionsSchema,
    },
    FetchOptions: {
      schema: FetchOptionsSchema,
    },
    CacheOptions: {
      schema: CacheOptionsSchema,
    },
    ScrapeOptions: {
      schema: ScrapeOptionsSchema,
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
    GetLogsOptions: {
      schema: GetLogsOptionsSchema,
    },
    GetLogsResponse: {
      schema: GetLogsResponseSchema,
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
