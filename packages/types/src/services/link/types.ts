import { z } from '@hono/zod-openapi';

/**
 * Schema for configuring link extraction behavior.
 * Defines validation rules for controlling how links are extracted from HTML.
 */
export const LinkExtractionOptionsSchema = z
  .object({
    includeExternal: z.boolean().optional(), // Include links from other domains
    includeMedia: z.boolean().optional(), // Include media files (images, videos, docs)
    excludePatterns: z.array(z.string()).optional(), // Regex patterns to exclude URLs
    removeQueryParams: z.boolean().optional(), // Remove query parameters from URLs
  })
  .strict()
  .openapi('LinkExtractionOptions');

/**
 * Schema for storing extracted links by category.
 * Defines the structure for organizing links extracted from a webpage.
 */
export const ExtractedLinksSchema = z
  .object({
    internal: z.array(z.string()).optional(),
    external: z.array(z.string()).optional(),
    media: z
      .object({
        images: z.array(z.string()).optional(),
        videos: z.array(z.string()).optional(),
        documents: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .openapi('ExtractedLinks');

/**
 * Configuration options for link extraction behavior.
 * Controls which types of links are extracted and how they are processed.
 *
 * @property includeExternal - Whether to include links from other domains
 * @property includeMedia - Whether to include media files (images, videos, docs)
 * @property excludePatterns - List of regex patterns to exclude URLs
 * @property removeQueryParams - Whether to remove query parameters from URLs
 *
 * @example
 * ```typescript
 * const options: LinkExtractionOptions = {
 *   includeExternal: false,
 *   includeMedia: true,
 *   excludePatterns: ['^/admin/', '\\.pdf$'],
 *   removeQueryParams: true
 * };
 * ```
 */
export type LinkExtractionOptions = z.infer<typeof LinkExtractionOptionsSchema>;

/**
 * Structure containing extracted links categorized by type.
 * Organizes links extracted from a webpage into logical groups.
 *
 * @property internal - Array of links from the same domain
 * @property external - Array of links from other domains
 * @property media - Object containing arrays of media links categorized by type
 * @property media.images - Array of image file URLs
 * @property media.videos - Array of video file URLs
 * @property media.documents - Array of document file URLs
 *
 * @example
 * ```typescript
 * const links: ExtractedLinks = {
 *   internal: [
 *     'https://example.com/about',
 *     'https://example.com/contact'
 *   ],
 *   external: [
 *     'https://othersite.com/reference',
 *     'https://api.example.org/data'
 *   ],
 *   media: {
 *     images: [
 *       'https://example.com/images/logo.png',
 *       'https://example.com/images/banner.jpg'
 *     ],
 *     videos: [
 *       'https://example.com/videos/intro.mp4'
 *     ],
 *     documents: [
 *       'https://example.com/docs/whitepaper.pdf'
 *     ]
 *   }
 * };
 * ```
 */
export type ExtractedLinks = z.infer<typeof ExtractedLinksSchema>;
