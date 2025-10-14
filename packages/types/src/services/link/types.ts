import type {
  ExtractedLinksSchema,
  LinkExtractionOptionsSchema,
} from '@deepcrawl/types/schemas';
import type { z } from 'zod/v4';

/**
 * Type representing configuration options for link extraction behavior.
 * Controls which types of links are extracted and how they are processed.
 *
 * @property {boolean} [includeExternal] - Whether to include links from other domains
 * @property {boolean} [includeMedia] - Whether to include media files (images, videos, docs)
 * @property {string[]} [excludePatterns] - List of regex patterns to exclude URLs
 * @property {boolean} [removeQueryParams] - Whether to remove query parameters from URLs
 *
 */
export type LinkExtractionOptions = z.infer<typeof LinkExtractionOptionsSchema>;

/**
 * Type representing extracted links categorized by type.
 * Organizes links extracted from a webpage into logical groups.
 *
 * @property {string[]} [internal] - Array of internal links from the same domain
 * @property {string[]} [external] - Array of external links from other domains
 * @property {object} [media] - Object containing arrays of media links categorized by type
 * @property {string[]} [media.images] - Array of image file URLs
 * @property {string[]} [media.videos] - Array of video file URLs
 * @property {string[]} [media.documents] - Array of document file URLs
 *
 */
export type ExtractedLinks = z.infer<typeof ExtractedLinksSchema>;
