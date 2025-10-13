import {
  _ENABLE_READ_CACHE,
  DEFAULT_CACHE_OPTIONS,
  type ReadOptions,
  type ReadResponse,
  type ReadStringResponse,
  type ReadSuccessResponse,
  type ScrapedData,
} from '@deepcrawl/types';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import type { ORPCContext } from '@/lib/context';
import { ScrapeService } from '@/services/scrape/scrape.service';
import { getReadCacheKey } from '@/utils/kv/read-kv-key';
import { kvPutWithRetry } from '@/utils/kv/retry';
import { logDebug, logError } from '@/utils/loggers';
import {
  fixCodeBlockFormatting,
  nhmCustomTranslators,
  nhmTranslators,
  processMultiLineLinks,
  removeNavigationAidLinks,
} from '@/utils/markdown';
import { getMetrics } from '@/utils/metrics';
import { cleanEmptyValues } from '@/utils/response/clean-empty-values';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

/**
 * Generate default markdown content when no content can be extracted
 * @param title - Page title
 * @param targetUrl - Target URL
 * @param description - Page description
 * @returns Default markdown content
 */
function getDefaultMarkdown(
  title?: string,
  targetUrl?: string,
  description?: string,
): string {
  return [
    `# ${title || 'No Title Available'}`,
    '',
    '**No content could be extracted from this URL.**',
    '',
    `**URL:** ${targetUrl || 'Unknown URL'}`,
    description ? `**Description:** ${description}` : '',
    '',
    '*This page may contain content that cannot be processed as markdown, such as:*',
    '- Interactive applications or SPAs',
    '- Media-only content',
    '- Protected or restricted content',
    '- Malformed HTML',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Check if markdown content is meaningful (has substantial content)
 * @param markdown - Markdown content to check
 * @returns true if markdown has meaningful content, false otherwise
 */
function hasMeaningfulMarkdown(markdown: string): boolean {
  if (!markdown) {
    return false;
  }

  // Remove whitespace, newlines, and common markdown formatting
  const cleanedContent = markdown
    .replace(/\s+/g, ' ')
    .replace(/[#*_`-]/g, '')
    .trim();

  // Check if there's substantial content (more than just a few words)
  const wordCount = cleanedContent
    .split(' ')
    .filter((word) => word.length > 2).length;

  // Consider it meaningful if it has at least 10 meaningful words
  return wordCount >= 10;
}

/**
 * Convert HTML to Markdown using app-level converter
 * @param param0 - HTML content and markdown converter
 * @returns Markdown content
 */
function getMarkdown({
  html,
  markdownConverter,
}: {
  html: string;
  markdownConverter: NodeHtmlMarkdown;
}): string {
  try {
    let nhmMarkdown = markdownConverter.translate(html);
    nhmMarkdown = processMultiLineLinks(nhmMarkdown);
    nhmMarkdown = removeNavigationAidLinks(nhmMarkdown);
    nhmMarkdown = fixCodeBlockFormatting(nhmMarkdown);

    return nhmMarkdown;
  } catch (error) {
    console.warn('Error converting HTML to Markdown:', error);
    return `Failed to convert HTML to Markdown: ${error}`;
  }
}

/**
 * Handles GET requests to the read endpoint.
 * @param c - Hono AppContext
 * @param params - Read options
 * @param isGETRequest - Flag indicating that this is a GET request
 * @returns A string response containing the rendered HTML (if `rawHtml` is true)
 * or Markdown (if `rawHtml` is false)
 */
export async function processReadRequest(
  c: ORPCContext,
  params: ReadOptions,
  isGETRequest: true,
): Promise<ReadStringResponse>;

/**
 * Processes a read POST request for the read endpoint.
 * @param c - Hono AppContext
 * @param params - Read options
 * @param isGETRequest - Optional flag indicating if this is a GET request; defaults to false
 * @returns A promise resolving to a ReadPostResponse object
 */
export async function processReadRequest(
  c: ORPCContext,
  params: ReadOptions,
  isGETRequest?: false,
): Promise<ReadSuccessResponse>;

export async function processReadRequest(
  c: ORPCContext,
  params: ReadOptions,
  isGETRequest = false,
): Promise<ReadResponse> {
  const startTime = performance.now();
  const {
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    rawHtml: isRawHtml,
    cacheOptions: providedCacheOptions,
    markdownConverterOptions,
    cleaningProcessor,
    metricsOptions,
  } = params;

  const cacheOptions = {
    ...DEFAULT_CACHE_OPTIONS,
    ...(providedCacheOptions ?? {}),
  };

  params.cacheOptions = cacheOptions;

  logDebug(
    `🪂 [READ Endpoint] Processing read request for ${url}`,
    `isGETRequest: ${isGETRequest}`,
    // `params: ${JSON.stringify(params, null, 2)}`,
  );

  const timestamp = new Date().toISOString();

  // Initialize activity logging
  const targetUrl = targetUrlHelper(url, true);

  let readResponse: ReadResponse | undefined;
  // Initialize cache flag
  let isReadCacheFresh = false;

  try {
    // override url with normalized target url
    params.url = targetUrl;

    // Track cache key generation
    const cacheKey = await getReadCacheKey(params, isGETRequest);

    // Check cache first
    if (_ENABLE_READ_CACHE && cacheOptions.enabled) {
      try {
        const { value: cachedResult, metadata } =
          await c.env.DEEPCRAWL_V0_READ_STORE.getWithMetadata<{
            title?: string;
            description?: string;
            timestamp?: string;
          }>(cacheKey);

        if (cachedResult) {
          logDebug(
            `💽 [READ Endpoint] Found cached read response in KV for ${targetUrl}`,
          );

          isReadCacheFresh = true;
          c.cacheHit = true; // set cache hit flag in context for activity logging

          if (isGETRequest) {
            return cachedResult as ReadStringResponse;
          }

          const parsedResponse = JSON.parse(
            cachedResult,
          ) as ReadSuccessResponse;
          parsedResponse.cached = true;

          if (metricsOptions?.enable) {
            const metrics = getMetrics(startTime, performance.now());
            parsedResponse.metrics = metrics;
          } else {
            // set metrics to undefined if metrics are not enabled
            parsedResponse.metrics = undefined;
          }

          parsedResponse.requestId = c.var.requestId;
          parsedResponse.timestamp = timestamp;

          return parsedResponse;
        }
      } catch (error) {
        logError('[ERROR] Read processor cache error:', error);
        // Proceed without cache if read fails
      }
    }

    // Track scraping operation
    const isGithubUrl = targetUrl.startsWith('https://github.com');

    // Use app-level service instance for optimal performance
    const scrapeService = c.var.scrapeService ?? new ScrapeService();

    const {
      title,
      rawHtml,
      metadata,
      metaFiles,
      cleanedHtml,
      description,
    }: ScrapedData = await scrapeService.scrape({
      ...params,
      url: targetUrl,
      cleanedHtml: true, // required for scraping, but returned as undefined if disabled in the result
      cleaningProcessor:
        cleaningProcessor ?? (isGithubUrl ? 'cheerio-reader' : 'html-rewriter'),
      fetchOptions: { signal: c.signal, ...params.fetchOptions },
    });

    // Convert article content to markdown if available
    let markdown: string | undefined;
    if (isMarkdown || isGETRequest) {
      if (cleanedHtml) {
        // Create markdown converter with custom options if provided, otherwise use defaults
        const markdownConverter = markdownConverterOptions
          ? new NodeHtmlMarkdown(
              markdownConverterOptions,
              nhmCustomTranslators,
              nhmTranslators,
            )
          : new NodeHtmlMarkdown({}, nhmCustomTranslators, nhmTranslators);

        const convertedMarkdown = getMarkdown({
          html: cleanedHtml,
          markdownConverter,
        });

        // Check if the converted markdown has meaningful content
        if (hasMeaningfulMarkdown(convertedMarkdown)) {
          markdown = convertedMarkdown;
        } else if (isMarkdown) {
          // For POST requests with markdown=true but no meaningful content,
          // provide informative default markdown instead of undefined
          markdown = getDefaultMarkdown(title, targetUrl, description);
        }
      } else if (isMarkdown) {
        // For POST requests with markdown=true but no extractable content,
        // provide informative default markdown instead of undefined
        markdown = getDefaultMarkdown(title, targetUrl, description);
      }
    }

    // Sanitize rawHtml if present
    // ?? why enable if isMarkdown
    // const cleanedHtml = isCleanedHtml
    //   ? // || isMarkdown
    //     cleanedHtml || undefined
    //   : undefined;

    readResponse = cleanEmptyValues<ReadSuccessResponse>({
      requestId: c.var.requestId,
      success: true,
      cached: isReadCacheFresh,
      timestamp,
      targetUrl,
      title,
      description,
      metadata,
      markdown,
      cleanedHtml: isCleanedHtml ? cleanedHtml : undefined,
      rawHtml: isRawHtml ? rawHtml : undefined,
      metaFiles,
    });

    if (!readResponse) {
      throw new Error('Failed to process read request');
    }

    if (_ENABLE_READ_CACHE && cacheOptions.enabled) {
      // Cache the response
      try {
        const valueToCache = isGETRequest
          ? markdown ||
            getDefaultMarkdown(
              readResponse?.title,
              readResponse?.targetUrl,
              readResponse?.description,
            )
          : JSON.stringify(readResponse);

        // non-blocking KV write with waitUntil so it doesn't block the response but still completes reliably
        c.executionCtx.waitUntil(
          kvPutWithRetry(
            c.env.DEEPCRAWL_V0_READ_STORE,
            cacheKey,
            valueToCache,
            {
              // expiration: cacheOptions?.expiration ?? undefined,
              expirationTtl:
                cacheOptions.expirationTtl ??
                DEFAULT_CACHE_OPTIONS.expirationTtl,
              metadata: {
                timestamp: new Date().toISOString(),
                title: readResponse?.title || undefined,
                description: readResponse?.description || undefined,
              },
            },
          ),
        );

        logDebug(
          `💽 [READ Endpoint] Updated read response in KV cache for ${targetUrl}`,
        );
      } catch (error) {
        logError('[ERROR] Read processor cache write error:', error);
        // Continue without caching if write fails
      }
    }

    if (isGETRequest) {
      // For GET requests, always return markdown content only
      if (markdown) {
        return markdown;
      }

      // Generate informative default markdown when no content is extracted
      return getDefaultMarkdown(title, targetUrl, description);
    }

    if (metricsOptions?.enable) {
      readResponse.metrics = getMetrics(startTime, performance.now());
    } else {
      // set metrics to undefined if metrics are not enabled
      readResponse.metrics = undefined;
    }

    return readResponse as ReadSuccessResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to process read request with unknown error';

    logError('[ERROR] Read processor error:', errorMessage);

    throw new Error(errorMessage);
  }
}
