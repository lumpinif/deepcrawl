import { BaseErrorResponseSchema } from '@deepcrawl/types/common/response-schemas';
import { smartboolOptionalWithDefault } from '@deepcrawl/types/common/smart-schemas';
import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
  DEFAULT_READ_OPTIONS,
  DEFAULT_SCRAPE_OPTIONS,
} from '@deepcrawl/types/configs';
import { MetricsOptionsSchema, MetricsSchema } from '@deepcrawl/types/metrics';
import { CacheOptionsSchema } from '@deepcrawl/types/services/cache/types';
import { MarkdownConverterOptionsSchema } from '@deepcrawl/types/services/markdown/types';

import {
  ScrapedDataSchema,
  ScrapeOptionsSchema,
} from '@deepcrawl/types/services/scrape';
import { z } from 'zod/v4';

/* NOTE: IN ZOD V4: The input type of all z.coerce schemas is now unknown. THIS MIGHT BREAKES CURRENT TYPES */

const { markdown, rawHtml, metricsOptions } = DEFAULT_READ_OPTIONS;
const { enabled: defaultCacheEnabled } = DEFAULT_CACHE_OPTIONS;

/**
 * Extends `ScrapeOptionsSchema`.
 * Options for read operation.
 * Controls how the read operation is performed.
 */
export const ReadOptionsSchema = z
  .object({
    /**
     * The URL to scrape.
     * Must be a valid URL string.
     */
    url: z.string().meta({
      description: 'The URL to read and extract content from',
      examples: ['https://example.com', 'example.com'],
    }),

    /**
     * Whether to extract markdown from the page.
     * Default: true
     */
    markdown: smartboolOptionalWithDefault(markdown).meta({
      description: 'Whether to extract markdown from the page.',
      examples: [markdown, !markdown],
    }),

    /**
     * Whether to return raw HTML.
     * Default: false
     */
    rawHtml: smartboolOptionalWithDefault(rawHtml).meta({
      description: 'Whether to return raw HTML.',
      examples: [rawHtml, !rawHtml],
    }),

    /**
     * Cache configuration for read operation based on KV put options except for `metadata`
     * An object containing the `expiration` (optional) and `expirationTtl` (optional) attributes
     * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/#put-method
     */
    cacheOptions: CacheOptionsSchema.optional().meta({
      description:
        'Cache configuration for read operation based on KV put options except for `metadata`',
      examples: [DEFAULT_CACHE_OPTIONS],
    }),

    /**
     * Options for markdown conversion.
     * Controls how markdown is converted.
     * @see {@link MarkdownConverterOptionsSchema}
     */
    markdownConverterOptions: MarkdownConverterOptionsSchema.optional().meta({
      title: 'MarkdownConverterOptions',
      description: 'Options for markdown conversion.',
      default: DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
      examples: [DEFAULT_MARKDOWN_CONVERTER_OPTIONS],
    }),

    /* Options for metrics */
    metricsOptions: MetricsOptionsSchema.optional().meta({
      description: 'Options for metrics.',
      default: metricsOptions,
      examples: [metricsOptions, !metricsOptions],
    }),
  })
  .extend(ScrapeOptionsSchema.shape)
  .meta({
    title: 'ReadOptions',
    description: 'Configuration options for read operation',
    examples: [
      {
        url: 'https://example.com',
        ...DEFAULT_READ_OPTIONS,
        ...DEFAULT_SCRAPE_OPTIONS,
      },
    ],
  });

export const ReadResponseBaseSchema = z.object({
  success: z.boolean().meta({
    description: 'Indicates whether the operation was successful',
  }),
  cached: z
    .boolean()
    .default(defaultCacheEnabled)
    .optional()
    .meta({
      description:
        'The flag to indicate whether the response was cached. This is always false since we are not caching the response for privacy reasons. You need to cache it yourself in your application.',
      examples: [defaultCacheEnabled],
    }),
  targetUrl: z.string().meta({
    description: 'The URL that was requested to be processed',
    examples: ['https://example.com'],
  }),
});

export const ReadErrorResponseSchema = BaseErrorResponseSchema;

export const ReadSuccessResponseSchema = ReadResponseBaseSchema.extend({
  success: z.literal(true).meta({
    description: 'Indicates that the operation was successful',
    examples: [true],
  }),
})
  .extend(ScrapedDataSchema.omit({ rawHtml: true }).shape)
  .extend({
    markdown: z
      .string()
      .optional()
      .meta({
        description: 'Markdown content of the page.',
        examples: [
          '# Example Article\n\nThis is the main content of the article.',
        ],
      }),
    rawHtml: z
      .string()
      .optional()
      .meta({
        description: 'Raw HTML content of the page.',
        examples: [
          '<html><head><title>Example</title></head><body><h1>Example Article</h1></body></html>',
        ],
      }),
    metrics: MetricsSchema.optional().meta({
      description: 'Metrics for the read operation.',
      examples: [
        {
          readableDuration: '0.2s',
          durationMs: 200,
          startTimeMs: 1704067800000,
          endTimeMs: 1704067800200,
        },
      ],
    }),
  })
  .meta({
    title: 'ReadSuccessResponse',
    description: 'Successful response from the read operation',
    examples: [
      {
        success: true,
        cached: defaultCacheEnabled,
        targetUrl: 'https://example.com/article',
        title: 'Example Article',
        description: 'This is an example article description',
        markdown:
          '# Example Article\n\nThis is the main content of the article.\n\n## Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.',
        metadata: {
          title: 'Example Article',
          description: 'This is an example article description',
          language: 'en',
          canonical: 'https://example.com/article',
          robots: 'index, follow',
          author: 'John Doe',
          keywords: ['example', 'article', 'demo'],
          favicon: 'https://example.com/favicon.ico',
          ogTitle: 'Example Article',
          ogDescription: 'This is an example article description',
          ogImage: 'https://example.com/og-image.jpg',
          ogUrl: 'https://example.com/article',
          ogType: 'article',
          ogSiteName: 'Example Site',
          twitterCard: 'summary_large_image',
          twitterTitle: 'Example Article',
          twitterDescription: 'This is an example article description',
          twitterImage: 'https://example.com/twitter-image.jpg',
          isIframeAllowed: true,
        },
        metrics: {
          readableDuration: '0.2s',
          durationMs: 200,
          startTimeMs: 1704067800000,
          endTimeMs: 1704067800200,
        },
      },
    ],
  });

// type PartialExceptUrl<T extends z.infer<typeof ReadOptionsSchema>> = {
//   url: T['url'];
// } & Partial<Omit<T, 'url'>>;

/**
 * @note `ReadOptions` extends `ScrapeOptions`
 * The types from `ReadOptions` are overridden to be partial except for `url` for convenience.
 * Type representing options for read operations.
 * Derived from the readOptionsSchema.
 */
export type ReadOptions = z.infer<typeof ReadOptionsSchema>;

/**
 * Base type for read responses.
 * Contains common properties for both success and error responses.
 */
export type ReadResponseBase = z.infer<typeof ReadResponseBaseSchema>;

/**
 * Type representing an error response.
 */
export type ReadErrorResponse = z.infer<typeof ReadErrorResponseSchema>;

/**
 * Type representing a success response.
 */
export type ReadSuccessResponse = z.infer<typeof ReadSuccessResponseSchema>;

/**
 * Type representing a string response.
 */
export type ReadStringResponse = string;

/**
 * Type representing a POST response.
 */
export type ReadPostResponse = ReadSuccessResponse | ReadErrorResponse;

/**
 * Type representing a response.
 */
export type ReadResponse = ReadStringResponse | ReadPostResponse;
