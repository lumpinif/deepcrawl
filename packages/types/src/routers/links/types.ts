import type {
  LinksErrorResponseSchema,
  LinksOptionsSchema,
  LinksOrderSchema,
  LinksSuccessResponseSchema,
  LinksSuccessResponseWithoutTreeSchema,
  LinksSuccessResponseWithTreeSchema,
  LinksTreeSchema,
  SkippedLinksSchema,
  SkippedUrlSchema,
  TreeOptionsSchema,
  VisitedUrlSchema,
} from '@deepcrawl/types/schemas';

import type { z } from 'zod/v4';

/**
 * Type representing the order of links within each folder.
 * @enum {string} 'page' | 'alphabetical'
 * @see {@link LinksOrderSchema}
 * @example
 * ```typescript
 * const linksOrder: LinksOrder = 'alphabetical';
 * ```
 */
export type LinksOrder = z.infer<typeof LinksOrderSchema>;

/**
 * Type representing the options for building a site map tree.
 * @see {@link TreeOptionsSchema}
 *
 */
export type TreeOptions = z.infer<typeof TreeOptionsSchema>;

/**
 * @name  LinksTree  can be imported as `LinksTree` or `Tree`
 * @description Represents a node in the site map tree.
 * Each node contains information about a URL and its child pages.
 *
 * @property {string} url - The URL of this node
 * @property {string} [rootUrl] - The root URL of the website
 * @property {string} [name] - The name of this node
 * @property {number} [totalUrls] - Total number of URLs in the tree
 * @property {string} lastUpdated - ISO timestamp when this node was last updated
 * @property {string|null} [lastVisited] - ISO timestamp when this URL was last visited
 * @property {LinksTree[]} [children] - Child pages of this URL
 * @property {string} [error] - Error message if there was an issue processing this URL
 * @property {Object} [metadata] - Metadata extracted from the page
 * @property {string} [cleanedHtml] - Cleaned HTML content of the page
 * @property {Object} [extractedLinks] - Extracted links from the page
 * @property {Object} [skippedUrls] - URLs that were skipped during processing
 *
 * @example
 * ```typescript
 * const treeNode: LinksTree = {
 *   url: "https://example.com",
 *   rootUrl: "https://example.com",
 *   name: "example",
 *   totalUrls: 10,
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
 *     }
 *   },
 *   skippedUrls: {
 *     internal: [
 *       { url: "https://example.com/private", reason: "Blocked by robots.txt" }
 *     ],
 *     external: [
 *       { url: "https://othersite.com", reason: "External domain" }
 *     ]
 *   }
 * };
 * ```
 */
export type LinksTree = z.infer<typeof LinksTreeSchema>;

/**
 * Type representing options for link scraping operations.
 * Derived from the linksOptionsSchema.
 *
 * @see {@link LinksOptionsSchema}
 *
 * @property {string} url - The URL to extract links from
 * @property {boolean} [tree] - Whether to build a site map tree
 * @property {Object} [linkExtractionOptions] - Options for link extraction
 * @property {Object} [cacheOptions] - Cache configuration for links operation
 * @property {Object} [metricsOptions] - Options for metrics for links operation
 * @property {boolean} [folderFirst] - Whether to place folders before leaf nodes in the tree
 * @property {'page'|'alphabetical'} [linksOrder] - How to order links within each folder
 * @property {boolean} [extractedLinks] - Whether to include extracted links for each node in the tree
 * @property {boolean} [subdomainAsRootUrl] - Whether to treat subdomain as root URL
 * @property {boolean} [isPlatformUrl] - Whether the URL is a platform URL
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
 * @example
 * ```typescript
 * const options = {
 *   url: "https://example.com",
 *   tree: true,
 *   metadata: true,
 *   cleanedHtml: false,
 *   subdomainAsRootUrl: true,
 *   isPlatformUrl: false,
 * };
 * ```
 */
export type LinksOptions = z.infer<typeof LinksOptionsSchema>;

/**
 * Represents a URL that was skipped during scraping.
 * Includes the reason why it was not processed.
 *
 * @property url - The URL that was skipped
 * @property reason - The reason why this URL was skipped
 *
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
 * Successful links response when tree generation is enabled.
 * Content fields (title, description, metadata, etc.) are included in the tree root node, not at response root level.
 *
 * @example With tree (content in tree root):
 * ```typescript
 * const responseWithTree: LinksSuccessResponseWithTree = {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: true,
 *   cached: false,
 *   targetUrl: "https://example.com",
 *   timestamp: "2024-01-15T10:30:00.000Z",
 *   ancestors: ["https://example.com"],
 *   tree: {
 *     url: "https://example.com",
 *     name: "Home",
 *     lastUpdated: "2024-01-15T10:30:00.000Z",
 *     metadata: { title: "Example", description: "..." },
 *     extractedLinks: { internal: [...], external: [...] },
 *     children: [...]
 *   }
 * };
 *
 * if ('tree' in responseWithTree) {
 *   // TypeScript knows this has tree and no root-level content
 *   console.log(responseWithTree.tree.metadata?.title);
 * }
 * ```
 */
export type LinksSuccessResponseWithTree = z.infer<
  typeof LinksSuccessResponseWithTreeSchema
>;

/**
 * Successful links response when tree generation is disabled.
 * Content fields (title, description, metadata, etc.) are included at response root level.
 *
 * @example Without tree (content in response root):
 * ```typescript
 * const responseWithoutTree: LinksSuccessResponseWithoutTree = {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: true,
 *   cached: false,
 *   targetUrl: "https://example.com",
 *   timestamp: "2024-01-15T10:30:00.000Z",
 *   title: "Example Website",
 *   description: "Welcome to our site",
 *   metadata: { title: "Example", description: "..." },
 *   extractedLinks: { internal: [...], external: [...] }
 * };
 *
 * if (!('tree' in responseWithoutTree) || !responseWithoutTree.tree) {
 *   // TypeScript knows this has root-level content and no tree
 *   console.log(responseWithoutTree.title);
 * }
 * ```
 */
export type LinksSuccessResponseWithoutTree = z.infer<
  typeof LinksSuccessResponseWithoutTreeSchema
>;

/**
 * Discriminated union representing a successful links extraction response.
 * The structure varies based on whether tree generation is enabled.
 *
 * Use type guards to narrow the type:
 * - `'tree' in response && response.tree` - response with tree
 * - `!('tree' in response) || !response.tree` - response without tree
 *
 * @example Type narrowing:
 * ```typescript
 * function handleResponse(response: LinksSuccessResponse) {
 *   if ('tree' in response && response.tree) {
 *     // TypeScript infers LinksSuccessResponseWithTree
 *     console.log(response.tree.metadata?.title);
 *   } else {
 *     // TypeScript infers LinksSuccessResponseWithoutTree
 *     console.log(response.title);
 *   }
 * }
 * ```
 */
export type LinksSuccessResponse = z.infer<typeof LinksSuccessResponseSchema>;

/**
 * Represents an error response from a links POST route.
 * Contains information about what went wrong.
 *
 * @property requestId - Unique identifier (request ID) for the activity log entry
 * @property success - Whether the operation was successful
 * @property [requestUrl] - URL, raw url, that was requested to be processed and might be different from the target url
 * @property targetUrl - The URL that was requested to be scraped
 * @property timestamp - ISO timestamp when the request was processed
 * @property error - Error message describing what went wrong
 * @property tree - Partial site map tree if available
 *
 */
export type LinksErrorResponse = z.infer<typeof LinksErrorResponseSchema>;

/**
 * Union type representing either a successful or failed link scraping operation.
 * Uses a discriminated union pattern with the 'success' property as the discriminator.
 */
export type LinksResponse = LinksSuccessResponse | LinksErrorResponse;

/**
 * Type alias for LinksTree to be imported as Tree.
 * Use LinksTree instead.
 */
export type { LinksTree as Tree };
