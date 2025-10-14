import type { z } from 'zod/v4';
import { MetricsOptionsSchema } from '../../metrics/schemas';
import { CacheOptionsSchema } from '../../services/cache/schemas';
import { MarkdownConverterOptionsSchema } from '../../services/markdown/schemas';
import type {
  ReadErrorResponseSchema,
  ReadOptionsSchema,
  ReadResponseBaseSchema,
  ReadSuccessResponseSchema,
} from '../read/schemas';

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

/**
 * Base type for all read operation responses.
 * Contains common properties shared by both successful and error responses.
 *
 * @property {boolean} success - Whether the read operation completed successfully
 * @property {boolean} [cached] - Whether response was served from cache
 * @property {string} targetUrl - Final URL processed after redirects
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
 * @example ReadSuccessResponse // When operation succeeds
 * @example ReadErrorResponse // When operation fails
 */
export type ReadPostResponse = ReadSuccessResponse | ReadErrorResponse;

/**
 * Complete union type for all possible read operation responses.
 * Covers both simple string responses and structured POST responses.
 *
 * @example string // Simple text response
 * @example ReadSuccessResponse // Structured success response
 * @example ReadErrorResponse // Structured error response
 */
export type ReadResponse = ReadStringResponse | ReadPostResponse;
