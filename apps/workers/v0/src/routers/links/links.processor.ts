import { performance } from 'node:perf_hooks';

import type {
  LinksErrorResponse,
  LinksOptions,
  LinksResponse,
  LinksSuccessResponse,
  SkippedUrl,
  Tree,
  VisitedUrl,
} from '@deepcrawl/types/routers/links';
import type {
  ExtractedLinks,
  LinkExtractionOptions,
} from '@deepcrawl/types/services/link';
import type { ScrapedData } from '@deepcrawl/types/services/scrape';

import {
  KV_CACHE_EXPIRATION_TTL,
  MAX_KIN_LIMIT,
  PLATFORM_URLS,
} from '@/config/constants';
import { DEFAULT_LINK_OPTIONS } from '@/config/default-options';
import type { ORPCContext } from '@/lib/context';
import type { _linksSets } from '@/services/link/link.service';
import { formatDuration } from '@/utils/formater';
import { kvPutWithRetry } from '@/utils/kv/retry';
import * as helpers from '@/utils/links/helpers';
import { logDebug, logError, logWarn } from '@/utils/loggers';
import { cleanEmptyValues } from '@/utils/response/clean-empty-values';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

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

export function createLinksErrorResponse({
  targetUrl,
  error = 'Failed to scrape target URL. The URL may be unreachable, a placeholder URL, or returning an error status.',
  withTree,
  existingTree,
  tree,
}: {
  targetUrl: string;
  withTree: boolean;
  error?: string;
  existingTree: Tree | undefined;
  tree: Tree | undefined;
}): LinksErrorResponse {
  return {
    success: false,
    targetUrl,
    error,
    timestamp: new Date().toISOString(),
    tree: withTree && existingTree ? tree : undefined,
  };
}

/**
 * Process a link request for both GET and POST handlers
 */
export async function processLinksRequest(
  c: ORPCContext,
  params: LinksOptions,
): Promise<LinksResponse> {
  const {
    url,
    tree: isTree,
    extractedLinks: includeExtractedLinks,
    metadata: isMetadata,
    cleanedHtml: isCleanedHtml,
    subdomainAsRootUrl,
    folderFirst,
    linksOrder,
    ...rest
  } = params;
  const timestamp = new Date().toISOString();
  const startRequestTime = performance.now();

  // Use app-level services from context for optimal performance
  const serviceAccessStart = Date.now();
  const scrapeService = c.var.scrapeService;
  const linkService = c.var.linkService;
  const serviceAccessTime = Date.now() - serviceAccessStart;

  logDebug('[PERF] Links processor using request-scoped services:', {
    url,
    serviceAccessTime,
    hasScrapeService: !!scrapeService,
    hasLinkService: !!linkService,
    timestamp: new Date().toISOString(),
    requestId: c.var.requestId,
  });

  // config
  const withTree = isTree !== false; // True by default, false only if explicitly set to false
  const linkExtractionOptions: LinkExtractionOptions = {
    ...DEFAULT_LINK_OPTIONS,
    ...rest.linksOptions,
  };

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
  let existingTree: Tree | undefined;
  let finalTree: Tree | undefined;
  let lastVisitedUrlsInCache = new Set<VisitedUrl>();
  let linksCacheIsFresh = false;

  let linksPostResponse: LinksResponse | undefined;

  try {
    // --- Validate and Normalize Input URL & Identify Root ---
    targetUrl = targetUrlHelper(url);

    // Get ancestors of the target URL first
    ancestors = linkService.getAncestorPaths(targetUrl);

    // Check if the root URL is a platform URL, e.g., like github.com
    const _targetUrlOrigin = new URL(targetUrl).origin;
    const isPlatformUrl = PLATFORM_URLS.some(
      (platform) => _targetUrlOrigin === platform,
    );

    // honour new flag: keep full subdomain by default, strip only when false
    if (subdomainAsRootUrl) {
      // default: use the entire host (incl. subdomain) as our “root”
      rootUrl = !isPlatformUrl
        ? _targetUrlOrigin
        : (ancestors?.[1] ?? _targetUrlOrigin);
    } else {
      // old behaviour: collapse subdomain into base domain
      rootUrl = linkService.getRootUrl(targetUrl);
    }

    // Helper function to scrape a URL only if not visited before in *this* request
    const scrapeIfNotVisited = async (url: string) => {
      if (_visitedUrls.has(url)) {
        // URL already visited, return from cache
        return _scrapedDataCache[url];
      }

      try {
        // Mark as visited and record the exact timestamp

        const result = await scrapeService.scrape({
          url,
          ...rest,
          // always get metadata for kv store
          metadata: true,
          cleanedHtml: isCleanedHtml,
          robots: url === rootUrl && rest.robots,
          sitemapXML: url === rootUrl && rest.sitemapXML,
          signal: c.signal,
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
      if (!targetScrapeResult || !targetScrapeResult.rawHtml) {
        const tree: Tree | undefined = existingTree;

        // create a links post error response and return it
        const linksPostErrorResponse: LinksErrorResponse =
          createLinksErrorResponse({
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
    try {
      const { value, metadata } =
        await c.env.DEEPCRAWL_V0_LINKS_STORE.getWithMetadata<{
          title?: string;
          description?: string;
          timestamp?: string;
        }>(!isPlatformUrl ? rootUrl : (ancestors?.[1] ?? rootUrl));

      if (value) {
        // Check if cache is fresh (e.g., within the last day - matches expirationTtl)
        const cacheTimestamp = metadata?.timestamp
          ? new Date(metadata.timestamp).getTime()
          : 0;
        const oneDayAgo = Date.now() - KV_CACHE_EXPIRATION_TTL * 1000; // 1 day in milliseconds

        if (cacheTimestamp > oneDayAgo) {
          const parsedValue = JSON.parse(value) as Tree;
          existingTree = parsedValue ?? undefined;
          // Extract visited URLs from the tree structure if available
          if (existingTree) {
            lastVisitedUrlsInCache =
              helpers.extractVisitedUrlsFromTree(existingTree);
          }
          linksCacheIsFresh = true;
        } else {
          // Optional: Could trigger a delete operation here if desired
          // await c.env.DEEPCRAWL_V0_LINKS_STORE.delete(rootUrl);
        }
      }
    } catch (error) {
      logError(
        `Error reading from DEEPCRAWL_V0_LINKS_STORE for ${rootUrl}:`,
        error,
      );
      // Proceed without cache if read fails
    }

    // Define a type for all possible promise results
    type ParallelPromiseResult = TargetUrlResult | undefined;

    // Create an array to store promises that can be executed in parallel
    const parallelPromises: Array<Promise<ParallelPromiseResult>> = [];

    // --- Process Root URL with its descendants if targetUrl is not the root and is not a platform url ---
    if (targetUrl !== rootUrl) {
      if (!isPlatformUrl) {
        // Cast the result to match our ParallelPromiseResult type
        parallelPromises.push(processRootUrl(rootUrl).then(() => undefined));
      } else if (ancestors && ancestors.length > 0) {
        // Cast the result to match our ParallelPromiseResult type
        parallelPromises.push(
          processRootUrl(ancestors[1]).then(() => undefined),
        );
      }
    }

    // --- Process other Ancestor Paths except root url ---
    if (ancestors && ancestors.length > 0) {
      const ancestorsExceptRoot = ancestors
        .filter((url) => url !== rootUrl)
        .slice(0, MAX_KIN_LIMIT);
      // Cast the result to match our ParallelPromiseResult type
      parallelPromises.push(
        processKinLinks(ancestorsExceptRoot).then(() => undefined),
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

    // If we have an error response, return it immediately
    if (errorResponse) {
      return errorResponse;
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
      });
    }

    // --- Store the final/updated tree back to KV ---
    if (finalTree) {
      try {
        const treeToStore = finalTree;

        await kvPutWithRetry(
          c.env.DEEPCRAWL_V0_LINKS_STORE,
          // Use rootUrl for platform URLs, targetUrl for non-platform URLs to prevent huge confusing cache
          !isPlatformUrl ? rootUrl : (ancestors?.[1] ?? rootUrl),
          JSON.stringify(treeToStore),
          {
            metadata: {
              title: targetScrapeResult?.title,
              description: targetScrapeResult?.description,
              timestamp: new Date().toISOString(),
            },
            expirationTtl: KV_CACHE_EXPIRATION_TTL, // e.g., 1 day (in seconds)
          },
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

    // Calculate execution time
    const executionTime = formatDuration(performance.now() - startRequestTime);

    // add executionTime to finalTree's root node
    if (finalTree) {
      finalTree.executionTime = executionTime;
    }

    linksPostResponse = cleanEmptyValues<LinksSuccessResponse>({
      success: true,
      cached: linksCacheIsFresh,
      executionTime: !withTree || !finalTree ? executionTime : undefined,
      targetUrl,
      timestamp,
      ancestors,
      title: !withTree || !finalTree ? targetScrapeResult?.title : undefined,
      description:
        !withTree || !finalTree ? targetScrapeResult?.description : undefined,
      metadata:
        isMetadata && (!withTree || !finalTree)
          ? targetScrapeResult?.metadata
          : undefined,
      extractedLinks:
        includeExtractedLinks && (!withTree || !finalTree)
          ? linksFromTarget
          : undefined,
      cleanedHtml:
        isCleanedHtml && (!withTree || !finalTree)
          ? targetScrapeResult?.cleanedHtml
          : undefined,
      tree: withTree && finalTree ? finalTree : undefined,
      skippedUrls: !withTree || !finalTree ? categorizedSkippedUrls : undefined,
    });

    if (!linksPostResponse) {
      throw new Error('Failed to process links request');
    }

    return linksPostResponse as LinksSuccessResponse;
  } catch (error) {
    logError('❌ [LINKS PROCESSOR] error:', error);

    const err =
      error instanceof Error
        ? `${error.name}: ${error.message} - ${error.stack}`
        : String(error);

    throw new Error(err);
  }
}
