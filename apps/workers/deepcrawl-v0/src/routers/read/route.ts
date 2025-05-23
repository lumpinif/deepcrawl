import type {
  ReadOptions,
  ReadResponse,
  ReadSuccessResponse,
} from '@deepcrawl/types/routers/read';
import type { Context } from 'hono';

import { Hono } from 'hono';
import { NodeHtmlMarkdown } from 'node-html-markdown';

import { KV_CACHE_EXPIRATION_TTL } from '@/config/constants';
import {
  readPostValidator,
  readQueryValidator,
} from '@/middlewares/read.validator';
import { CheerioService } from '@/services/cheerio/cheerio.service';
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
import type { ScrapedData } from '@deepcrawl/types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

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

app.get('/', readQueryValidator(), async (c) => {
  const {
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    metadata: isMetadata,
    robots: isRobots,
    metadataOptions,
    rawHtml: isRawHtml,
  } = c.req.valid('query');

  return processReadRequest(
    c,
    {
      url,
      markdown: isMarkdown,
      cleanedHtml: isCleanedHtml,
      metadata: isMetadata,
      robots: isRobots,
      metadataOptions,
      rawHtml: isRawHtml,
    },
    /* isStringResponse */
    true,
  );
});

app.post('/', readPostValidator(), async (c) => {
  const {
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    metadata: isMetadata,
    robots: isRobots,
    metadataOptions,
    rawHtml: isRawHtml,
  } = c.req.valid('json');

  return processReadRequest(c, {
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    metadata: isMetadata,
    robots: isRobots,
    metadataOptions,
    rawHtml: isRawHtml,
  });
});

async function processReadRequest(
  c: Context<{ Bindings: CloudflareBindings }>,
  params: ReadOptions,
  isStringResponse = false,
): Promise<Response> {
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
  let readCacheIsFresh = false;

  try {
    const targetUrl = targetUrlHelper(url, true);
    // override url with normalized target url
    params.url = targetUrl;

    const startRequestTime = performance.now();

    // Generate cache key
    const cacheKey = await getReadCacheKey(params, isStringResponse);

    // Check cache first
    try {
      const { value, metadata } =
        await c.env.DEEPCRAWL_V0_READ_STORE.getWithMetadata<{
          title?: string;
          description?: string;
          timestamp?: string;
        }>(cacheKey);

      if (value) {
        // Check if cache is fresh (e.g., within the last day - matches expirationTtl)
        const cacheTimestamp = metadata?.timestamp
          ? new Date(metadata.timestamp).getTime()
          : 0;
        const oneDayAgo = Date.now() - KV_CACHE_EXPIRATION_TTL * 1000; // 1 day in milliseconds

        if (cacheTimestamp > oneDayAgo) {
          readCacheIsFresh = true;

          if (isStringResponse) {
            return c.text(value, { status: 200 });
          }

          // Parse the cached value and set the cached flag to true
          const parsedResponse = JSON.parse(value);
          parsedResponse.cached = true;
          return c.json(parsedResponse, { status: 200 });
        }
      }
    } catch (error) {
      console.error(
        `Error reading from DEEPCRAWL_V0_READ_STORE for ${url}:`,
        error,
      );
      // Proceed without cache if read fails
    }

    const scrapeService = new CheerioService();
    const isGithubUrl = targetUrl.startsWith('https://github.com');

    const scrapeResult: ScrapedData = await scrapeService.scrape({
      url: targetUrl,
      cleanedHtml: true,
      cleaningProcessor: !isGithubUrl ? 'html-rewriter' : 'reader',
      metadata: isMetadata,
      metadataOptions,
      robots: isRobots,
    });

    // Convert article content to markdown if available
    const markdown =
      (isMarkdown || isStringResponse) && scrapeResult.cleanedHtml
        ? getMarkdown({ html: scrapeResult.cleanedHtml })
        : undefined;

    // Sanitize rawHtml if present
    const cleanedHtml =
      isCleanedHtml || isMarkdown
        ? scrapeResult.cleanedHtml || undefined
        : undefined;

    const endRequestTime = performance.now();
    const readableDuration = formatDuration(endRequestTime - startRequestTime);

    readResponse = cleanEmptyValues<ReadSuccessResponse>({
      success: true,
      cached: readCacheIsFresh,
      targetUrl,
      title: scrapeResult.title,
      description: scrapeResult.description,
      metadata: scrapeResult.metadata,
      metrics: {
        readableDuration,
        duration: endRequestTime - startRequestTime,
        startTime: startRequestTime,
        endTime: endRequestTime,
      },
      markdown,
      cleanedHtml,
      metaFiles: scrapeResult.metaFiles,
      rawHtml: isRawHtml ? scrapeResult.rawHtml : undefined,
    });

    try {
      const valueToCache = isStringResponse
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
      console.error(`Error writing to cache for ${url}:`, error);
      // Continue without caching if write fails
    }

    if (isStringResponse) {
      const stringResponse = markdown || JSON.stringify(readResponse);
      return c.text(stringResponse, { status: 200 });
    }

    return c.json(readResponse, { status: 200 });
  } catch (error) {
    console.error('Error reading URL:', error);

    readResponse = {
      success: false,
      targetUrl: url,
      error: 'Failed to read url',
    };

    if (isStringResponse) {
      const stringResponse = JSON.stringify(readResponse);
      return c.text(stringResponse, { status: 500 });
    }
    return c.json(readResponse, { status: 500 });
  }
}

export default app;
