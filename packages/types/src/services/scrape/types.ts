import { PageMetadataSchema } from '@deepcrawl/types/services/metadata/types';
import { z } from '@hono/zod-openapi';

export const MetaFilesSchema = z.object({
  robots: z.string().optional(),
  sitemapXML: z.string().optional(),
});

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
export type MetaFiles = z.infer<typeof MetaFilesSchema>;

export const ScrapedDataSchema = z.object({
  title: z.string(),
  rawHtml: z.string(),
  description: z.string(),
  metadata: PageMetadataSchema.optional(),
  cleanedHtml: z.string().optional(),
  metaFiles: MetaFilesSchema.optional(),
});

/**
 * Represents data scraped from a webpage.
 * Contains various extracted elements and metadata from the target page.
 *
 * @interface ScrapedData
 *
 * @property title - The title of the webpage extracted from the title tag
 * @property rawHTML - The original unmodified HTML content of the webpage
 * @property description - The meta description of the webpage
 * @property metadata - Optional structured metadata extracted from the page (OpenGraph, Twitter Cards, etc.)
 * @property cleanedHtml - Optional sanitized version of the HTML with unnecessary elements removed
 * @property metaFiles - Optional metadata files like robots.txt and sitemap.xml
 *
 * @example
 * ```typescript
 * const scrapedData: ScrapedData = {
 *   title: "Example Website - Home Page",
 *   rawHTML: "<html><head><title>Example Website - Home Page</title></head><body>...</body></html>",
 *   description: "This is an example website demonstrating web scraping capabilities.",
 *   metadata: {
 *     title: "Example Website - Home Page",
 *     description: "This is an example website demonstrating web scraping capabilities.",
 *     ogTitle: "Example Website",
 *     // other metadata properties
 *   },
 *   cleanedHtml: "<div><h1>Example Website</h1><p>Main content...</p></div>",
 *   metaFiles: {
 *     robots: "User-agent: *\nDisallow: /admin/",
 *     sitemap: "<?xml version=\"1.0\"?><urlset>...</urlset>"
 *   }
 * };
 * ```
 */
export type ScrapedData = z.infer<typeof ScrapedDataSchema>;
