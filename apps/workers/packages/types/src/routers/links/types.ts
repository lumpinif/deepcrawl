import type { ScrapedData } from '@/services/cheerio/types';
import { HTMLCleaningOptionsSchema } from '@/services/html-cleaning/types';
import {
  type ExtractedLinks,
  LinkExtractionOptionsSchema,
} from '@/services/link/types';
import {
  MetadataOptionsSchema,
  type PageMetadata,
} from '@/services/metadata/types';
import { z } from 'zod';

/**
 * Schema for content extraction options.
 * Defines options for extracting different types of content from a webpage.
 *
 * @property metadataOptions - Options for metadata extraction
 * @property linksOptions - Options for link extraction
 * @property cleanedHtmlOptions - Options for HTML cleaning
 */
export const contentOptionsSchema = z.object({
  /**
   * Options for metadata extraction.
   * Controls how metadata like title, description, etc. are extracted.
   */
  metadataOptions: MetadataOptionsSchema.optional(),

  /**
   * Options for link extraction.
   * Controls how links are extracted and categorized.
   */
  linksOptions: LinkExtractionOptionsSchema.optional(),

  /**
   * Options for HTML cleaning.
   * Controls how HTML is sanitized and cleaned.
   */
  cleanedHtmlOptions: HTMLCleaningOptionsSchema.optional(),
});

/**
 * Schema for tree options.
 * Defines options for building a site map tree.
 *
 * @property folderFirst - Whether to place folders before leaf nodes in the tree
 * @property linksOrder - How to order links within each folder
 */
export const treeOptionsSchema = z.object({
  /**
   * Whether to place folders before leaf nodes in the tree.
   * Default: true
   */
  folderFirst: z.preprocess(
    (val) => val !== 'false' && val !== false,
    z.boolean().optional(),
  ),
  /**
   * How to order links within each folder:
   *  - 'page'        preserve the original document order
   *  - 'alphabetical'  sort A→Z by URL
   * Default: 'page'
   */
  linksOrder: z.enum(['page', 'alphabetical']).optional(),

  /**
   * Whether to include extracted links for each node in the tree.
   * Default: true
   */
  extractedLinks: z.preprocess(
    (val) => val !== 'false' && val !== false,
    z.boolean().optional(),
  ),

  /**
   * Whether to exclude subdomain as root URL.
   * Default: true
   * e.g., if false: rootUrl: https://swr.vercel.app -> https://vercel.app
   */
  subdomainAsRootUrl: z.preprocess(
    (val) => val !== 'false' && val !== false,
    z.boolean().optional(),
  ),
});

/**
 * Schema for links route options.
 * Defines the configuration for a links operation.
 *
 * @property url - The URL to scrape
 * @property tree - Whether to build a site map tree
 * @property metadata - Whether to extract metadata from the page
 * @property cleanedHtml - Whether to return cleaned HTML
 * @property robots - Whether to fetch and parse robots.txt
 * @property sitemapXML - Whether to fetch and parse sitemap.xml
 * @property linksFromTarget - Whether to extract links from the target page
 * @property metadataOptions - Options for metadata extraction
 * @property linksOptions - Options for link extraction
 * @property cleanedHtmlOptions - Options for HTML cleaning
 * @property subdomainAsRootUrl - Whether to exclude subdomain as root URL
 *
 * @example
 * ```typescript
 * const options = {
 *   url: "https://example.com",
 *   tree: true,
 *   metadata: true,
 *   cleanedHtml: false,
 * };
 * ```
 */
export const linksOptionsSchema = z.object({
  /**
   * The URL to scrape.
   * Must be a valid URL string.
   */
  url: z.string(),

  /**
   * Whether to build a site map tree.
   * Default: true
   */
  // default true if not set
  tree: z.preprocess(
    (val) => val !== 'false' && val !== false,
    z.boolean().optional(),
  ),

  /**
   * Whether to extract metadata from the page.
   * Default: true
   */
  // default true if not set
  metadata: z.preprocess(
    (val) => val !== 'false' && val !== false,
    z.boolean().optional(),
  ),

  /**
   * Whether to return cleaned HTML.
   * Default: false
   */
  cleanedHtml: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional(),
  ),

  /**
   * Whether to fetch and parse robots.txt.
   * Default: false
   */
  robots: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional(),
  ),

  /**
   * Whether to fetch and parse sitemap.xml.
   * Default: false
   */
  sitemapXML: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional(),
  ),

  ...treeOptionsSchema.shape,

  ...contentOptionsSchema.shape,
});

/**
 * Type representing options for link scraping operations.
 * Derived from the linksOptionsSchema.
 */
export type LinksOptions = z.infer<typeof linksOptionsSchema>;

/**
 * @name    can be imported as LinksTree or Tree
 * @description Represents a node in the site map tree.
 * Each node contains information about a URL and its child pages.
 *
 * @property url - The URL of this node
 * @property rootUrl - The root URL of the website
 * @property name - The name of this node
 * @property totalUrls - Total number of URLs in the tree
 * @property executionTime - Execution time of the request in milliseconds
 * @property lastUpdated - ISO timestamp when this node was last updated
 * @property lastVisited - ISO timestamp when this URL was last visited
 * @property children - Child pages of this URL
 * @property error - Error message if there was an issue processing this URL
 * @property metadata - Metadata extracted from the page
 * @property cleanedHtml - Cleaned HTML content of the page
 * @property extractedLinks - Extracted links from the page
 * @property skippedUrls - URLs that were skipped during processing
 *
 * @example
 * ```typescript
 * const treeNode: LinksTree = {
 *   url: "https://example.com",
 *   rootUrl: "https://example.com",
 *   name: "example",
 *   totalUrls: 10,
 *   executionTime: "1234ms",
 *   lastUpdated: "2025-04-02T14:28:23.000Z",
 *   lastVisited: "2025-04-02T14:28:23.000Z",
 *   children: [
 *     {
 *       url: "https://example.com/about",
 *       name: "about",
 *       lastUpdated: "2025-04-01T10:15:30.000Z",
 *       lastVisited: "2025-04-02T14:28:25.000Z"
 *     }
 *   ],
 *   metadata: {
 *     title: "Example Website",
 *     description: "This is an example website"
 *   },
 *   extractedLinks: {
 *     internal: [
 *       'https://example.com/about',
 *       'https://example.com/contact'
 *     ],
 *     external: [
 *       'https://othersite.com/reference',
 *       'https://api.example.org/data'
 *     ],
 *     media: {
 *       images: [
 *         'https://example.com/images/logo.png',
 *         'https://example.com/images/banner.jpg'
 *       ],
 *       videos: [
 *         'https://example.com/videos/intro.mp4'
 *       ],
 *       documents: [
 *         'https://example.com/docs/whitepaper.pdf'
 *       ]
 *     },
 *     skippedUrls: {
 *       internal: [
 *         { url: "https://example.com/private", reason: "Blocked by robots.txt" }
 *       ],
 *       external: [
 *         { url: "https://othersite.com", reason: "External domain" }
 *       ]
 *     }
 *   }
 * };
 * ```
 */
export interface LinksTree {
  /**
   * The URL of this node.
   */
  url: string;

  /**
   * The root URL of the website.
   * This is the domain root, not necessarily the targetUrl.
   */
  rootUrl?: string;

  /**
   * The name of this node.
   */
  name?: string;

  /**
   * Total number of URLs in the tree.
   */
  totalUrls?: number;

  /**
   * Execution time of the request in milliseconds.
   * Format: string with "ms" suffix (e.g., "1234ms").
   */
  executionTime?: string;

  /**
   * ISO timestamp when this node was last updated.
   * Format: ISO 8601 string.
   */
  lastUpdated: string;

  /**
   * ISO timestamp when this URL was last visited.
   * Format: ISO 8601 string or null if never visited.
   */
  lastVisited?: string | null;

  /**
   * Child pages of this URL.
   * Each child is another LinksTree node.
   */
  children?: LinksTree[];

  /**
   * Error message if there was an issue processing this URL.
   */
  error?: string;

  /**
   * Metadata extracted from the page.
   * Contains information like title, description, etc.
   */
  metadata?: PageMetadata;

  /**
   * Cleaned HTML content of the page.
   * Contains sanitized HTML with unnecessary elements removed.
   */
  cleanedHtml?: string;

  /**
   * Extracted links from the page.
   * Contains information about the current url's extracted links.
   */
  extractedLinks?: ExtractedLinks;

  /**
   * Skipped URLs and their reasons.
   * Contains information about URLs that were not processed.
   */
  skippedUrls?: SkippedLinks;
}

/**
 * Represents a URL that has been visited.
 * Used to track when URLs were last accessed.
 *
 * @property url - The URL that was visited
 * @property lastVisited - ISO timestamp when this URL was last visited
 */
export interface Visited {
  /**
   * The URL that was visited.
   */
  url: string;

  /**
   * ISO timestamp when this URL was last visited.
   * Format: ISO 8601 string or null if never visited.
   */
  lastVisited?: string | null;
}

/**
 * Represents a URL that was skipped during scraping.
 * Includes the reason why it was not processed.
 *
 * @property url - The URL that was skipped
 * @property reason - The reason why this URL was skipped
 *
 * @example
 * ```typescript
 * const skippedUrl: SkippedUrl = {
 *   url: "https://example.com/private",
 *   reason: "Blocked by robots.txt"
 * };
 * ```
 */
export interface SkippedUrl {
  /**
   * The URL that was skipped.
   */
  url: string;

  /**
   * The reason why this URL was skipped.
   * Examples: "Blocked by robots.txt", "HTTP error", etc.
   */
  reason: string;
}

/**
 * Categorized collection of skipped URLs.
 * Follows the same structure as ExtractedLinks for consistency.
 *
 * @property internal - Internal links that were skipped
 * @property external - External links that were skipped
 * @property media - Media links that were skipped
 * @property other - Other links that don't fit into the above categories
 *
 * @example
 * ```typescript
 * const skippedLinks: SkippedLinks = {
 *   internal: [
 *     { url: "https://example.com/private", reason: "Blocked by robots.txt" }
 *   ],
 *   external: [
 *     { url: "https://external.com", reason: "External domain" }
 *   ]
 * };
 * ```
 */
export interface SkippedLinks {
  /**
   * Internal links that were skipped.
   * These are links within the same domain.
   */
  internal?: SkippedUrl[];

  /**
   * External links that were skipped.
   * These are links to other domains.
   */
  external?: SkippedUrl[];

  /**
   * Media links that were skipped.
   * Categorized by media type.
   */
  media?: {
    /**
     * Image links that were skipped.
     */
    images?: SkippedUrl[];

    /**
     * Video links that were skipped.
     */
    videos?: SkippedUrl[];

    /**
     * Document links that were skipped.
     */
    documents?: SkippedUrl[];
  };

  /**
   * Other links that don't fit into the above categories.
   */
  other?: SkippedUrl[];
}

/**
 * Contains robots.txt and sitemap.xml content.
 *
 * @property robots - Content of the robots.txt file
 * @property sitemapXML - Content of the sitemap.xml file
 *
 * @example
 * ```typescript
 * const metaFiles: MetaFiles = {
 *   robots: "User-agent: *\nDisallow: /private/",
 *   sitemapXML: "<?xml version=\"1.0\"?><urlset>...</urlset>"
 * };
 * ```
 */
export interface MetaFiles {
  /**
   * Content of the robots.txt file.
   */
  robots?: string;

  /**
   * Content of the sitemap.xml file.
   */
  sitemapXML?: string;
}

/**
 * Base interface for links POST route responses.
 * Contains common properties shared by both success and error responses.
 *
 * @property targetUrl - The URL that was requested to be scraped
 * @property timestamp - ISO timestamp when the request was processed
 */
interface LinksPostResponseBase {
  /**
   * Whether the operation was successful.
   * Will always be true for successful responses.
   */
  success: boolean;

  /**
   * The URL that was requested to be scraped.
   */
  targetUrl: string;

  /**
   * ISO timestamp when the request was processed.
   * Format: ISO 8601 string.
   */
  timestamp: string;
}

/**
 * Represents a successful links POST route response.
 * Contains the scraped data and related information.
 *
 * @property success - Whether the operation was successful
 * @property cached - Whether the result is returned from cache
 * @property targetUrl - The URL that was requested to be scraped
 * @property timestamp - ISO timestamp when the request was processed
 * @property executionTime - Execution time of the request in milliseconds
 * @property ancestors - Array of parent URLs leading to this URL
 * @property skippedUrls - URLs that were skipped during processing
 * @property tree - Site map tree starting from the root URL
 *
 * @example
 * ```typescript
 * const successResponse: LinksPostSuccessResponse = {
 *   success: true,
 *   targetUrl: "https://example.com",
 *   timestamp: "2025-04-02T14:28:23.000Z",
 *   executionTime: "1234ms",
 *   ancestors: ["https://example.com", "https://example.com/about"],
 *   skippedUrls: {
 *     internal: ["https://example.com/private"],
 *     external: ["https://othersite.com/reference"],
 *     media: {
 *       images: ["https://example.com/images/logo.png"],
 *       videos: ["https://example.com/videos/intro.mp4"],
 *       documents: ["https://example.com/docs/whitepaper.pdf"]
 *     }
 *   },
 *   tree: {
 *     data: {
 *       url: "https://example.com",
 *       lastUpdated: "2025-04-02T14:28:23.000Z",
 *       children: [...]
 *     }
 *   }
 * };
 * ```
 */
export interface LinksPostSuccessResponse
  extends LinksPostResponseBase,
    Omit<Partial<ScrapedData>, 'rawHtml'> {
  /**
   * Whether the operation was successful.
   * Will always be true for successful responses.
   */
  success: true;

  /**
   * Return true if there is a cache hit from KV Store.
   */
  cached: boolean;

  /**
   * Execution time of the request in milliseconds.
   * Format: string with "ms" suffix (e.g., "1234ms").
   */
  executionTime?: string;

  /**
   * Array of parent URLs leading to this URL.
   * Represents the path in the site hierarchy.
   */
  ancestors?: string[];

  /**
   * URLs that were skipped during processing.
   * Includes reasons why they were skipped.
   */
  skippedUrls?: SkippedLinks;

  /**
   * Extracted links from the page.
   * Categorized by type (internal, external, media).
   */
  extractedLinks?: ExtractedLinks;

  /**
   * Site map tree starting from the root URL.
   * Only included if tree generation was requested.
   */
  tree?: LinksTree | null;
}

/**
 * Represents an error response from a links POST route.
 * Contains information about what went wrong.
 *
 * @property success - Whether the operation was successful
 * @property targetUrl - The URL that was requested to be scraped
 * @property timestamp - ISO timestamp when the request was processed
 * @property error - Error message describing what went wrong
 * @property tree - Partial site map tree if available
 *
 * @example
 * ```typescript
 * const errorResponse: LinksPostErrorResponse = {
 *   success: false,
 *   targetUrl: "https://example.com",
 *   timestamp: "2025-04-02T14:28:23.000Z",
 *   error: "Failed to connect to the server"
 * };
 * ```
 */
export interface LinksPostErrorResponse extends LinksPostResponseBase {
  /**
   * Whether the operation was successful.
   * Will always be false for error responses.
   */
  success: false;

  /**
   * Error message describing what went wrong.
   * Provides details about the failure reason.
   */
  error: string;

  /**
   * Partial site map tree if available.
   * May contain data collected before the error occurred.
   */
  tree?: LinksTree | null;
}

/**
 * Union type representing either a successful or failed link scraping operation.
 * Uses a discriminated union pattern with the 'success' property as the discriminator.
 *
 * @example
 * ```typescript
 * function handleResponse(response: LinksPostResponse) {
 *   if (response.success) {
 *     // TypeScript knows this is a LinksPostSuccessResponse
 *     console.log(response.metadata?.title);
 *   } else {
 *     // TypeScript knows this is a LinksPostErrorResponse
 *     console.error(response.error);
 *   }
 * }
 * ```
 */
export type LinksPostResponse =
  | LinksPostSuccessResponse
  | LinksPostErrorResponse;
