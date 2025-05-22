import { HTMLCleaningOptionsSchema } from '@/services/html-cleaning/types';
import {
  ExtractedLinksSchema,
  LinkExtractionOptionsSchema,
} from '@/services/link/types';
import {
  MetadataOptionsSchema,
  PageMetadataSchema,
} from '@/services/metadata/types';
import { z } from 'zod';

/**
 * Base interface for all browse response types.
 * Defines common properties that exist in both success and error responses.
 *
 * @property success - Indicates whether the operation was successful
 * @property url - The URL that was requested to be browsed
 */
interface BrowseBaseResponse {
  /**
   * Indicates whether the operation was successful.
   */
  success: boolean;

  /**
   * The URL that was requested to be browsed.
   */
  url: string;
}

/**
 * Response returned when a browse operation is successful.
 * Extends the base response and includes the DataFormats directly in the response.
 *
 * @property success - Discriminator field to identify a successful response (always true)
 * @property url - The URL that was requested to be browsed
 * @property status - HTTP status code of the response (if applicable)
 * @property completedTimestamp - ISO timestamp when the browsing operation completed
 * @property browserSessionId - Unique identifier for the browser session that processed this request
 * @property markdown - Optional markdown representation of the page content
 * @property rawHtml - Optional raw HTML of the page as returned by the server
 * @property cleanedHtml - Optional cleaned HTML with unnecessary elements removed
 * @property links - Optional extracted links from the page
 * @property metadata - Optional metadata extracted from the page
 *
 * @example
 * ```typescript
 * const successResponse: BrowseSuccessResponse = {
 *   success: true,
 *   url: "https://example.com",
 *   completedTimestamp: "2025-04-02T14:28:23.000Z",
 *   browserSessionId: "session-123",
 *   markdown: "# Example Page\nContent here..."
 * };
 * ```
 */
export interface BrowseSuccessResponse extends BrowseBaseResponse, DataFormats {
  /**
   * Discriminator field to identify a successful response.
   * Will always be `true` for success responses.
   */
  success: true;

  /**
   * HTTP status code of the response (if applicable).
   * Typically 200 for successful requests.
   */
  status?: number;

  /**
   * ISO timestamp when the browsing operation completed.
   * Format: ISO 8601 string (e.g., "2025-04-02T14:28:23.000Z")
   */
  completedTimestamp: string;

  /**
   * Unique identifier for the browser session that processed this request.
   * Can be used for debugging or tracking purposes.
   */
  browserSessionId: string;
}

/**
 * Response returned when a browse operation fails.
 * Contains error information about what went wrong.
 *
 * @property success - Discriminator field to identify an error response (always false)
 * @property url - The URL that was requested to be browsed
 * @property error - Error message describing what went wrong
 *
 * @example
 * ```typescript
 * const errorResponse: BrowseErrorResponse = {
 *   success: false,
 *   url: "https://example.com",
 *   error: "Failed to connect to the server"
 * };
 * ```
 */
export interface BrowseErrorResponse extends BrowseBaseResponse {
  /**
   * Discriminator field to identify an error response.
   * Will always be `false` for error responses.
   */
  success: false;

  /**
   * Error message describing what went wrong.
   * Provides details about the failure reason.
   */
  error: string;
}

/**
 * Union type representing either a successful or failed browse operation.
 * Uses a discriminated union pattern with the 'success' property as the discriminator.
 *
 * @example
 * ```typescript
 * function handleResponse(response: BrowseResponse) {
 *   if (response.success) {
 *     // TypeScript knows this is a BrowseSuccessResponse
 *     console.log(response.markdown);
 *   } else {
 *     // TypeScript knows this is a BrowseErrorResponse
 *     console.error(response.error);
 *   }
 * }
 * ```
 */
export type BrowseResponse = BrowseSuccessResponse | BrowseErrorResponse;

/**
 * Schema for validating the different data formats that can be returned from a browse operation.
 * Each format is optional and will only be included if requested.
 */
const DataFormatsSchema = z.object({
  /**
   * Markdown representation of the page content.
   * Contains the page content converted to Markdown format.
   */
  markdown: z.string().optional(),

  /**
   * Raw HTML of the page as returned by the server.
   * Contains the unmodified HTML response from the target URL.
   */
  rawHtml: z.string().optional(),

  /**
   * Cleaned HTML with unnecessary elements removed.
   * Contains a sanitized version of the HTML with ads, scripts, and other non-content elements removed.
   */
  cleanedHtml: z.string().optional(),

  /**
   * Extracted links from the page.
   * Contains information about links found on the page.
   */
  links: ExtractedLinksSchema.optional(),

  /**
   * Metadata extracted from the page.
   * Contains information like title, description, and other meta tags.
   */
  metadata: PageMetadataSchema.optional(),
});

/**
 * Represents the various data formats that can be returned from a browse operation.
 * All properties are optional and will only be included if specifically requested.
 *
 * @property markdown - Optional markdown representation of the page content
 * @property rawHtml - Optional raw HTML of the page as returned by the server
 * @property cleanedHtml - Optional cleaned HTML with unnecessary elements removed
 * @property links - Optional extracted links from the page
 * @property metadata - Optional metadata extracted from the page
 */
export type DataFormats = z.infer<typeof DataFormatsSchema>;

/**
 * Enum of available data formats that can be requested in a browse operation.
 * Used to specify which formats should be included in the response.
 */
export const DataFormatsEnum = z.enum([
  'markdown',
  'rawHtml',
  'cleanedHtml',
  'links',
  'metadata',
]);

/**
 * Schema for validating browse operation options.
 * Defines the structure of the options object that can be passed to the browse function.
 */
export const BrowseOptionsSchema = z.object({
  /**
   * Array of data formats to include in the response.
   * If not specified, defaults to ['markdown', 'metadata'].
   *
   * @example
   * ```typescript
   * const options = {
   *   formats: ['markdown', 'links', 'metadata']
   * };
   * ```
   */
  formats: z
    .array(DataFormatsEnum)
    .optional()
    .default(['markdown', 'metadata']),

  /**
   * Options for metadata extraction.
   * If not specified, defaults to the default metadata options.
   */
  metadataOptions: MetadataOptionsSchema.optional(),

  /**
   * Options for link extraction.
   * If not specified, defaults to the default link extraction options.
   */
  linksOptions: LinkExtractionOptionsSchema.optional(),

  /**
   * Options for HTML cleaning.
   * If not specified, defaults to the default HTML cleaning options.
   */
  cleanedHtmlOptions: HTMLCleaningOptionsSchema.optional(),
});

/**
 * Represents the options that can be passed to the browse function.
 * Defines the structure of the options object.
 *
 * @property formats - Array of data formats to include in the response
 * @property metadataOptions - Options for metadata extraction
 * @property linksOptions - Options for link extraction
 * @property cleanedHtmlOptions - Options for HTML cleaning
 */
export type BrowseOptions = z.infer<typeof BrowseOptionsSchema>;

/**
 * Type representing a successful text response from a GET query.
 * A string containing the response data.
 */
export type BrowseQuerySucessTextResponse = string;

/**
 * Type representing a successful JSON response from a GET query.
 * Includes the browse response data and the request duration.
 *
 * @property success - Discriminator field to identify a successful response (always true)
 * @property url - The URL that was requested to be browsed
 * @property completedTimestamp - ISO timestamp when the browsing operation completed
 * @property browserSessionId - Unique identifier for the browser session
 * @property requestDuration - Duration of the request in milliseconds
 * @property markdown - Optional markdown representation of the page content
 * @property rawHtml - Optional raw HTML of the page as returned by the server
 * @property cleanedHtml - Optional cleaned HTML with unnecessary elements removed
 * @property links - Optional extracted links from the page
 * @property metadata - Optional metadata extracted from the page
 *
 * @example
 * ```typescript
 * const jsonResponse: BrowseQuerySucessJsonResponse = {
 *   success: true,
 *   url: "https://example.com",
 *   completedTimestamp: "2025-04-02T14:28:23.000Z",
 *   browserSessionId: "session-123",
 *   markdown: "# Example Page\nContent here...",
 *   requestDuration: "1234ms"
 * };
 * ```
 */
export type BrowseQuerySucessJsonResponse = BrowseSuccessResponse & {
  /**
   * Duration of the request in milliseconds.
   * Format: string with "ms" suffix (e.g., "1234ms")
   */
  requestDuration: string;
};

/**
 * Union type representing the possible responses from a GET query.
 * Can be either a successful text response, a successful JSON response, or an error response.
 */
export type BrowseQueryResponse =
  | BrowseQuerySucessJsonResponse
  | BrowseQuerySucessTextResponse
  | BrowseErrorResponse;

/**
 * Type representing an error response from a POST query.
 * Contains an error message describing what went wrong.
 *
 * @property success - Discriminator field to identify an error response (always false)
 * @property error - Error message describing what went wrong
 *
 * @example
 * ```typescript
 * const errorResponse: BrowsePostErrorResponse = {
 *   success: false,
 *   error: "Invalid URL format in batch request"
 * };
 * ```
 */
export type BrowsePostErrorResponse = {
  /**
   * Discriminator field to identify an error response.
   * Will always be `false` for error responses.
   */
  success: false;

  /**
   * Error message describing what went wrong.
   * Provides details about the failure reason.
   */
  error: string;
};

/**
 * Type representing a successful response from a POST query.
 * Includes the request duration, successful responses, and failed responses.
 *
 * @property requestDuration - Duration of the request in milliseconds
 * @property successful - Array of successful browse responses
 * @property failed - Array of failed browse responses
 *
 * @example
 * ```typescript
 * const successResponse: BrowsePostSuccessResponse = {
 *   requestDuration: "2345ms",
 *   successful: [
 *     {
 *       success: true,
 *       url: "https://example.com",
 *       completedTimestamp: "2025-04-02T14:28:23.000Z",
 *       browserSessionId: "session-123",
 *       markdown: "# Example Page\nContent here..."
 *     }
 *   ],
 *   failed: [
 *     {
 *       success: false,
 *       url: "https://invalid-url.com",
 *       error: "Failed to connect to the server"
 *     }
 *   ]
 * };
 * ```
 */
export type BrowsePostSuccessResponse = {
  /**
   * Duration of the request in milliseconds.
   * Format: string with "ms" suffix (e.g., "2345ms")
   */
  requestDuration: string;

  /**
   * Array of successful browse responses.
   * Contains details for each URL that was successfully processed.
   */
  successful: BrowseSuccessResponse[];

  /**
   * Array of failed browse responses.
   * Contains error details for each URL that failed processing.
   */
  failed: BrowseErrorResponse[];
};

/**
 * Union type representing the possible responses from a POST query.
 * Can be either a successful response or an error response.
 *
 * @example
 * ```typescript
 * function handleBatchResponse(response: BrowsePostResponse) {
 *   if (response.success === false) {
 *     // This is a BrowsePostErrorResponse
 *     console.error(response.error);
 *   } else {
 *     // This is a BrowsePostSuccessResponse
 *     console.log(`Processed ${response.successful.length} URLs successfully`);
 *     console.log(`Failed to process ${response.failed.length} URLs`);
 *   }
 * }
 * ```
 */
export type BrowsePostResponse =
  | BrowsePostSuccessResponse
  | BrowsePostErrorResponse;
