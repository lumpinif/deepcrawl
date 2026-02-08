import { env } from 'cloudflare:workers';
import { resolveBrandConfigFromEnv } from '@deepcrawl/runtime';
import {
  COMMON_HEADERS,
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_FETCH_TIMEOUT,
  DEFAULT_METADATA_OPTIONS,
  type MetaFiles,
} from '@deepcrawl/types';
import type {
  MetadataOptions,
  PageMetadata,
} from '@deepcrawl/types/services/metadata';
import type {
  FetchOptions,
  ScrapedData,
  ScrapeOptions,
} from '@deepcrawl/types/services/scrape';
import type {
  ReadabilityResult,
  Options as TReaderOptions,
} from '@paoramen/cheer-reader';
import { Readability } from '@paoramen/cheer-reader';
import type { CheerioOptions } from 'cheerio';
import * as cheerio from 'cheerio';
import { logError, logWarn } from '@/utils/loggers';
import { RobotsParser } from '@/utils/meta/robots-parser';
import { SitemapParser } from '@/utils/meta/sitemap-parser';
import { HTMLRewriterCleaning } from '../html-cleaning/html-cleaning.service';

interface MetaFilesOptions {
  robots?: boolean;
  sitemapXML?: boolean;
}

interface FetchPageResult {
  html: string;
  isIframeAllowed: boolean;
}

export class ScrapeService {
  // Helper method to determine if iframe embedding is allowed
  private isIframeAllowed(
    xFrameOptions?: string | null,
    contentSecurityPolicy?: string | null,
  ): boolean {
    // Check X-Frame-Options header
    if (xFrameOptions) {
      const option = xFrameOptions.toLowerCase();
      if (option === 'deny' || option === 'sameorigin') {
        return false;
      }
    }

    // Check Content-Security-Policy header for frame-ancestors directive
    if (contentSecurityPolicy) {
      const csp = contentSecurityPolicy.toLowerCase();
      if (csp.includes('frame-ancestors')) {
        // If frame-ancestors is 'none', iframe is not allowed
        if (csp.includes('frame-ancestors none')) {
          return false;
        }

        // If frame-ancestors doesn't include wildcard or specific domains,
        // iframe might be restricted
        if (!csp.includes('frame-ancestors *')) {
          // This is a simplification - in a real implementation, you'd want to check
          // if the current domain is in the allowed list
          return false;
        }
      }
    }

    // If no restrictive headers are found, iframe is allowed
    return true;
  }

  private async fetchPage(
    url: string,
    options: FetchOptions = DEFAULT_FETCH_OPTIONS,
  ): Promise<string | FetchPageResult> {
    const { signal, ...rest } = options;
    // Add timeout configuration for production reliability
    const timeoutMs = DEFAULT_FETCH_TIMEOUT;

    /**
     * SIGNAL HANDLING MEMO:
     *
     * We use AbortController pattern here instead of passing external signal directly because:
     * 1. LAYERED CANCELLATION: Handles BOTH timeout AND external cancellation
     * 2. GUARANTEED CLEANUP: Always clears timeout in finally block
     * 3. CLEAR ERROR MESSAGES: Distinguishes timeout vs user cancellation
     * 4. CLOUDFLARE OPTIMIZED: Works with CF Workers execution context
     *
     * Signal propagation reality:
     * - External signals (c.signal) come from: browser disconnection, worker limits, manual abort
     * - SDK clients CANNOT pass custom AbortSignals over HTTP (impossible to serialize)
     * - Our timeout protection works regardless of client behavior
     *
     * This pattern ensures robust cancellation for all real-world scenarios.
     */
    const abortController = new AbortController();

    // If an external signal is provided, abort when it aborts
    if (signal) {
      signal.addEventListener('abort', () => {
        abortController.abort(signal?.reason || 'Request cancelled');
      });
    }

    const timeoutId = setTimeout(
      () => abortController.abort('Request timeout'),
      timeoutMs,
    );

    try {
      const brandToken = resolveBrandConfigFromEnv(env).token;
      const headers = new Headers({
        ...COMMON_HEADERS.browserLike,
        ...rest.headers,
      });
      const baseUserAgent =
        headers.get('User-Agent') ?? COMMON_HEADERS.browserLike['User-Agent'];
      const brandedUserAgent = `${baseUserAgent} ${brandToken}Bot/1.0`;
      headers.set('User-Agent', brandedUserAgent);

      const response = await fetch(url, {
        ...rest,
        signal: abortController.signal,
        headers,
        // always bypass the cache in Cloudflare
        // cache: 'no-store', // keep in mind that using cache: 'no-cache' will also send a Cache-Control: no-cache header to the origin server, which may affect the response
        cf: { cacheTtl: 0 }, // more explicit way to bypass the cache in Cloudflare
      });

      // Clear timeout on successful fetch
      clearTimeout(timeoutId);

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      // Check content type to ensure it's HTML or text
      const contentType = response.headers.get('content-type') || '';

      // More lenient content type check - if it contains text or html in any form
      if (
        !(
          contentType.toLowerCase().includes('html') ||
          contentType.toLowerCase().includes('text') ||
          contentType.toLowerCase().includes('xml')
        )
      ) {
        throw new Error(
          `URL content type "${contentType}" is not allowed for scraping`,
        );
      }

      const html = await response.text();

      // Extract relevant headers
      const xFrameOptions = response.headers.get('x-frame-options');
      const contentSecurityPolicy = response.headers.get(
        'content-security-policy',
      );

      // Determine if iframe embedding is allowed
      const isIframeAllowed = this.isIframeAllowed(
        xFrameOptions,
        contentSecurityPolicy,
      );

      return { html, isIframeAllowed };
    } catch (error) {
      clearTimeout(timeoutId); // Ensure timeout is cleared on error

      // Provide more specific error messages
      if (error instanceof Error && error.name === 'AbortError') {
        // Check if it's our timeout or user abort
        if (options.signal?.aborted) {
          throw new Error(`Request cancelled by user for URL: ${url}`);
        }
        throw new Error(`Request timeout after ${timeoutMs}ms for URL: ${url}`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchMetaFiles(
    baseUrl: string,
    options: MetaFilesOptions & { signal?: AbortSignal | null } = {},
  ): Promise<MetaFiles> {
    const result: MetaFiles = {};
    const robotsParser = new RobotsParser();
    const sitemapParser = new SitemapParser();

    // Only fetch robots.txt if requested
    if (options.robots) {
      const robotsResult = await robotsParser.parse(baseUrl, {
        signal: options.signal,
      });
      if (
        (robotsResult.rules.length > 0 || robotsResult.sitemaps.length > 0) &&
        robotsResult.content
      ) {
        result.robots = robotsResult.content; // Use the already fetched content
      }
    }

    // Only fetch sitemap if requested
    if (options.sitemapXML) {
      // First try sitemaps from robots.txt if we have it
      if (result.robots) {
        // Reuse the robots.txt parsing result from the options.robots block if available
        // or parse it now if we didn't request robots.txt earlier
        const robotsResult = await robotsParser.parse(baseUrl, {
          signal: options.signal,
        });

        if (robotsResult.sitemaps.length > 0) {
          // Just use the first sitemap from robots.txt
          const sitemapUrl = robotsResult.sitemaps[0];
          try {
            const { urls, content } = await sitemapParser.parse(sitemapUrl, {
              signal: options.signal,
            });
            if (urls.length > 0 && content) {
              result.sitemapXML = content;
            }
          } catch (error) {
            logError(`Error fetching sitemap from ${sitemapUrl}:`, error);
          }
        }
      }

      // TODO: allow user to add known sitemap paths
      // If no sitemap found yet, try common locations
      if (!result.sitemapXML) {
        const sitemapPaths = [
          '/sitemap.xml',
          '/sitemap_index.xml',
          `/sitemaps/${new URL(baseUrl).hostname}.xml`,
        ];

        // Process all paths in parallel
        const sitemapPromises = sitemapPaths.map(async (path) => {
          const sitemapUrl = new URL(path, baseUrl).toString();
          try {
            const { urls, content } = await sitemapParser.parse(sitemapUrl, {
              signal: options.signal,
            });
            if (urls.length > 0 && content) {
              return content;
            }
          } catch (error) {
            logError(`Error fetching sitemap from ${sitemapUrl}:`, error);
          }
          return null;
        });

        //!! parallel requests here are may causing issues

        // Wait for all promises to resolve
        const sitemapResults = await Promise.all(sitemapPromises);

        // Use the first successful result
        const firstValidSitemap = sitemapResults.find(
          (content) => content !== null,
        );

        if (firstValidSitemap) {
          result.sitemapXML = firstValidSitemap;
        }
      }
    }

    return result;
  }

  public readerCleaning({
    rawHtml,
    url,
    options,
  }: {
    rawHtml: string;
    url: string;
    options?: {
      readerOptions?: Partial<TReaderOptions>;
      cheerioOptions?: Partial<CheerioOptions>;
    };
  }): ReadabilityResult {
    try {
      // Your implementation here
      // Load HTML with cheerio using htmlparser2 for better performance
      const $ = cheerio.load(rawHtml, {
        ...options?.cheerioOptions,
        xml: {
          xmlMode: false,
        },
      });

      // Fix relative URLs for images
      $('img').each((_, element) => {
        const src = $(element).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          try {
            // Convert relative URLs to absolute
            const absoluteUrl = new URL(src, url).href;
            $(element).attr('src', absoluteUrl);
          } catch (urlError) {
            logWarn('Error converting image URL:', urlError);
          }
        }
      });

      // Create a new Readability instance and parse the article
      const result: ReadabilityResult = new Readability($, {
        ...options?.readerOptions,
      }).parse();

      // Remove id from first <div> if it is 'readability-page-1'
      if (result && typeof result.content === 'string') {
        const content$ = cheerio.load(result.content, {
          ...options?.cheerioOptions,
          xml: {
            xmlMode: false,
          },
        });
        const firstDiv = content$('div').first();
        if (firstDiv.attr('id') === 'readability-page-1') {
          firstDiv.removeAttr('id');
          result.content = content$.html();
        }
      }

      return result;
    } catch (error) {
      logError('Error in Reader Cleaning:', error);
      throw new Error('Failed to clean HTML with reader cleaning!');
    }
  }

  private resolveUrl(
    url: string | undefined,
    baseUrl: string,
  ): string | undefined {
    if (!url) {
      return;
    }
    try {
      // If url is already absolute, return as is
      return new URL(url, baseUrl).toString();
    } catch {
      return url; // fallback if URL parsing fails
    }
  }

  private extractMetadataWithCheerio({
    cheerioClient,
    baseUrl,
    options,
    isIframeAllowed,
  }: {
    cheerioClient: cheerio.CheerioAPI;
    baseUrl: string;
    options?: MetadataOptions;
    isIframeAllowed?: boolean;
  }): PageMetadata {
    const $ = cheerioClient;

    const {
      title,
      description,
      language,
      canonical,
      robots,
      author,
      keywords,
      favicon,
      openGraph,
      twitter,
    } = options || DEFAULT_METADATA_OPTIONS;

    const metadata: PageMetadata = {};

    // Title
    if (title) {
      let pageTitle =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        '';

      if (!pageTitle) {
        // Only use the text content of the first <title> tag as a last resort
        pageTitle = $('title').first().text().trim();
      }
      if (pageTitle) {
        metadata.title = pageTitle;
      }
    }

    // Description
    if (description) {
      const desc = $('meta[name="description"]').attr('content');
      if (desc) {
        metadata.description = desc;
      }
    }

    // Language
    if (language) {
      const lang = $('html').attr('lang');
      if (lang) {
        metadata.language = lang;
      }
    }

    // Canonical
    if (canonical) {
      const canon = $('link[rel="canonical"]').attr('href');
      if (canon) {
        metadata.canonical = canon;
      } else {
        metadata.canonical = baseUrl;
      }
    }

    // Robots
    if (robots) {
      const robotsVal = $('meta[name="robots"]').attr('content');
      if (robotsVal) {
        metadata.robots = robotsVal;
      }
    }

    // Author
    if (author) {
      const authorVal = $('meta[name="author"]').attr('content');
      if (authorVal) {
        metadata.author = authorVal;
      }
    }

    // Keywords
    if (keywords) {
      const kw = $('meta[name="keywords"]').attr('content');
      if (kw) {
        metadata.keywords = kw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Favicon
    if (favicon) {
      metadata.favicon =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') ||
        '';
    }

    // Open Graph
    if (openGraph) {
      metadata.ogTitle = $('meta[property="og:title"]').attr('content');
      metadata.ogDescription = $('meta[property="og:description"]').attr(
        'content',
      );
      metadata.ogImage = $('meta[property="og:image"]').attr('content');
      metadata.ogUrl = $('meta[property="og:url"]').attr('content');
      metadata.ogType = $('meta[property="og:type"]').attr('content');
      metadata.ogSiteName = $('meta[property="og:site_name"]').attr('content');
    }

    // Twitter
    if (twitter) {
      metadata.twitterCard = $('meta[name="twitter:card"]').attr('content');
      metadata.twitterSite = $('meta[name="twitter:site"]').attr('content');
      metadata.twitterCreator = $('meta[name="twitter:creator"]').attr(
        'content',
      );
      metadata.twitterTitle = $('meta[name="twitter:title"]').attr('content');
      metadata.twitterDescription = $('meta[name="twitter:description"]').attr(
        'content',
      );
      metadata.twitterImage = $('meta[name="twitter:image"]').attr('content');
    }

    // lastModified (not in HTML, usually from HTTP headers, so leave undefined here)
    // metadata.lastModified = ...

    // Normalize all relevant URLs to absolute
    if (metadata.favicon) {
      metadata.favicon = this.resolveUrl(metadata.favicon, baseUrl);
    }
    if (metadata.ogImage) {
      metadata.ogImage = this.resolveUrl(metadata.ogImage, baseUrl);
    }
    if (metadata.twitterImage) {
      metadata.twitterImage = this.resolveUrl(metadata.twitterImage, baseUrl);
    }
    if (metadata.canonical) {
      metadata.canonical = this.resolveUrl(metadata.canonical, baseUrl);
    }
    if (metadata.ogUrl) {
      metadata.ogUrl = this.resolveUrl(metadata.ogUrl, baseUrl);
    }

    return { ...metadata, isIframeAllowed };
  }

  async scrape({
    url,
    ...options
  }: ScrapeOptions & {
    url: string;
  }): Promise<ScrapedData> {
    const {
      robots,
      sitemapXML,
      htmlRewriterOptions,
      metadata: enableMetadata,
      metadataOptions,
      cleaningProcessor = 'html-rewriter',
      readerCleaningOptions,
      cleanedHtml,
      fetchOptions,
    } = options;

    // Default isMetadata to true unless explicitly set to false
    const isMetadata = enableMetadata !== false;

    try {
      const fetchResult = await this.fetchPage(url, {
        ...fetchOptions,
      });

      const html =
        typeof fetchResult === 'string' ? fetchResult : fetchResult.html;

      const isIframeAllowed =
        typeof fetchResult !== 'string' && fetchResult.isIframeAllowed;

      const $ = cheerio.load(html);
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';

      const dataResults = {
        metadata: {} as PageMetadata,
        cleanedHtml: '',
        metaFiles: {} as MetaFiles,
      };

      const promises = [];

      if (robots || sitemapXML) {
        promises.push(
          this.fetchMetaFiles(url, {
            robots,
            sitemapXML,
            signal: fetchOptions?.signal,
          })
            .then((metaFiles) => {
              dataResults.metaFiles = metaFiles;
            })
            .catch((error) => {
              logError('Error fetching meta files:', error);
              // Continue even if meta files fail
            }),
        );
      }

      if (isMetadata) {
        /* DEPRECATED APPROACH WITH HTMLREWRITER WHICH HAS TROUBLE TO RESOLVE TITLE */
        // promises.push(
        //   new MetadataService()
        //     .extractMetadata({
        //       rawHtml: html,
        //       baseUrl: url,
        //       options: metadataOptions,
        //       isIframeAllowed,
        //     })
        //     .then((metadata) => {
        //       dataResults.metadata = metadata;
        //     })
        //     .catch((error) => {
        //       console.error('Error extracting metadata:', error);
        //       // Continue even if metadata extraction fails
        //     }),
        // );

        // migrate to use cheerio for metadata extraction
        dataResults.metadata = this.extractMetadataWithCheerio({
          cheerioClient: cheerio.load(html),
          baseUrl: url,
          options: metadataOptions,
          isIframeAllowed, // forward isIframeAllowed to metadata
        });
      }
      if (cleanedHtml) {
        if (cleaningProcessor === 'html-rewriter') {
          promises.push(
            HTMLRewriterCleaning({
              rawHtml: html,
              baseUrl: url,
              options: htmlRewriterOptions,
            })
              .then(({ cleanedHtml }) => {
                dataResults.cleanedHtml = cleanedHtml;
              })
              .catch((error) => {
                logError('Error cleaning HTML:', error);
                // Continue even if HTML cleaning fails
              }),
          );
        } else if (cleaningProcessor === 'cheerio-reader') {
          const readerCleaningResult = this.readerCleaning({
            rawHtml: html,
            url,
            options: readerCleaningOptions,
          });

          if (readerCleaningResult.content) {
            dataResults.cleanedHtml = readerCleaningResult.content;
          }
        }
      }

      await Promise.all(promises);

      return {
        title,
        description,
        ...dataResults,
        rawHtml: html,
      };
    } catch (error) {
      // Otherwise, wrap it in a URLError
      throw new Error(
        `${
          error instanceof Error ? error.message : String(error)
        }. It may be a temporary issue or the URL may be unreachable.`,
      );
    }
  }
}
