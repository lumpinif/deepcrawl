import {
  CacheOptionsSchema,
  ExtractedLinksSchema,
  FetchOptionsSchema,
  GetManyLogsOptionsSchema,
  GetManyLogsResponseSchema,
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
import type {
  ConditionalSchemaConverter,
  OpenAPIGeneratorGenerateOptions,
} from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

import packageJSON from '../../../package.json' with { type: 'json' };

const API_URL = 'https://api.deepcrawl.dev';

export const OpenAPISpecBaseOptions = {
  info: {
    title: 'Deepcrawl',
    version: packageJSON.version,
  },
  security: [{ bearerAuth: [] }],
  servers: [
    {
      url: API_URL,
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
      schema: GetManyLogsOptionsSchema,
    },
    GetLogsResponse: {
      schema: GetManyLogsResponseSchema,
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

export const SchemaConverters: ConditionalSchemaConverter[] = [
  new ZodToJsonSchemaConverter(),
] satisfies ConditionalSchemaConverter[];
