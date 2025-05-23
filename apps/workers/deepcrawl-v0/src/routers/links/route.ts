import type { Context } from 'hono';

import { performance } from 'node:perf_hooks';
import { Hono } from 'hono';

import type {
  LinksOptions,
  LinksPostResponse,
  LinksPostSuccessResponse,
  SkippedUrl,
  Tree,
  Visited,
} from '@deepcrawl/types/routers/links';
import type { ScrapedData } from '@deepcrawl/types/services/cheerio';
import type {
  ExtractedLinks,
  LinkExtractionOptions,
} from '@deepcrawl/types/services/link';

import {
  KV_CACHE_EXPIRATION_TTL,
  MAX_KIN_LIMIT,
  PLATFORM_URLS,
} from '@/config/constants';
import { DEFAULT_LINK_OPTIONS } from '@/config/default-options';
import {
  linksPostValidator,
  linksQueryValidator,
} from '@/middlewares/links.validator';
import { CheerioService } from '@/services/cheerio/cheerio.service';
import { LinkService } from '@/services/link/link.service';
import { formatDuration } from '@/utils/formater';
import { kvPutWithRetry } from '@/utils/kv/retry';
import * as helpers from '@/utils/links/helpers';
import { cleanEmptyValues } from '@/utils/response/clean-empty-values';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

// TODO: CONSIDER REMOVE cleanedHtml from the response and the tree

export interface _linksSets {
  internal: Set<string>;
  external: Set<string>;
  media: {
    images: Set<string>;
    videos: Set<string>;
    documents: Set<string>;
  };
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app
  .get('/', linksQueryValidator(), async (c) => {
    const params = c.req.valid('query');

    return processLinksRequest(c, params);
  })
  .post('/', linksPostValidator(), async (c) => {
    const body = c.req.valid('json');

    return processLinksRequest(c, body);
  });

/**
 * Process a link request for both GET and POST handlers
 */
async function processLinksRequest(
  c: Context<{ Bindings: CloudflareBindings }>,
  params: LinksOptions,
): Promise<Response> {
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
  let lastVisitedUrlsInCache = new Set<Visited>();
  let linksCacheIsFresh = false;

  // Helper function to check if a URL exists in the Set of visited URLs
  const isUrlInVisitedSet = (
    urlSet: Set<Visited>,
    urlToCheck: string,
  ): boolean => {
    for (const visitedItem of urlSet) {
      if (visitedItem.url === urlToCheck) {
        return true;
      }
    }
    return false;
  };

  let linksPostResponse: LinksPostResponse | undefined;

  try {
    const scrapeService = new CheerioService();
    const linkService = new LinkService();
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

    /**
     * Process target URL and merge its links into the global link sets
     * @returns Response on error, or an object with scrape results on success
     */
    async function processTargetUrl(): Promise<
      | Response
      | {
          targetScrapeResult: ScrapedData;
          allTargetLinks: ExtractedLinks;
        }
    > {
      // --- Scrape the target URL  ---
      const targetScrapeResult = await scrapeIfNotVisited(targetUrl);

      // If scraping failed, handle the error properly
      if (!targetScrapeResult || !targetScrapeResult.rawHtml) {
        const tree: Tree | undefined = existingTree;

        linksPostResponse = {
          success: false,
          targetUrl,
          error:
            'Failed to scrape target URL. The URL may be unreachable, a placeholder URL, or returning an error status.',
          timestamp: new Date().toISOString(),
          tree: withTree && existingTree ? tree : undefined,
        };

        return c.json(linksPostResponse, 500);
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
            console.error(`Error processing path ${kin}:`, error);
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
        console.error(`Error processing root URL ${rootUrl}:`, error);
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
      console.error(
        `Error reading from DEEPCRAWL_V0_LINKS_STORE for ${rootUrl}:`,
        error,
      );
      // Proceed without cache if read fails
    }

    // Define the return type for processTargetUrl to use in our parallel promises
    type TargetUrlResult =
      | {
          targetScrapeResult: ScrapedData;
          allTargetLinks: ExtractedLinks;
        }
      | Response;

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

    // Check if any result is a Response (error response)
    const errorResponse = results.find(
      (result): result is Response => result instanceof Response,
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
        !Array.isArray(result) &&
        ('targetScrapeResult' in result || result instanceof Response),
    );

    if (
      targetUrlResult &&
      !(targetUrlResult instanceof Response) &&
      'targetScrapeResult' in targetUrlResult
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
        console.warn(
          `[LINK Endpoint] Failed to store sitemap in KV for ${rootUrl}. Error: ${error instanceof Error ? error.message : String(error)}`,
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

    linksPostResponse = cleanEmptyValues<LinksPostSuccessResponse>({
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

    return c.json(linksPostResponse);
  } catch (error) {
    linksPostResponse = {
      success: false,
      targetUrl: url,
      timestamp,
      error:
        error instanceof Error
          ? `${error.name}: ${error.message} - ${error.stack}`
          : String(error),
    };

    return c.json(linksPostResponse, 500);
  }
}

export default app;
