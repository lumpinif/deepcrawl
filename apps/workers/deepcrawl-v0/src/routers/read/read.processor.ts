import type {
  ReadOptions,
  ReadPostResponse,
  ReadResponse,
  ReadStringResponse,
  ReadSuccessResponse,
  ScrapedData,
} from '@deepcrawl/types/index';

import { NodeHtmlMarkdown } from 'node-html-markdown';

import { KV_CACHE_EXPIRATION_TTL } from '@/config/constants';
import type { AppContext } from '@/lib/types';
import { ScrapeService } from '@/services/scrape/scrape.service';
import { formatDuration } from '@/utils/formater';

import { getReadCacheKey } from '@/utils/kv/read-kv-key';
import { kvPutWithRetry } from '@/utils/kv/retry';
import {
  fixCodeBlockFormatting,
  nhmCustomTranslators,
  nhmTranslators,
  processMultiLineLinks,
  removeNavigationAidLinks,
} from '@/utils/markdown';
import { cleanEmptyValues } from '@/utils/response/clean-empty-values';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

/**
 * Calculates performance metrics for the read operation.
 * @param startTime - Timestamp in milliseconds when the operation started.
 * @param endTime - Timestamp in milliseconds when the operation finished.
 * @returns An object with duration metrics.
 * @property readableDuration - Human-readable representation of the duration.
 * @property duration - Duration of the operation in milliseconds.
 * @property startTime - Timestamp in milliseconds when the operation started.
 * @property endTime - Timestamp in milliseconds when the operation finished.
 */
function getMetrics(startTime: number, endTime: number) {
  return {
    readableDuration: formatDuration(endTime - startTime),
    duration: endTime - startTime,
    startTime,
    endTime,
  };
}

/**
 * Convert HTML to Markdown
 * @param param0 - HTML content to convert
 * @returns Markdown content
 */
function getMarkdown({ html }: { html: string }): string {
  try {
    const nhm = new NodeHtmlMarkdown(
      {
        bulletMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '_',
        strongDelimiter: '**',
        codeFence: '```',
        useInlineLinks: true,
      },
      nhmTranslators,
      nhmCustomTranslators,
    );

    let nhmMarkdown = nhm.translate(html);
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
  c: AppContext,
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
  c: AppContext,
  params: ReadOptions,
  isGETRequest?: false,
): Promise<ReadPostResponse>;

export async function processReadRequest(
  c: AppContext,
  params: ReadOptions,
  isGETRequest = false,
): Promise<ReadResponse> {
  const {
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    metadata: isMetadata,
    robots: isRobots,
    metadataOptions,
    rawHtml: isRawHtml,
  } = params;

  let readResponse: ReadResponse | undefined;
  // Initialize cache flag
  let isReadCacheFresh = false;

  try {
    const targetUrl = targetUrlHelper(url, true);
    // override url with normalized target url
    params.url = targetUrl;

    const startRequestTime = performance.now();

    // Generate cache key
    const cacheKey = await getReadCacheKey(params, isGETRequest);

    // Check cache first
    try {
      const { value: cachedResult, metadata } =
        await c.env.DEEPCRAWL_V0_READ_STORE.getWithMetadata<{
          title?: string;
          description?: string;
          timestamp?: string;
        }>(cacheKey);

      if (cachedResult) {
        // Check if cache is fresh (e.g., within the last day - matches expirationTtl)
        const cacheTimestamp = metadata?.timestamp
          ? new Date(metadata.timestamp).getTime()
          : 0;
        const oneDayAgo = Date.now() - KV_CACHE_EXPIRATION_TTL * 1000; // 1 day in milliseconds

        if (cacheTimestamp > oneDayAgo) {
          isReadCacheFresh = true;

          if (isGETRequest) {
            return cachedResult as ReadStringResponse;
          }

          // Parse the cached value and set the cached flag to true
          const parsedResponse = JSON.parse(
            cachedResult,
          ) as ReadSuccessResponse;
          parsedResponse.cached = true;
          const metrics = getMetrics(startRequestTime, performance.now());
          parsedResponse.metrics = metrics;
          return parsedResponse;
        }
      }
    } catch (error) {
      console.error(
        `❌ Error reading Cache from DEEPCRAWL_V0_READ_STORE for ${url}:`,
        error,
      );
      // Proceed without cache if read fails
    }

    const scrapeService = new ScrapeService();
    const isGithubUrl = targetUrl.startsWith('https://github.com');

    const {
      title,
      rawHtml,
      metadata,
      metaFiles,
      cleanedHtml,
      description,
    }: ScrapedData = await scrapeService.scrape({
      url: targetUrl,
      cleanedHtml: true,
      cleaningProcessor: !isGithubUrl ? 'html-rewriter' : 'reader',
      metadata: isMetadata,
      metadataOptions,
      robots: isRobots,
    });

    // Convert article content to markdown if available
    const markdown =
      (isMarkdown || isGETRequest) && cleanedHtml
        ? getMarkdown({ html: cleanedHtml })
        : undefined;

    // Sanitize rawHtml if present
    // ?? why enable if isMarkdown
    // const cleanedHtml = isCleanedHtml
    //   ? // || isMarkdown
    //     cleanedHtml || undefined
    //   : undefined;

    const endRequestTime = performance.now();
    const metrics = getMetrics(startRequestTime, endRequestTime);

    readResponse = cleanEmptyValues<ReadSuccessResponse>({
      success: true,
      cached: isReadCacheFresh,
      targetUrl,
      title,
      description,
      metadata,
      metrics,
      markdown,
      cleanedHtml: isCleanedHtml ? cleanedHtml : undefined,
      rawHtml: isRawHtml ? rawHtml : undefined,
      metaFiles,
    });

    if (!readResponse) {
      throw new Error('Failed to process read request');
    }

    try {
      const valueToCache = isGETRequest
        ? markdown || ''
        : JSON.stringify(readResponse);

      await kvPutWithRetry(
        c.env.DEEPCRAWL_V0_READ_STORE,
        cacheKey,
        valueToCache,
        {
          expirationTtl: KV_CACHE_EXPIRATION_TTL,
          metadata: {
            timestamp: new Date().toISOString(),
            title: readResponse?.title || undefined,
            description: readResponse?.description || undefined,
          },
        },
      );
    } catch (error) {
      console.error(`❌ Error writing to cache for ${url}:`, error);
      // Continue without caching if write fails
    }

    if (isGETRequest) {
      const stringResponse = markdown || JSON.stringify(readResponse);
      return stringResponse;
    }

    return readResponse as ReadSuccessResponse;
  } catch (error) {
    console.error('❌ Error reading URL:', error);

    throw new Error('Failed to read url');
  }
}
