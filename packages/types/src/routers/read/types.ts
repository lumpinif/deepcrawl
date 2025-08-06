import { BaseErrorResponseSchema } from '@deepcrawl/types/common/response-schemas';
import {
  smartboolFalse,
  smartboolTrue,
} from '@deepcrawl/types/common/smart-schemas';
import { CacheOptionsSchema } from '@deepcrawl/types/services/cache/types';

import {
  ScrapedDataSchema,
  ScrapeOptionsSchema,
} from '@deepcrawl/types/services/scrape';
import { z } from 'zod/v4';

/* NOTE: IN ZOD V4: The input type of all z.coerce schemas is now unknown. THIS MIGHT BREAKES CURRENT TYPES */

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
    markdown: smartboolTrue().meta({
      description: 'Whether to extract markdown from the page.',
      examples: [true],
    }),

    /**
     * Whether to return raw HTML.
     * Default: false
     */
    rawHtml: smartboolFalse().meta({
      description: 'Whether to return raw HTML.',
      examples: [false],
    }),

    /**
     * Cache configuration for read operation based on KV put options except for `metadata`
     * An object containing the `expiration` (optional) and `expirationTtl` (optional) attributes
     * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/#put-method
     */
    cacheOptions: CacheOptionsSchema.meta({
      description:
        'Cache configuration for read operation based on KV put options except for `metadata`',
      examples: [
        { expiration: 1717708800, expirationTtl: 86400 }, // expirationTtl: 86400 = 1 day
      ],
    }),
  })
  .extend(ScrapeOptionsSchema.shape)
  .meta({
    title: 'ReadOptions',
    description: 'Configuration options for read operation',
    examples: [
      {
        url: 'https://example.com',
        metadata: true,
        markdown: true,
        cleanedHtml: false,
        robots: false,
        rawHtml: false,
        metadataOptions: {
          title: true,
          description: true,
          language: true,
          canonical: true,
          robots: true,
        },
      },
    ],
  });

export const ReadResponseBaseSchema = z.object({
  success: z.boolean().meta({
    description: 'Indicates whether the operation was successful',
  }),
  cached: z
    .boolean()
    .optional()
    .default(false)
    .meta({
      description:
        'The flag to indicate whether the response was cached. This is always false since we are not caching the response for privacy reasons. You need to cache it yourself in your application.',
      examples: [false],
    }),
  targetUrl: z.string().meta({
    description: 'The URL that was requested to be processed',
    examples: ['https://example.com'],
  }),
});

export const ReadErrorResponseSchema = BaseErrorResponseSchema;

export const MetricsSchema = z
  .object({
    readableDuration: z.string().meta({
      description: 'Human-readable representation of the operation duration',
      examples: ['0.2s'],
    }),
    duration: z.number().meta({
      description: 'Duration of the operation in milliseconds',
      examples: [200],
    }),
    startTime: z.number().meta({
      description: 'Timestamp in milliseconds when the operation started',
      examples: [1704067800000],
    }),
    endTime: z.number().meta({
      description: 'Timestamp in milliseconds when the operation finished',
      examples: [1704067800200],
    }),
  })
  .meta({
    title: 'Metrics',
    description: 'Performance metrics for the read operation',
    examples: [
      {
        readableDuration: '0.2s',
        duration: 200,
        startTime: 1704067800000,
        endTime: 1704067800200,
      },
    ],
  });

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
          duration: 200,
          startTime: 1704067800000,
          endTime: 1704067800200,
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
        cached: false,
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
          duration: 200,
          startTime: 1704067800000,
          endTime: 1704067800200,
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
