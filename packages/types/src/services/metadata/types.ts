import type { z } from 'zod/v4';
import type {
  MetadataOptionsSchema,
  PageMetadataSchema,
} from '../metadata/schemas';

/**
 * Type representing options for controlling metadata extraction.
 * Each property is a boolean flag that enables or disables extraction of specific metadata fields.
 * All fields default to true if not specified.
 *
 * @property {boolean} [title] - Extract page title from title tag or meta title
 * @property {boolean} [description] - Extract meta description content
 * @property {boolean} [language] - Extract page language from html lang attribute
 * @property {boolean} [canonical] - Extract canonical URL from link rel="canonical"
 * @property {boolean} [robots] - Extract robots directives from meta robots
 * @property {boolean} [author] - Extract author information from meta author
 * @property {boolean} [keywords] - Extract meta keywords and convert to array
 * @property {boolean} [favicon] - Extract favicon URL from link rel="icon" or similar
 * @property {boolean} [openGraph] - Extract Open Graph metadata (og:* properties)
 * @property {boolean} [twitter] - Extract Twitter Card metadata (twitter:* properties)
 */
export type MetadataOptions = z.infer<typeof MetadataOptionsSchema>;

/**
 * Type representing all metadata that can be extracted from a webpage.
 * All fields are optional as they may not be present in every webpage.
 * The structure combines standard HTML metadata with social media metadata.
 *
 * @property {string} [title] - Page title from title tag or meta title
 * @property {string} [description] - Page description from meta description
 * @property {string} [language] - Page language from html lang attribute
 * @property {string} [canonical] - Canonical URL from link rel="canonical"
 * @property {string} [robots] - Robots directives from meta robots
 * @property {string} [author] - Author information from meta author
 * @property {string[]} [keywords] - Keywords array from meta keywords
 * @property {string} [lastModified] - Last modified date from HTTP headers
 * @property {string} [favicon] - Favicon URL from link rel="icon"
 * @property {string} [ogTitle] - OpenGraph title
 * @property {string} [ogDescription] - OpenGraph description
 * @property {string} [ogImage] - OpenGraph image URL
 * @property {string} [ogUrl] - OpenGraph URL
 * @property {string} [ogType] - OpenGraph type
 * @property {string} [ogSiteName] - OpenGraph site name
 * @property {string} [twitterCard] - Twitter card type
 * @property {string} [twitterSite] - Twitter site username
 * @property {string} [twitterCreator] - Twitter creator username
 * @property {string} [twitterTitle] - Twitter title
 * @property {string} [twitterDescription] - Twitter description
 * @property {string} [twitterImage] - Twitter image URL
 * @property {boolean} [isIframeAllowed] - Whether iframe embedding is allowed
 *
 */
export type PageMetadata = z.infer<typeof PageMetadataSchema>;
