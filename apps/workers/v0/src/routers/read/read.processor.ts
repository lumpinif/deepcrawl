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
import { ENABLE_READ_CACHE } from '@/config/default-options';
import type { ORPCContext } from '@/lib/context';
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
  if (!markdown) return false;

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
): Promise<ReadPostResponse>;

export async function processReadRequest(
  c: ORPCContext,
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
    if (ENABLE_READ_CACHE) {
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
    let markdown: string | undefined;
    if (isMarkdown || isGETRequest) {
      if (cleanedHtml) {
        const convertedMarkdown = getMarkdown({ html: cleanedHtml });

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

    if (ENABLE_READ_CACHE) {
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
    }

    if (isGETRequest) {
      // For GET requests, always return markdown content only
      if (markdown) {
        return markdown;
      }

      // Generate informative default markdown when no content is extracted
      return getDefaultMarkdown(title, targetUrl, description);
    }

    return readResponse as ReadSuccessResponse;
  } catch (error) {
    console.error('❌ Error reading URL:', error);

    throw new Error('Failed to read url');
  }
}
