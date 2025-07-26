import type { LinksOptions, MetaFiles } from '@deepcrawl/types';
import type {
  MetadataOptions,
  PageMetadata,
} from '@deepcrawl/types/services/metadata';
import type { ScrapedData } from '@deepcrawl/types/services/scrape';
import type { Options, ReadabilityResult } from '@paoramen/cheer-reader';
import { Readability } from '@paoramen/cheer-reader';
import type { CheerioOptions } from 'cheerio';
import * as cheerio from 'cheerio';
import { DEFAULT_FETCH_TIMEOUT } from '@/config/constants';
import { logError, logWarn } from '@/utils/loggers';
import { RobotsParser } from '@/utils/meta/robots-parser';
import { SitemapParser } from '@/utils/meta/sitemap-parser';
import { HTMLCleaning } from '../html-cleaning/html-cleaning.service';

interface MetaFilesOptions {
  robots?: boolean;
  sitemapXML?: boolean;
}

interface FetchPageResult {
  html: string;
  isIframeAllowed?: boolean;
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
    options: {
      isIframeAllowed?: boolean;
      signal?: AbortSignal;
    } = { isIframeAllowed: true },
  ): Promise<string | FetchPageResult> {
    // Add timeout configuration for production reliability
    const timeoutMs = DEFAULT_FETCH_TIMEOUT;
    const abortController = new AbortController();

    // If an external signal is provided, abort when it aborts
    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        abortController.abort(options.signal?.reason || 'Request cancelled');
      });
    }

    const timeoutId = setTimeout(
      () => abortController.abort('Request timeout'),
      timeoutMs,
    );

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
        cf: {
          cacheTtl: 300, // Cache at CF edge for 5 minutes
          cacheEverything: true, // Cache all responses
          timeout: DEFAULT_FETCH_TIMEOUT,
        },
        headers: {
          'User-Agent': 'Deepcrawl-Bot/1.0 (+https://deepcrawl.dev)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          DNT: '1',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      clearTimeout(timeoutId);

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      // Check content type to ensure it's HTML or text
      const contentType = response.headers.get('content-type') || '';

      // More lenient content type check - if it contains text or html in any form
      if (
        !contentType.toLowerCase().includes('html') &&
        !contentType.toLowerCase().includes('text') &&
        !contentType.toLowerCase().includes('xml')
      ) {
        throw new Error(
          `URL content type "${contentType}" is not allowed for scraping`,
        );
      }

      const html = await response.text();

      if (!options.isIframeAllowed) {
        return html;
      }

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
    }
  }

  private async fetchMetaFiles(
    baseUrl: string,
    options: MetaFilesOptions & { signal?: AbortSignal } = {},
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

      // todo: allow user to add known sitemap paths
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
      readerOptions?: Partial<Options>;
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
    if (!url) return undefined;
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
    isIframeAllowed: isIframeAllowedProp,
  }: {
    cheerioClient: cheerio.CheerioAPI;
    baseUrl: string;
    options?: MetadataOptions;
    isIframeAllowed?: boolean;
  }): PageMetadata {
    const $ = cheerioClient;

    // Default all options to true if not specified
    const {
      title = true,
      description = true,
      language = true,
      canonical = true,
      robots = true,
      author = true,
      keywords = true,
      favicon = true,
      openGraph = true,
      twitter = true,
      isIframeAllowed = isIframeAllowedProp ?? false,
    } = options || {};

    const metadata: PageMetadata = {};

    // Title
    if (title) {
      let pageTitle =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        '';

      if (!pageTitle) {
        // Only use the first text node of the first <title> tag as a last resort
        const titleElem = $('title').first().get(0);
        if (
          titleElem &&
          titleElem.type === 'tag' &&
          Array.isArray(titleElem.children) &&
          titleElem.children.length > 0
        ) {
          const textNode = titleElem.children.find(
            (child) => child.type === 'text',
          );
          if (textNode && typeof textNode.data === 'string') {
            pageTitle = textNode.data.trim();
          }
        }
      }
      if (pageTitle) metadata.title = pageTitle;
    }

    // Description
    if (description) {
      const desc = $('meta[name="description"]').attr('content');
      if (desc) metadata.description = desc;
    }

    // Language
    if (language) {
      const lang = $('html').attr('lang');
      if (lang) metadata.language = lang;
    }

    // Canonical
    if (canonical) {
      const canon = $('link[rel="canonical"]').attr('href');
      if (canon) metadata.canonical = canon;
      else metadata.canonical = baseUrl;
    }

    // Robots
    if (robots) {
      const robotsVal = $('meta[name="robots"]').attr('content');
      if (robotsVal) metadata.robots = robotsVal;
    }

    // Author
    if (author) {
      const authorVal = $('meta[name="author"]').attr('content');
      if (authorVal) metadata.author = authorVal;
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
  }: LinksOptions & {
    cleaningProcessor?: 'reader' | 'html-rewriter';
    readerCleaningOptions?: {
      readerOptions?: Partial<Options>;
      cheerioOptions?: Partial<CheerioOptions>;
    };
    signal?: AbortSignal;
  }): Promise<ScrapedData> {
    const {
      robots,
      sitemapXML,
      cleanedHtml: isCleanedHtml,
      cleanedHtmlOptions: rewriterOptions,
      metadata: metadataOption,
      metadataOptions,
      cleaningProcessor = 'html-rewriter',
      readerCleaningOptions,
      signal,
    } = options;

    // Default isMetadata to true unless explicitly set to false
    const isMetadata = metadataOption !== false;

    try {
      const fetchResult = await this.fetchPage(url, {
        isIframeAllowed: metadataOptions?.isIframeAllowed ?? true,
        signal,
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
          this.fetchMetaFiles(url, { robots, sitemapXML, signal })
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
          isIframeAllowed,
        });
      }

      if (isCleanedHtml) {
        if (cleaningProcessor === 'html-rewriter') {
          promises.push(
            HTMLCleaning({
              rawHtml: html,
              baseUrl: url,
              options: rewriterOptions,
            })
              .then(({ cleanedHtml }) => {
                dataResults.cleanedHtml = cleanedHtml;
              })
              .catch((error) => {
                logError('Error cleaning HTML:', error);
                // Continue even if HTML cleaning fails
              }),
          );
        } else if (cleaningProcessor === 'reader') {
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
