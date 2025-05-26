import { HTMLCleaningOptionsSchema } from '@deepcrawl/types/services/html-cleaning/types';
import {
  ExtractedLinksSchema,
  LinkExtractionOptionsSchema,
} from '@deepcrawl/types/services/link/types';
import {
  MetadataOptionsSchema,
  PageMetadataSchema,
} from '@deepcrawl/types/services/metadata/types';
import { ScrapedDataSchema } from '@deepcrawl/types/services/scrape/types';
import { z } from '@hono/zod-openapi';

/**
 * Schema for content extraction options.
 * Defines options for extracting different types of content from a webpage.
 *
 * @property metadataOptions - Options for metadata extraction
 * @property linksOptions - Options for link extraction
 * @property cleanedHtmlOptions - Options for HTML cleaning
 */
export const ContentOptionsSchema = z.object({
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
export const TreeOptionsSchema = z.object({
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
export const LinksOptionsSchema = z.object({
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

  ...TreeOptionsSchema.shape,

  ...ContentOptionsSchema.shape,
});

export const SkippedUrlSchema = z.object({
  url: z.string(),
  reason: z.string(),
});

export const VisitedUrlSchema = z.object({
  url: z.string(),
  lastVisited: z.string().nullable().optional(),
});

export const SkippedLinksSchema = z.object({
  internal: z.array(SkippedUrlSchema).optional(),
  external: z.array(SkippedUrlSchema).optional(),
  media: z
    .object({
      images: z.array(SkippedUrlSchema).optional(),
      videos: z.array(SkippedUrlSchema).optional(),
      documents: z.array(SkippedUrlSchema).optional(),
    })
    .optional(),
  other: z.array(SkippedUrlSchema).optional(),
});

export const baseLinksTreeSchema = z
  .object({
    url: z.string(),
    rootUrl: z.string().optional(),
    name: z.string().optional(),
    totalUrls: z.number().optional(),
    executionTime: z.string().optional(),
    lastUpdated: z.string(),
    lastVisited: z.string().nullable().optional(),
    error: z.string().optional(),
    metadata: PageMetadataSchema.optional(),
    cleanedHtml: z.string().optional(),
    extractedLinks: ExtractedLinksSchema.optional(),
    skippedUrls: SkippedLinksSchema.optional(),
  })
  .openapi('LinksTreeBase');

export const LinksTreeSchema: z.ZodType<LinksTree> = baseLinksTreeSchema
  .extend({
    children: z
      .lazy(() => LinksTreeSchema.array())
      .optional()
      .openapi({
        type: 'array',
        items: { $ref: '#/components/schemas/LinksTree' },
        description: 'Children of this node',
      }),
  })
  .openapi('LinksTree');

const LinksPostResponseBaseSchema = z.object({
  success: z.boolean(),
  targetUrl: z.string(),
  timestamp: z.string(),
});

/* NOTE: use partial() to make all properties optional for /links response for better response shape such as not returning title and description if there is tree */
const PartialScrapedDataSchema = ScrapedDataSchema.partial().omit({
  rawHtml: true,
});

export const LinksPostSuccessResponseSchema = LinksPostResponseBaseSchema.merge(
  PartialScrapedDataSchema,
).extend({
  success: z.literal(true),
  cached: z.boolean(),
  executionTime: z.string().optional(),
  ancestors: z.array(z.string()).optional(),
  skippedUrls: SkippedLinksSchema.optional(),
  extractedLinks: ExtractedLinksSchema.optional(),
  tree: LinksTreeSchema.nullable().optional(),
});

export const LinksPostErrorResponseSchema = LinksPostResponseBaseSchema.extend({
  success: z.literal(false),
  error: z.string(),
  tree: LinksTreeSchema.nullable().optional(),
});

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
export type LinksTree = z.infer<typeof baseLinksTreeSchema> & {
  children?: LinksTree[];
};

/**
 * Type representing options for link scraping operations.
 * Derived from the linksOptionsSchema.
 */
export type LinksOptions = z.infer<typeof LinksOptionsSchema>;

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
export type SkippedUrl = z.infer<typeof SkippedUrlSchema>;

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
export type SkippedLinks = z.infer<typeof SkippedLinksSchema>;

/**
 * Represents a URL that has been visited.
 * Used to track when URLs were last accessed.
 *
 * @property url - The URL that was visited
 * @property lastVisited - ISO timestamp when this URL was last visited
 */
export type VisitedUrl = z.infer<typeof VisitedUrlSchema>;

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
export type LinksPostSuccessResponse = z.infer<
  typeof LinksPostSuccessResponseSchema
>;

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
export type LinksPostErrorResponse = z.infer<
  typeof LinksPostErrorResponseSchema
>;

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
