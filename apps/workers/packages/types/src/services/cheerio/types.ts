import type { MetaFiles } from '@/routers/links/types';
import type { PageMetadata } from '@/services/metadata/types';

/**
 * Represents data scraped from a webpage using Cheerio.
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
export interface ScrapedData {
  title: string;
  rawHtml: string;
  description: string;
  metadata?: PageMetadata;
  cleanedHtml?: string;
  metaFiles?: MetaFiles;
}
