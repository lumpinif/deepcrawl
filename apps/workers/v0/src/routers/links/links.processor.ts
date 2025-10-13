import { performance } from 'node:perf_hooks';
import {
  _ENABLE_LINKS_CACHE,
  DEFAULT_CACHE_OPTIONS,
  MAX_KIN_LIMIT,
  PLATFORM_URLS,
} from '@deepcrawl/types/configs';
import type {
  LinksErrorResponse,
  LinksOptions,
  LinksResponse,
  LinksSuccessResponse,
  LinksSuccessResponseWithoutTree,
  LinksSuccessResponseWithTree,
  LinksTree,
  SkippedUrl,
  VisitedUrl,
} from '@deepcrawl/types/routers/links';
import type { ExtractedLinks } from '@deepcrawl/types/services/link';
import type { ScrapedData } from '@deepcrawl/types/services/scrape';
import type { ORPCContext } from '@/lib/context';
import { type _linksSets, LinkService } from '@/services/link/link.service';
import { ScrapeService } from '@/services/scrape/scrape.service';
import { getLinksNonTreeCacheKey } from '@/utils/kv/links-kv-key';
import { kvPutWithRetry } from '@/utils/kv/retry';
import * as helpers from '@/utils/links/helpers';
import { logDebug, logError, logWarn } from '@/utils/loggers';
import { getMetrics } from '@/utils/metrics';
import { cleanEmptyValues } from '@/utils/response/clean-empty-values';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

/**
 * Type guards for LinksSuccessResponse discriminated union
 */
export function isLinksResponseWithTree(
  response: LinksSuccessResponse,
): response is LinksSuccessResponseWithTree {
  return 'tree' in response && response.tree !== undefined;
}

export function isLinksResponseWithoutTree(
  response: LinksSuccessResponse,
): response is LinksSuccessResponseWithoutTree {
  return !('tree' in response) || response.tree === undefined;
}

// Helper function to check if a URL exists in the Set of visited URLs
function isUrlInVisitedSet(
  urlSet: Set<VisitedUrl>,
  urlToCheck: string,
): boolean {
  for (const visitedItem of urlSet) {
    if (visitedItem.url === urlToCheck) {
      return true;
    }
  }
  return false;
}

export class LinksProcessingError extends Error {
  readonly data: LinksErrorResponse;

  constructor(data: LinksErrorResponse) {
    super(data.error);
    this.name = 'LinksProcessingError';
    this.data = data;
  }
}

type ProcessNonTreeRequestParams = {
  c: ORPCContext;
  params: LinksOptions;
  targetUrl: string;
  timestamp: string;
  linkService: LinkService;
  startTime: number;
  isGETRequest?: boolean;
};

/* 
  Pre-defined PLATFORM_URLS check has higher priority over the flag.
  This function checks if the target URL is a platform URL.
*/
export function checkIsPlatformUrl(
  targetUrl: string,
  isPlatformUrlProp: boolean,
): boolean {
  const u = new URL(targetUrl);
  const normalizedOrigin = `${u.protocol}//${u.hostname.toLowerCase()}`;
  const isPrebuilt = PLATFORM_URLS.some(
    (p) => p.toLowerCase() === normalizedOrigin,
  );
  return isPrebuilt ? true : Boolean(isPlatformUrlProp);
}

/**
 * Lightweight processing for non-tree requests
 * Uses separate cache strategy optimized for non-tree responses
 */
async function processNonTreeRequest({
  c,
  params,
  targetUrl,
  timestamp,
  linkService,
  startTime,
  isGETRequest = false,
}: ProcessNonTreeRequestParams): Promise<LinksSuccessResponse> {
  const {
    metadata: isMetadata,
    cleanedHtml: isCleanedHtml,
    extractedLinks: includeExtractedLinks,
    linkExtractionOptions,
    cacheOptions: providedCacheOptions,
    isPlatformUrl: isPlatformUrlProp,
    subdomainAsRootUrl,
    metricsOptions,
  } = params;

  const cacheOptions = {
    ...DEFAULT_CACHE_OPTIONS,
    ...(providedCacheOptions ?? {}),
  };

  params.cacheOptions = cacheOptions;

  // Use app-level scrape service from context
  const scrapeService = c.var.scrapeService ?? new ScrapeService();

  // Get root URL for link extraction context
  // Check if the root URL is a platform URL, e.g., like github.com
  let rootUrl: string;
  const _targetUrlOrigin = new URL(targetUrl).origin;

  const isPlatformUrl = checkIsPlatformUrl(
    targetUrl,
    Boolean(isPlatformUrlProp),
  );

  // Platform URL optimization: use target URL as root to focus on relevant content
  if (isPlatformUrl) {
    rootUrl = targetUrl; // Use target as root for platform URLs (e.g., github.com/username)
  } else if (subdomainAsRootUrl) {
    // default: use the entire host (incl. subdomain) as our "root"
    rootUrl = _targetUrlOrigin;
  } else {
    // old behaviour: collapse subdomain into base domain
    rootUrl = linkService.getRootUrl(targetUrl);
  }

  // Check cache first for non-tree requests
  let cacheHit = false;
  const nonTreeCacheKey = await getLinksNonTreeCacheKey(params, isGETRequest);

  if (_ENABLE_LINKS_CACHE && cacheOptions.enabled) {
    try {
      const { value, metadata } =
        await c.env.DEEPCRAWL_V0_LINKS_STORE.getWithMetadata<{
          title?: string;
          description?: string;
          timestamp?: string;
        }>(nonTreeCacheKey);

      if (value) {
        logDebug(
          `💽 [LINKS NON-TREE] Found cached non-tree response for ${targetUrl}`,
        );

        c.cacheHit = true; // set cache hit flag in context for activity logging
        cacheHit = true;

        const cachedResponse = JSON.parse(value) as LinksSuccessResponse;

        // Update timestamp and top-level executionTime but keep cached flag as true
        return {
          ...cachedResponse,
          cached: true,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      logError(`Error reading non-tree cache for ${targetUrl}:`, error);
      // Proceed without cache if read fails
    }
  }

  try {
    // Scrape only the target URL
    const targetScrapeResult = await scrapeService.scrape({
      ...params,
      url: targetUrl,
      metadata: true, // always get metadata
      cleanedHtml: isCleanedHtml,
      robots: params.robots,
      sitemapXML: params.sitemapXML,
      fetchOptions: { signal: c.signal, ...params.fetchOptions },
    });

    // If scraping failed, throw error
    if (!targetScrapeResult?.rawHtml) {
      throw new Error('Failed to scrape target URL');
    }

    // Extract links from target URL only
    let extractedTargetLinks: ExtractedLinks | undefined;
    if (includeExtractedLinks) {
      const allExtractedLinks = await linkService.extractLinksFromHtml({
        html: targetScrapeResult.rawHtml,
        baseUrl: targetUrl,
        rootUrl,
        options: {
          ...linkExtractionOptions,
        },
        isPlatformUrl,
      });

      // Create a filtered version based on user options
      extractedTargetLinks = {
        internal: allExtractedLinks.internal,
        external: linkExtractionOptions?.includeExternal
          ? allExtractedLinks.external
          : undefined,
        media: linkExtractionOptions?.includeMedia
          ? allExtractedLinks.media
          : undefined,
      };
    }

    // Build response for non-tree case - content fields are at response root level
    const response: LinksSuccessResponseWithoutTree = {
      requestId: c.var.requestId,
      success: true,
      cached: false, // Always false for non-tree requests (no cache operations)
      targetUrl,
      timestamp,
    };

    // Add optional content fields only if they have values (at response root level for non-tree)
    if (targetScrapeResult?.title && !isMetadata) {
      response.title = targetScrapeResult.title;
    }
    if (targetScrapeResult?.description && !isMetadata) {
      response.description = targetScrapeResult.description;
    }
    if (isMetadata && targetScrapeResult?.metadata) {
      response.metadata = targetScrapeResult.metadata;
    }
    if (includeExtractedLinks && extractedTargetLinks) {
      response.extractedLinks = extractedTargetLinks;
    }
    if (isCleanedHtml && targetScrapeResult?.cleanedHtml) {
      response.cleanedHtml = targetScrapeResult.cleanedHtml;
    }

    if (metricsOptions?.enable) {
      const metrics = getMetrics(startTime, performance.now());
      response.metrics = metrics;
    }

    const finalResponse = cleanEmptyValues(
      response,
    ) as LinksSuccessResponseWithoutTree;

    // Store non-tree response in cache with separate key
    if (_ENABLE_LINKS_CACHE && cacheOptions.enabled && !cacheHit) {
      try {
        c.executionCtx.waitUntil(
          kvPutWithRetry(
            c.env.DEEPCRAWL_V0_LINKS_STORE,
            nonTreeCacheKey,
            JSON.stringify(finalResponse),
            {
              metadata: {
                title: targetScrapeResult?.title,
                description: targetScrapeResult?.description,
                timestamp: new Date().toISOString(),
              },
              // expiration: cacheOptions?.expiration ?? undefined,
              expirationTtl:
                cacheOptions.expirationTtl ??
                DEFAULT_CACHE_OPTIONS.expirationTtl,
            },
          ),
        );

        logDebug(
          `💽 [LINKS NON-TREE] Cached non-tree response for ${targetUrl}`,
        );
      } catch (error) {
        logWarn(
          `[LINKS NON-TREE] Failed to cache non-tree response for ${targetUrl}. Error: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue without caching on error
      }
    }

    return finalResponse;
  } catch (error) {
    logError('❌ [LINKS PROCESSOR - NON-TREE] error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to process non-tree links request with unknown error';

    throw new Error(errorMessage);
  }
}

export function createLinksErrorResponse({
  requestId,
  targetUrl,
  error = 'Failed to scrape target URL. The URL may be unreachable, a placeholder URL, or returning an error status.',
  withTree,
  existingTree,
  tree,
}: {
  requestId: string;
  targetUrl: string;
  withTree: boolean;
  error?: string;
  existingTree: LinksTree | undefined;
  tree: LinksTree | undefined;
}): LinksErrorResponse {
  return {
    requestId,
    success: false,
    targetUrl,
    error,
    timestamp: new Date().toISOString(),
    tree: withTree && existingTree ? tree : undefined,
  };
}

/** Main function to process links request
 * Process a link request for both GET and POST handlers
 */
export async function processLinksRequest(
  c: ORPCContext,
  params: LinksOptions,
  isGETRequest = false,
): Promise<LinksSuccessResponse> {
  const startTime = performance.now();
  const {
    url,
    tree: isTree,
    extractedLinks: includeExtractedLinks,
    metadata: isMetadata,
    cleanedHtml: isCleanedHtml,
    subdomainAsRootUrl,
    folderFirst,
    linksOrder,
    cacheOptions: providedCacheOptions,
    linkExtractionOptions,
    isPlatformUrl: isPlatformUrlProp,
    metricsOptions,
  } = params;

  const cacheOptions = {
    ...DEFAULT_CACHE_OPTIONS,
    ...(providedCacheOptions ?? {}),
  };

  params.cacheOptions = cacheOptions;

  logDebug(
    `🪂 [LINKS Endpoint] Processing links request for ${url}`,
    `isGETRequest: ${isGETRequest}`,
    // `params: ${JSON.stringify(params, null, 2)}`,
  );

  const timestamp = new Date().toISOString();

  // Initialize activity logging
  const normalizedTargetUrl = targetUrlHelper(url, true);

  // Use app-level scrape service from context, create link service locally
  const scrapeService = c.var.scrapeService;
  const linkService = new LinkService();

  // config
  const withTree = isTree !== false; // True by default, false only if explicitly set to false

  // Early return optimization for non-tree requests
  // Uses separate cache strategy optimized for non-tree responses
  if (!withTree) {
    return processNonTreeRequest({
      c,
      params,
      targetUrl: normalizedTargetUrl,
      timestamp,
      linkService,
      startTime,
      isGETRequest,
    });
  }

  // Root
  let rootUrl: string;

  // Target
  let targetUrl: string;
  let ancestors: string[] | undefined;
  let descendants: string[] | undefined;
  let targetScrapeResult: ScrapedData | undefined;
  let linksFromTarget: ExtractedLinks | undefined;

  // Extracted links map for each node in the tree
  const extractedLinksMap: Record<string, ExtractedLinks> = {};
  // Track skipped URLs with reasons
  const skippedUrls = new Map<SkippedUrl['url'], SkippedUrl['reason']>();

  // internal caches
  let _internalLinks: ExtractedLinks['internal'] = [];
  // Track visited URLs to avoid re-fetching
  const _visitedUrls = new Set<string>();
  // Track individual scraping timestamps
  const _visitedUrlsTimestamps = new Map<string, string>();
  // internal Cache for scraped results
  const _scrapedDataCache: Record<string, ScrapedData> = {};
  // all the links found
  const _linksSets: _linksSets = {
    internal: new Set<string>(),
    external: new Set<string>(),
    media: {
      images: new Set<string>(),
      videos: new Set<string>(),
      documents: new Set<string>(),
    },
  };

  // KV Caches
  let existingTree: LinksTree | undefined;
  let finalTree: LinksTree | undefined;
  let lastVisitedUrlsInCache = new Set<VisitedUrl>();
  let linksCacheIsFresh = false;

  let linksPostResponse: LinksResponse | undefined;

  try {
    // --- Validate and Normalize Input URL & Identify Root ---
    targetUrl = normalizedTargetUrl; // Use the normalized URL from activity logging

    // Get ancestors of the target URL first
    ancestors = linkService.getAncestorPaths(targetUrl);

    // Check if the root URL is a platform URL, e.g., like github.com
    const _targetUrlOrigin = new URL(targetUrl).origin;
    const isPlatformUrl = checkIsPlatformUrl(
      targetUrl,
      Boolean(isPlatformUrlProp),
    );

    // Platform URL optimization: use target URL as root to focus on relevant content
    if (isPlatformUrl) {
      rootUrl = targetUrl; // Use target as root for platform URLs (e.g., github.com/username)
    } else if (subdomainAsRootUrl) {
      // default: use the entire host (incl. subdomain) as our "root"
      rootUrl = _targetUrlOrigin;
    } else {
      // old behaviour: collapse subdomain into base domain
      rootUrl = linkService.getRootUrl(targetUrl);
    }

    // Set stable root key in context for KV cache and downstream hashing
    // For platform URLs, we now use the target URL as root, so use it directly for cache key
    const rootKeyForCache = rootUrl;
    c.linksRootKey = rootKeyForCache;

    // Helper function to scrape a URL only if not visited before in *this* request
    const scrapeIfNotVisited = async (url: string) => {
      if (_visitedUrls.has(url)) {
        // URL already visited, return from cache
        return _scrapedDataCache[url];
      }

      try {
        // Mark as visited and record the exact timestamp

        const result = await scrapeService.scrape({
          ...params,
          url,
          metadata: true, // always get metadata for kv store
          cleanedHtml: isCleanedHtml,
          robots: url === rootUrl && params.robots,
          sitemapXML: url === rootUrl && params.sitemapXML,
          fetchOptions: { signal: c.signal, ...params.fetchOptions },
        });

        // Add to visited URLs sets with current timestamp
        const currentTimestamp = new Date().toISOString();
        _visitedUrls.add(url);
        _visitedUrlsTimestamps.set(url, currentTimestamp);
        lastVisitedUrlsInCache.add({
          url,
          lastVisited: currentTimestamp,
        });

        _scrapedDataCache[url] = result;
        return result;
      } catch (error) {
        // Log the error and add to skipped URLs
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        skippedUrls.set(url, `Failed to scrape: ${errorMessage}`);
        // Return undefined on error
        // return;
      }
    };

    // Define the return type for processTargetUrl to use in our parallel promises
    type TargetUrlResult =
      | LinksResponse
      | {
          targetScrapeResult: ScrapedData;
          allTargetLinks: ExtractedLinks;
        };

    /**
     * Process target URL and merge its links into the global link sets
     * @returns Links Post Error Response on error, or an object with scrape results on success
     */
    async function processTargetUrl(): Promise<TargetUrlResult> {
      // --- Scrape the target URL  ---
      const targetScrapeResult = await scrapeIfNotVisited(targetUrl);

      // If scraping failed, handle the error properly
      if (!targetScrapeResult?.rawHtml) {
        const tree: LinksTree | undefined = existingTree;

        // create a links post error response and return it
        const linksPostErrorResponse: LinksErrorResponse =
          createLinksErrorResponse({
            requestId: c.var.requestId,
            targetUrl,
            withTree,
            existingTree,
            tree,
          });

        return linksPostErrorResponse;
      }

      // --- Extract and merge links from both target and root perspectives ---
      // First extract all links (including media) to identify skipped media links
      const extractedTargetLinks = await linkService.extractLinksFromHtml({
        html: targetScrapeResult.rawHtml,
        baseUrl: targetUrl,
        rootUrl,
        options: {
          ...linkExtractionOptions,
        },
        skippedUrls,
        isPlatformUrl,
      });

      // Store in the map if linksFromTarget is enabled
      if (includeExtractedLinks) {
        extractedLinksMap[targetUrl] = extractedTargetLinks;
      }

      // Merge allTargetLinks into the global link sets
      linkService.mergeLinks(extractedTargetLinks, _linksSets);

      return { targetScrapeResult, allTargetLinks: extractedTargetLinks };
    }

    /**
     * Process kin paths and merge their links into the global link sets
     */
    async function processKinLinks(paths: string[]): Promise<void> {
      // Use Promise.allSettled instead of Promise.all to handle errors gracefully
      await Promise.allSettled(
        paths.map(async (kin) => {
          try {
            // This improves the performance dramatically but the payoff is no content included for the cached request, e.g., no cleaned HTML for kin
            if (
              !isCleanedHtml &&
              isUrlInVisitedSet(lastVisitedUrlsInCache, kin) &&
              linksCacheIsFresh
            ) {
              return; // Skip scraping this descendant
            }

            // Scrape the kin URL for content
            const scrapeKinResult = await scrapeIfNotVisited(kin);

            // Skip if scrape failed
            if (!scrapeKinResult) {
              return;
            }

            // Skip links extraction if already visited in *this* request OR if present in the *cached* tree
            if (
              isUrlInVisitedSet(lastVisitedUrlsInCache, kin) &&
              linksCacheIsFresh
            ) {
              return; // Skip
            }

            const extractedKinLinks = await linkService.extractLinksFromHtml({
              html: scrapeKinResult.rawHtml,
              baseUrl: kin,
              rootUrl,
              options: {
                ...linkExtractionOptions,
              },
              skippedUrls,
              isPlatformUrl,
            });

            // Store in the map if linksFromTarget is enabled
            if (includeExtractedLinks) {
              extractedLinksMap[kin] = extractedKinLinks;
            }

            // Merge extracted links from descendant perspective
            linkService.mergeLinks(extractedKinLinks, _linksSets);
          } catch (error) {
            // Log the error and add to skipped URLs
            logError(`Error processing path ${kin}:`, error);
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            skippedUrls.set(kin, `Failed to process: ${errorMessage}`);
          }
        }),
      );
    }

    async function processRootUrl(rootUrl: string) {
      try {
        // This improves the performance dramatically but the payoff is no content included for the cached request, e.g., no cleaned HTML for kin
        if (
          !isCleanedHtml &&
          isUrlInVisitedSet(lastVisitedUrlsInCache, rootUrl) &&
          linksCacheIsFresh
        ) {
          return; // Skip scraping
        }

        const rootScrapeResult = await scrapeIfNotVisited(rootUrl);

        // Skip if scrape failed
        if (!rootScrapeResult) {
          return;
        }

        const extractedRootLinks = await linkService.extractLinksFromHtml({
          html: rootScrapeResult.rawHtml,
          rootUrl,
          baseUrl: rootUrl,
          options: {
            ...linkExtractionOptions,
          },
          skippedUrls,
          isPlatformUrl,
        });

        // Store in the map if linksFromTarget is enabled
        if (includeExtractedLinks) {
          extractedLinksMap[rootUrl] = extractedRootLinks;
        }

        // Merge extracted links from root perspective
        linkService.mergeLinks(extractedRootLinks, _linksSets);

        // get root's descendants -- this is desired behavior to get more links
        const rootDescendants = linkService.getDescendantPaths(
          rootUrl,
          new Set(extractedRootLinks.internal),
        );

        if (rootDescendants && rootDescendants.length > 0) {
          await processKinLinks(rootDescendants.slice(0, MAX_KIN_LIMIT));
        }
      } catch (error) {
        // Log the error and add to skipped URLs
        logError(`Error processing root URL ${rootUrl}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        skippedUrls.set(rootUrl, `Failed to process: ${errorMessage}`);
      }
    }

    // --- Core Processing Flow Starts ---

    // Check cache first
    if (_ENABLE_LINKS_CACHE && cacheOptions.enabled) {
      try {
        const { value, metadata } =
          await c.env.DEEPCRAWL_V0_LINKS_STORE.getWithMetadata<{
            title?: string;
            description?: string;
            timestamp?: string;
          }>(rootKeyForCache);

        if (value) {
          logDebug(
            `💽 [LINKS Endpoint] Found cached links tree in KV for ${rootUrl}`,
          );

          c.cacheHit = true; // set cache hit flag in context for activity logging

          const parsedValue = JSON.parse(value) as LinksTree;
          existingTree = parsedValue ?? undefined;
          // Extract visited URLs from the tree structure if available
          if (existingTree) {
            lastVisitedUrlsInCache =
              helpers.extractVisitedUrlsFromTree(existingTree);
          }
          linksCacheIsFresh = true;
        }
      } catch (error) {
        logError(
          `Error reading from DEEPCRAWL_V0_LINKS_STORE for ${rootUrl}:`,
          error,
        );
        // Proceed without cache if read fails
      }
    }

    // Define a type for all possible promise results
    type ParallelPromiseResult = TargetUrlResult | null;

    // Create an array to store promises that can be executed in parallel
    const parallelPromises: Array<Promise<ParallelPromiseResult>> = [];

    // --- Process Root URL with its descendants if targetUrl is not the root and is not a platform url ---
    if (targetUrl !== rootUrl) {
      if (!isPlatformUrl) {
        // Cast the result to match our ParallelPromiseResult type
        parallelPromises.push(processRootUrl(rootUrl).then(() => null));
      } else if (ancestors && ancestors.length > 0) {
        // Cast the result to match our ParallelPromiseResult type
        parallelPromises.push(processRootUrl(ancestors[1]).then(() => null));
      }
    }

    // --- Process other Ancestor Paths except root url ---
    if (ancestors && ancestors.length > 0) {
      const ancestorsExceptRoot = ancestors
        .filter((url) => url !== rootUrl)
        .slice(0, MAX_KIN_LIMIT);
      // Cast the result to match our ParallelPromiseResult type
      parallelPromises.push(
        processKinLinks(ancestorsExceptRoot).then(() => null),
      );
    }

    // --- Process Target URL ---
    parallelPromises.push(processTargetUrl());

    // Wait for all parallel processes to complete
    const results = await Promise.all(parallelPromises);

    // Check if any result is a error Response object (links error response from processTargetUrl)
    const errorResponse = results.find(
      (result): result is LinksErrorResponse =>
        typeof result === 'object' &&
        result !== null &&
        'success' in result &&
        result.success === false &&
        'error' in result,
    );

    // If we have an error response, throw an LinksProcessingError
    if (errorResponse) {
      throw new LinksProcessingError(errorResponse);
    }

    // Extract target URL result from the results array - using proper type checking
    const targetUrlResult = results.find(
      (result): result is TargetUrlResult =>
        result !== undefined &&
        typeof result === 'object' &&
        result !== null &&
        !Array.isArray(result) &&
        'targetScrapeResult' in result &&
        'allTargetLinks' in result,
    );

    if (
      targetUrlResult &&
      'targetScrapeResult' in targetUrlResult &&
      'allTargetLinks' in targetUrlResult
    ) {
      targetScrapeResult = targetUrlResult.targetScrapeResult;
      const allTargetLinks = targetUrlResult.allTargetLinks;
      // Create a filtered version based on user options
      linksFromTarget = {
        internal: allTargetLinks.internal,
        external: linkExtractionOptions?.includeExternal
          ? allTargetLinks.external
          : undefined,
        media: linkExtractionOptions?.includeMedia
          ? allTargetLinks.media
          : undefined,
      };
    }

    // --- Process Descendant Paths from targetUrl ---
    descendants = linkService.getDescendantPaths(
      targetUrl,
      _linksSets.internal,
    );
    // Process descendant paths if targetUrl is also root - this is an extra step
    if (rootUrl === targetUrl && descendants && descendants.length > 0) {
      await processKinLinks(descendants.slice(0, MAX_KIN_LIMIT));
    }

    // --- Build the final tree ---
    _internalLinks = helpers.setToArrayOrUndefined(_linksSets.internal);
    const mergedVisitedUrls = linkService.mergeVisitedUrls(
      lastVisitedUrlsInCache,
      _visitedUrls,
      _visitedUrlsTimestamps,
    );

    // Extract only metadata from scrapedDataCache for tree building
    const metadataCache: Record<string, ScrapedData['metadata']> = {};
    if (_scrapedDataCache) {
      for (const [url, data] of Object.entries(_scrapedDataCache)) {
        if (data.metadata) {
          metadataCache[url] = data.metadata;
        }
      }
    }

    if (linksCacheIsFresh && existingTree && _internalLinks) {
      // --- Merge new links into existing tree ---
      finalTree = await helpers.mergeNewLinksIntoTree({
        existingTree,
        newLinks: _internalLinks,
        rootUrl,
        linkService,
        visitedUrls: mergedVisitedUrls,
        metadataCache,
        extractedLinksMap,
        includeExtractedLinks,
        folderFirst,
        linksOrder,
        isPlatformUrl,
      });
    } else {
      // --- Build tree from scratch (works for both empty and non-empty _internalLinks) ---
      finalTree = helpers.buildLinksTree({
        internalLinks: _internalLinks,
        rootUrl,
        linkService,
        visitedUrls: mergedVisitedUrls,
        metadataCache,
        extractedLinksMap,
        includeExtractedLinks,
        folderFirst,
        linksOrder,
        isPlatformUrl,
      });
    }

    // --- Store the final/updated tree back to KV ---
    if (finalTree && _ENABLE_LINKS_CACHE && cacheOptions.enabled) {
      try {
        const treeToStore = finalTree;

        c.executionCtx.waitUntil(
          kvPutWithRetry(
            c.env.DEEPCRAWL_V0_LINKS_STORE,
            // Use rootUrl for platform URLs, targetUrl for non-platform URLs to prevent huge confusing cache
            rootKeyForCache,
            JSON.stringify(treeToStore),
            {
              metadata: {
                title: targetScrapeResult?.title,
                description: targetScrapeResult?.description,
                timestamp: new Date().toISOString(),
              },
              // expiration: cacheOptions?.expiration ?? undefined,
              expirationTtl:
                cacheOptions.expirationTtl ??
                DEFAULT_CACHE_OPTIONS.expirationTtl,
            },
          ),
        );

        logDebug(
          `💽 [LINKS Endpoint] Updated links tree in KV cache for ${rootUrl}`,
        );
      } catch (error) {
        logWarn(
          `[LINKS Endpoint] Failed to store sitemap in KV for ${rootUrl}. Error: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Skip KV put on error, allowing the function to continue
      }
    }

    //* IMPORTANT* --- ONLY STAY HERE --- if user requested cleaned HTML, merge with the final tree --- this should stay after the KV put, since we don't want to store the cleaned HTML into KV which is a large amount of data
    if ((isCleanedHtml || !isMetadata) && withTree && finalTree) {
      // --- extract cleaned HTML from cache ---
      const cleanedHtmlCache: Record<string, ScrapedData['cleanedHtml']> = {};
      if (_scrapedDataCache) {
        for (const [url, data] of Object.entries(_scrapedDataCache)) {
          if (data.cleanedHtml) {
            cleanedHtmlCache[url] = data.cleanedHtml;
          }
        }
      }
      finalTree = await helpers.mergeNewLinksIntoTree({
        existingTree: finalTree,
        newLinks: [],
        rootUrl,
        linkService,
        visitedUrls: mergedVisitedUrls,
        metadataCache: isMetadata ? metadataCache : undefined,
        cleanedHtmlCache,
        extractedLinksMap,
        includeExtractedLinks,
        folderFirst,
        linksOrder,
        isPlatformUrl: isPlatformUrlProp,
      });
    }

    // Process the final tree to conditionally include/exclude extractedLinks based on the linksFromTarget option
    finalTree = helpers.processExtractedLinksInTree(
      finalTree,
      Boolean(includeExtractedLinks),
      linkExtractionOptions,
    );

    // Categorize skipped URLs
    const categorizedSkippedUrls =
      skippedUrls.size > 0 && rootUrl
        ? helpers.categorizeSkippedUrls(
            skippedUrls,
            rootUrl,
            finalTree?.children,
          )
        : undefined;

    // add skippedUrls to finalTree's root node
    if (finalTree && categorizedSkippedUrls) {
      finalTree.skippedUrls = categorizedSkippedUrls;
    }

    // Build response using discriminated union pattern
    if (withTree && finalTree) {
      // Response with tree - content fields are in tree root, not response root
      const responseWithTree: LinksSuccessResponseWithTree = {
        requestId: c.var.requestId,
        success: true,
        cached: linksCacheIsFresh,
        targetUrl,
        timestamp,
        ancestors,
        tree: finalTree,
      };
      linksPostResponse = cleanEmptyValues(responseWithTree);
    } else {
      // Response without finalTree - content fields are at response root level
      const responseWithoutTree: LinksSuccessResponseWithoutTree = {
        requestId: c.var.requestId,
        success: true,
        cached: linksCacheIsFresh,
        targetUrl,
        timestamp,
        ancestors,
      };

      // Add optional content fields only if they have values
      if (targetScrapeResult?.title && !isMetadata) {
        responseWithoutTree.title = targetScrapeResult.title;
      }
      if (targetScrapeResult?.description && !isMetadata) {
        responseWithoutTree.description = targetScrapeResult.description;
      }
      if (isMetadata && targetScrapeResult?.metadata) {
        responseWithoutTree.metadata = targetScrapeResult.metadata;
      }
      if (includeExtractedLinks && linksFromTarget) {
        responseWithoutTree.extractedLinks = linksFromTarget;
      }
      if (isCleanedHtml && targetScrapeResult?.cleanedHtml) {
        responseWithoutTree.cleanedHtml = targetScrapeResult.cleanedHtml;
      }
      if (categorizedSkippedUrls) {
        responseWithoutTree.skippedUrls = categorizedSkippedUrls;
      }

      linksPostResponse = cleanEmptyValues(
        responseWithoutTree,
      ) as LinksSuccessResponseWithoutTree;
    }

    if (!linksPostResponse) {
      throw new Error('Failed to process links request');
    }

    if (metricsOptions?.enable) {
      const metrics = getMetrics(startTime, performance.now());
      linksPostResponse.metrics = metrics;
    }

    return linksPostResponse as LinksSuccessResponse;
  } catch (error) {
    logError('❌ [LINKS PROCESSOR] error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to process links request with unknown error';

    throw new Error(errorMessage);
  }
}
