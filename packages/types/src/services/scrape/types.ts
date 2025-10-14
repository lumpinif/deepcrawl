import type { z } from 'zod/v4';
import type {
  FetchOptionsSchema,
  MetaFilesSchema,
  SafeHeadersSchema,
  ScrapedDataSchema,
  ScrapeOptionsSchema,
} from '../scrape/schemas';

/**
 * Type representing meta files (robots.txt, sitemap.xml) extracted from a website.
 * Contains the raw content of these important SEO and crawling directive files.
 *
 * @property {string} [robots] - Content of the robots.txt file
 * @property {string} [sitemapXML] - Content of the sitemap.xml file
 *
 */
export type MetaFiles = z.infer<typeof MetaFilesSchema>;

/**
 * Type representing data scraped from a webpage.
 * Contains various extracted elements and metadata from the target page.
 *
 * @property {string} [title] - Title of the webpage extracted from the title tag (optional, may be missing for some pages)
 * @property {string} rawHtml - Original unmodified HTML content of the webpage
 * @property {string} [description] - Meta description of the webpage
 * @property {PageMetadata} [metadata] - Optional structured metadata extracted from the page
 * @property {string} [cleanedHtml] - Optional sanitized HTML with unnecessary elements removed
 * @property {MetaFiles} [metaFiles] - Optional meta files like robots.txt and sitemap.xml
 *
 */
export type ScrapedData = z.infer<typeof ScrapedDataSchema>;

/**
 * Type representing safe HTTP headers for web scraping requests.
 * Contains only secure and relevant headers for scraping operations.
 *
 * @property {string} [User-Agent] - User agent string for the request
 * @property {string} [Accept] - Media types acceptable for the response
 * @property {string} [Accept-Language] - Preferred languages for the response
 * @property {string} [Accept-Encoding] - Acceptable encodings for the response
 * @property {string} [Referer] - Previous page URL
 * @property {string} [Cookie] - Cookies to send with the request
 * @property {string} [DNT] - Do Not Track preference
 * @property {string} [Upgrade-Insecure-Requests] - Request for secure connection upgrade
 * @property {string} [Cache-Control] - Caching directives
 * @property {string} [Pragma] - Implementation-specific header for caching
 * @property {string} [If-Modified-Since] - Conditional request based on modification date
 * @property {string} [If-None-Match] - Conditional request based on ETag
 * @property {string} [Priority] - Request priority indication
 * @property {string} [Sec-CH-UA] - Client hints about user agent capabilities
 * @property {string} [Sec-CH-UA-Mobile] - Mobile device indication
 * @property {string} [Sec-CH-UA-Platform] - Platform/OS indication
 * @property {string} [Sec-Fetch-Site] - Request origin security context
 * @property {string} [Sec-Fetch-Mode] - Request mode indication
 * @property {string} [Sec-Fetch-Dest] - Request destination indication
 * @property {string} [Sec-Fetch-User] - User-initiated request indication
 */
export type SafeHeaders = z.infer<typeof SafeHeadersSchema>;

/**
 * Type representing fetch request options for web scraping operations.
 * Only includes options that are secure and relevant for scraping.
 *
 * @property {'GET' | 'HEAD'} [method] - HTTP request method (restricted to safe methods)
 * @property {SafeHeaders} [headers] - HTTP headers for the request (filtered for security)
 * @property {'follow' | 'error' | 'manual'} [redirect] - How to handle redirects
 * @property {AbortSignal} [signal] - Signal for aborting the request (useful for timeouts)
 *
 */
export type FetchOptions = z.infer<typeof FetchOptionsSchema>;

/**
 * Type representing scraping operation configuration options.
 * Controls how the scraping operation is performed and what data is extracted.
 * All options are optional and have sensible defaults.
 *
 * @property {boolean} [metadata] - Whether to extract metadata from the page
 * @property {boolean} [cleanedHtml] - Whether to return cleaned HTML
 * @property {boolean} [robots] - Whether to fetch and parse robots.txt
 * @property {boolean} [sitemapXML] - Whether to fetch and parse sitemap.xml (experimental)
 * @property {MetadataOptions} [metadataOptions] - Options for metadata extraction
 * @property {'cheerio-reader' | 'html-rewriter'} [cleaningProcessor] - The cleaning processor to use
 * @property {HTMLRewriterOptions} [htmlRewriterOptions] - Options for HTML cleaning with html-rewriter
 * @property {ReaderCleaningOptions} [readerCleaningOptions] - Options for HTML cleaning with cheerio-reader
 * @property {FetchOptions} [fetchOptions] - Options for the fetch request
 *
 */
export type ScrapeOptions = z.infer<typeof ScrapeOptionsSchema>;
