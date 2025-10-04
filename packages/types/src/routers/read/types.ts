import { BaseErrorResponseSchema } from '@deepcrawl/types/common/response-schemas';
import { OptionalBoolWithDefault } from '@deepcrawl/types/common/shared-schemas';
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
 * Configuration schema for read operations that extract content from web pages.
 * Extends ScrapeOptionsSchema with additional read-specific options.
 *
 * @property {string} url - Target URL to read and extract content from
 * @property {boolean} [markdown] - Whether to extract markdown content from the page
 * @property {boolean} [rawHtml] - Whether to include raw HTML content in response
 * @property {Object} [cacheOptions] - Caching configuration for Cloudflare KV storage
 * @property {Object} [markdownConverterOptions] - Configuration for markdown conversion process
 * @property {Object} [metricsOptions] - Performance metrics collection settings
 *
 * @see {@link ScrapeOptionsSchema} for inherited scraping options
 * @see {@link CacheOptionsSchema} for cacheOptions structure
 * @see {@link MarkdownConverterOptionsSchema} for markdownConverterOptions structure
 * @see {@link MetricsOptionsSchema} for metricsOptions structure
 *
 * @example
 * ```typescript
 * const options = {
 *   url: 'https://example.com',
 *   markdown: true,
 *   rawHtml: false,
 *   cacheOptions: { expirationTtl: 3600 }
 * };
 * ```
 */
export const ReadOptionsSchema = z
  .object({
    /**
     * The target URL to read and extract content from.
     * Accepts both full URLs and domain names (protocol will be inferred).
     *
     * @example 'https://example.com/article'
     * @example 'example.com'
     */
    url: z.string().meta({
      description: 'The URL to read and extract content from',
      examples: ['https://example.com', 'example.com'],
    }),

    /**
     * Whether to extract and return markdown content from the page.
     * When enabled, HTML is converted to clean, readable markdown format.
     *
     * @default true
     * @example true // Returns markdown content
     * @example false // Skips markdown extraction
     */
    markdown: OptionalBoolWithDefault(markdown).meta({
      description: 'Whether to extract markdown from the page.',
      examples: [markdown, !markdown],
    }),

    /**
     * Whether to include raw HTML content in the response.
     * Useful when you need the original HTML structure preserved.
     *
     * @default false
     * @example true // Includes raw HTML in response
     * @example false // Excludes raw HTML
     */
    rawHtml: OptionalBoolWithDefault(rawHtml).meta({
      description: 'Whether to return raw HTML.',
      examples: [rawHtml, !rawHtml],
    }),

    /**
     * Caching configuration for the read operation.
     * Controls how long the response should be cached in Cloudflare KV storage.
     * Based on KV put options excluding metadata.
     *
     * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/#put-method
     * @example { expirationTtl: 3600 } // Cache for 1 hour
     */
    cacheOptions: CacheOptionsSchema.optional().meta({
      description:
        'Cache configuration for read operation based on KV put options except for `metadata`',
      examples: [DEFAULT_CACHE_OPTIONS],
    }),

    /**
     * Configuration options for markdown conversion process.
     * Controls how HTML is transformed into markdown format.
     *
     * @see {@link MarkdownConverterOptionsSchema}
     * @example { preserveImages: true, stripScripts: false }
     */
    markdownConverterOptions: MarkdownConverterOptionsSchema.optional().meta({
      title: 'MarkdownConverterOptions',
      description: 'Options for markdown conversion.',
      default: DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
      examples: [DEFAULT_MARKDOWN_CONVERTER_OPTIONS],
    }),

    /**
     * Performance metrics collection settings.
     * Controls whether timing and performance data should be included in the response.
     *
     * @default { enable: true }
     * @example { enable: true } // Include timing metrics
     * @example { enable: false } // Skip metrics collection
     */
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

/**
 * @name GetMarkdownOptionsSchema || ReadGETInputSchema
 * @description Input schema for the GET endpoint
 * @note Only includes:
 * - `url` - The webpage URL to convert to markdown
 * - `cacheOptions` - Cache settings
 * - `markdownConverterOptions` - Markdown conversion settings
 * from {@link ReadOptionsSchema}
 *
 * @param {string} [url] - The webpage URL to convert to markdown
 * @param {object} [cacheOptions] - Cache settings
 * @param {string} [cleaningProcessor] - HTML cleaning processor
 * @param {object} [markdownConverterOptions] - Markdown conversion settings
 */
export const GetMarkdownOptionsSchema = ReadOptionsSchema.pick({
  url: true,
  cacheOptions: true,
  cleaningProcessor: true,
  markdownConverterOptions: true,
});
/**@description Same as {@link GetMarkdownOptionsSchema} */
export const ReadGETInputSchema = ReadOptionsSchema.pick({
  url: true,
  cacheOptions: true,
  cleaningProcessor: true,
  markdownConverterOptions: true,
});

/**
 * Base response schema containing common fields for all read operation responses.
 * Provides fundamental information about the operation status and target.
 *
 * @property {string} requestId - Unique identifier (request ID) for the activity log entry
 * @property {boolean} success - Whether the read operation completed successfully
 * @property {boolean} [cached] - Whether response was served from cache
 * @property {string} targetUrl - Final URL processed after redirects
 *
 * @example
 * ```typescript
 * {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: true,
 *   cached: false,
 *   targetUrl: 'https://example.com'
 * }
 * ```
 */
export const ReadResponseBaseSchema = z.object({
  /**
   * Unique identifier (request ID) for the activity log entry
   *
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  requestId: z.string().meta({
    description: 'Unique identifier (request ID) for the activity log entry',
    examples: ['123e4567-e89b-12d3-a456-426614174000'],
  }),

  /**
   * Indicates whether the read operation completed successfully.
   *
   * @example true // Operation succeeded
   * @example false // Operation failed
   */
  success: z.boolean().meta({
    description: 'Indicates whether the operation was successful',
  }),

  /**
   * Indicates if the response was served from cache.
   * Currently always false as responses are not cached for privacy reasons.
   * Caching should be implemented by the consuming application.
   *
   * @default false
   * @example false // Response was not cached
   */
  cached: z
    .boolean()
    .default(defaultCacheEnabled)
    .optional()
    .meta({
      description:
        'The flag to indicate whether the response was cached. This is always false since we are not caching the response for privacy reasons. You need to cache it yourself in your application.',
      examples: [defaultCacheEnabled],
    }),

  /**
   * The final URL that was processed after any redirects.
   * May differ from the original requested URL due to redirects or canonicalization.
   *
   * @example 'https://example.com/final-page'
   * @example 'https://www.example.com' // After redirect from example.com
   */
  targetUrl: z.string().meta({
    description: 'The URL that was requested to be processed',
    examples: ['https://example.com'],
  }),

  /**
   * ISO timestamp when the request was processed.
   *
   * @example '2025-09-12T10:30:00.000Z'
   */
  timestamp: z.string().meta({
    description: 'ISO timestamp when the request was processed',
    examples: ['2025-09-12T10:30:00.000Z'],
  }),
});

/**
 * Schema for error responses from read operations.
 * Inherits from BaseErrorResponseSchema with error details and status codes.
 *
 * @property {string} requestId - Unique identifier (request ID) for the activity log entry
 * @property {false} success - Always false for error responses
 * @property {string} error - Error message describing what went wrong
 * @property {string} [requestUrl] - URL, raw url, that was requested to be processed and might be different from the target url
 * @property {string} targetUrl - URL that was being processed when error occurred
 * @property {string} timestamp - ISO timestamp when the error occurred
 *
 * @see {@link BaseErrorResponseSchema} for base error response structure
 *
 * @example
 * ```typescript
 * {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: false,
 *   error: 'Failed to fetch URL',
 *   requestUrl: 'https://example.com/article#fragment', // optional
 *   targetUrl: 'https://example.com/article',
 *   timestamp: '2025-09-12T10:30:00.000Z'
 * }
 * ```
 */
export const ReadErrorResponseSchema = BaseErrorResponseSchema;

/**
 * Schema for successful read operation responses.
 * Contains extracted content, metadata, and optional performance metrics.
 * Extends ReadResponseBaseSchema with scraped data and content fields.
 *
 * @property {string} requestId - Unique identifier (request ID) for the activity log entry
 * @property {true} success - Always true for successful responses
 * @property {boolean} [cached] - Whether response was served from cache
 * @property {string} targetUrl - Final URL processed after redirects
 * @property {string} [markdown] - Extracted markdown content when enabled
 * @property {string} [rawHtml] - Raw HTML content when enabled
 * @property {Object} [metrics] - Performance timing data when enabled
 *
 * @see {@link ScrapedDataSchema} for inherited scraped data properties
 * @see {@link MetricsSchema} for metrics structure
 *
 * @example
 * ```typescript
 * {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: true,
 *   cached: false,
 *   targetUrl: 'https://example.com/article',
 *   title: 'Example Article',
 *   markdown: '# Example Article\n\nContent here...',
 *   metadata: { title: 'Example', description: '...' },
 *   metrics: { durationMs: 200, readableDuration: '0.2s' }
 * }
 * ```
 */
export const ReadSuccessResponseSchema = ReadResponseBaseSchema.extend({
  /**
   * Always true for successful responses.
   * Used for discriminating between success and error response types.
   *
   * @example true
   */
  success: z.literal(true).meta({
    description: 'Indicates that the operation was successful',
    examples: [true],
  }),
})
  .extend(ScrapedDataSchema.omit({ rawHtml: true }).shape)
  .extend({
    /**
     * Extracted markdown content from the web page.
     * Clean, readable text format converted from HTML.
     * Only included when markdown option is enabled.
     *
     * @example '# Article Title\n\nThis is the main content...'
     * @example undefined // When markdown extraction is disabled
     */
    markdown: z
      .string()
      .optional()
      .meta({
        description: 'Markdown content of the page.',
        examples: [
          '# Example Article\n\nThis is the main content of the article.',
        ],
      }),

    /**
     * Raw HTML content of the web page.
     * Original HTML structure preserved as-is.
     * Only included when rawHtml option is enabled.
     *
     * @example '<html><head><title>Example</title></head><body>...</body></html>'
     * @example undefined // When rawHtml extraction is disabled
     */
    rawHtml: z
      .string()
      .optional()
      .meta({
        description: 'Raw HTML content of the page.',
        examples: [
          '<html><head><title>Example</title></head><body><h1>Example Article</h1></body></html>',
        ],
      }),

    /**
     * Performance metrics for the read operation.
     * Includes timing data and operation duration.
     * Only included when metricsOptions.enable is true.
     *
     * @example { readableDuration: '0.2s', durationMs: 200, startTimeMs: 1704067800000 }
     * @example undefined // When metrics are disabled
     */
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
 * Configuration options for read operations.
 * Extends ScrapeOptions with read-specific settings like markdown extraction and caching.
 * All fields are optional except for `url` which is required.
 *
 * @property {string} url - Target URL to read and extract content from
 * @property {boolean} [markdown] - Whether to extract markdown content from the page
 * @property {boolean} [rawHtml] - Whether to include raw HTML content in response
 * @property {Object} [cacheOptions] - Caching configuration for Cloudflare KV storage
 * @property {Object} [markdownConverterOptions] - Configuration for markdown conversion process
 * @property {Object} [metricsOptions] - Performance metrics collection settings
 *
 * @property {boolean} [metadata] - Whether to extract metadata from the page
 * @property {boolean} [cleanedHtml] - Whether to return cleaned HTML
 * @property {boolean} [robots] - Whether to fetch and parse robots.txt
 * @property {boolean} [sitemapXML] - Whether to fetch and parse sitemap.xml
 * @property {Object} [metadataOptions] - Options for metadata extraction
 * @property {'cheerio-reader'|'html-rewriter'} [cleaningProcessor] - The cleaning processor to use
 * @property {Object} [htmlRewriterOptions] - Options for HTML cleaning with html-rewriter
 * @property {Object} [readerCleaningOptions] - Options for HTML cleaning with cheerio-reader
 * @property {Object} [fetchOptions] - Options for the fetch request
 *
 * @see {@link CacheOptionsSchema} for cacheOptions structure
 * @see {@link MarkdownConverterOptionsSchema} for markdownConverterOptions structure
 * @see {@link MetricsOptionsSchema} for metricsOptions structure
 * @see {@link MetadataOptionsSchema} for metadataOptions structure
 * @see {@link HTMLRewriterOptionsSchema} for htmlRewriterOptions structure
 * @see {@link ReaderCleaningOptionsSchema} for readerCleaningOptions structure
 * @see {@link FetchOptionsSchema} for fetchOptions structure
 *
 * @example
 * ```typescript
 * const options: ReadOptions = {
 *   url: 'https://example.com',
 *   markdown: true,
 *   rawHtml: false,
 *   metadata: true,
 *   cleanedHtml: false,
 *   cleaningProcessor: 'cheerio-reader',
 *   cacheOptions: { expirationTtl: 3600 }
 * };
 * ```
 */
export type ReadOptions = z.infer<typeof ReadOptionsSchema>;

// @DEPRECATED AS WE REMOVED SMARTBOOL
// /**
//  * @description This is the input type for the `ReadOptions` schema.
//  * This is a standalone export type that can be used as input which contains both string and boolean for smartbool.
//  */
// export type ReadOptionsInput = z.input<typeof ReadOptionsSchema>;

/**
 * Base type for all read operation responses.
 * Contains common properties shared by both successful and error responses.
 *
 * @property {boolean} success - Whether the read operation completed successfully
 * @property {boolean} [cached] - Whether response was served from cache
 * @property {string} targetUrl - Final URL processed after redirects
 *
 * @example
 * ```typescript
 * const baseResponse: ReadResponseBase = {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: true,
 *   cached: false,
 *   targetUrl: 'https://example.com'
 * };
 * ```
 */
export type ReadResponseBase = z.infer<typeof ReadResponseBaseSchema>;

/**
 * Type for error responses from read operations.
 * Includes error details and status information when operations fail.
 *
 * @property {string} requestId - Unique identifier (request ID) for the activity log entry
 * @property {false} success - Always false for error responses
 * @property {string} error - Error message describing what went wrong
 * @property {string} [requestUrl] - URL, raw url, that was requested to be processed and might be different from the target url
 * @property {string} targetUrl - URL that was being processed when error occurred
 * @property {string} timestamp - ISO timestamp when the error occurred
 *
 * @example
 * ```typescript
 * const errorResponse: ReadErrorResponse = {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: false,
 *   error: 'Failed to fetch URL',
 *   requestUrl: 'https://example.com/article#fragment', // optional
 *   targetUrl: 'https://example.com/article',
 *   timestamp: '2025-09-12T10:30:00.000Z'
 * };
 * ```
 */
export type ReadErrorResponse = z.infer<typeof ReadErrorResponseSchema>;

/**
 * Type for successful read operation responses.
 * Contains extracted content, metadata, and optional performance metrics.
 *
 * @property {string} requestId - Unique identifier (request ID) for the activity log entry
 * @property {true} success - Always true for successful responses
 * @property {boolean} [cached] - Whether response was served from cache
 * @property {string} targetUrl - Final URL processed after redirects
 * @property {string} title - Extracted page title
 * @property {string} [description] - Extracted page description
 * @property {Object} [metadata] - Extracted page metadata (SEO, social, etc.)
 * @property {string} [cleanedHtml] - Sanitized HTML with unnecessary elements removed
 * @property {Object} [metaFiles] - Meta files like robots.txt and sitemap.xml
 * @property {string} [markdown] - Extracted markdown content when enabled
 * @property {string} [rawHtml] - Raw HTML content when enabled
 * @property {Object} [metrics] - Performance timing data when enabled
 *
 * @example
 * ```typescript
 * const successResponse: ReadSuccessResponse = {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: true,
 *   cached: false,
 *   targetUrl: 'https://example.com/article',
 *   title: 'Example Article',
 *   markdown: '# Example Article\n\nContent...',
 *   metadata: { title: 'Example', description: 'Description' },
 *   metrics: { durationMs: 200, readableDuration: '0.2s' }
 * };
 * ```
 */
export type ReadSuccessResponse = z.infer<typeof ReadSuccessResponseSchema>;

/**
 * Simple string response type for lightweight read operations.
 * Returns only the extracted content as a plain string.
 *
 * @example 'This is the extracted text content from the webpage.'
 */
export type ReadStringResponse = string;

/**
 * Union type for POST endpoint responses.
 * Can be either a successful response with data or an error response.
 *
 * @typedef {ReadSuccessResponse | ReadErrorResponse} ReadPostResponse
 * @property {ReadSuccessResponse} - Successful response with extracted content and metadata
 * @property {ReadErrorResponse} - Error response with failure details
 *
 * @example ReadSuccessResponse // When operation succeeds
 * @example ReadErrorResponse // When operation fails
 */
export type ReadPostResponse = ReadSuccessResponse | ReadErrorResponse;

/**
 * Complete union type for all possible read operation responses.
 * Covers both simple string responses and structured POST responses.
 *
 * @typedef {ReadStringResponse | ReadPostResponse} ReadResponse
 * @property {string} - Simple string response with extracted text content
 * @property {ReadSuccessResponse} - Structured success response with full data
 * @property {ReadErrorResponse} - Structured error response with failure details
 *
 * @example string // Simple text response
 * @example ReadSuccessResponse // Structured success response
 * @example ReadErrorResponse // Structured error response
 */
export type ReadResponse = ReadStringResponse | ReadPostResponse;
