import type { SkippedUrl, VisitedUrl } from '@deepcrawl/types/routers/links';
import type {
  ExtractedLinks,
  LinkExtractionOptions,
} from '@deepcrawl/types/services/link';

import { MAX_VISITED_URLS_LIMIT } from '@/config/constants';
import { DEFAULT_LINK_OPTIONS } from '@/config/default-options';
import type { _linksSets } from '@/routers/links/links.processor';
import {
  ImageSrcNormalizeHandler,
  LinkNormalizeHandler,
} from '@/services/html-cleaning/handlers/link-normalize';
import { validateURL } from '@/utils/url/validate-url';

const MEDIA_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'],
  videos: ['.mp4', '.webm', '.ogg', '.mov', '.avi'],
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
} as const;

// Framework-specific patterns to filter out
const FRAMEWORK_PATTERNS = [
  // Next.js
  '/_next/',
  // React
  '/static/js/',
  '/static/css/',
  '/static/media/',
  // Vue
  '/_nuxt/',
  // Angular
  '/assets/js/',
  '/assets/css/',
  // WordPress
  '/wp-content/',
  '/wp-includes/',
  '/wp-admin/',
  // Others
  '/_sites/',
  '/cdn-cgi/',
];

export class LinkService {
  /**
   * Extracts links from HTML content using HTMLRewriter
   * @param html Raw HTML string to extract links from
   * @param baseUrl Base URL for resolving relative links
   * @param options Link extraction options
   * @returns Object containing categorized links
   */
  async extractLinksFromHtml({
    html,
    baseUrl,
    rootUrl,
    options,
    skippedUrls,
  }: {
    html?: string;
    baseUrl: string;
    rootUrl?: string;
    options?: LinkExtractionOptions;
    skippedUrls?: Map<SkippedUrl['url'], SkippedUrl['reason']>;
  }): Promise<ExtractedLinks> {
    const mergedOptions = { ...DEFAULT_LINK_OPTIONS, ...options };
    const links = new Set<string>();

    if (!html) {
      return {
        internal: undefined,
        external: undefined,
        media: undefined,
      };
    }

    // Normalize handlers
    const linkHandler = new LinkNormalizeHandler(baseUrl);
    const imageHandler = new ImageSrcNormalizeHandler(baseUrl);

    // Use HTMLRewriter to process the HTML
    const rewriter = new HTMLRewriter()
      .on('a[href]', {
        element: (element) => {
          linkHandler.element(element);
          const href = element.getAttribute('href');
          if (
            href &&
            !href.startsWith('#') &&
            !href.startsWith('javascript:') &&
            !this.isExcluded(href, mergedOptions.excludePatterns) &&
            !this.isFrameworkResource(href)
          ) {
            const url = this.normalizeUrl(
              href,
              baseUrl,
              mergedOptions.removeQueryParams,
            );

            const result = validateURL(url);

            if (result.normalizedURL) {
              links.add(result.normalizedURL);
            }

            if (!result.isValid && result.error) {
              skippedUrls?.set(url, result.error);
            }
          }
        },
      })
      .on('img[src], video[src], source[src], iframe[src], audio[src]', {
        element: (element) => {
          imageHandler.element(element);
          const src = element.getAttribute('src');
          if (
            src &&
            !this.isExcluded(src, mergedOptions.excludePatterns) &&
            !this.isFrameworkResource(src)
          ) {
            const url = this.normalizeUrl(
              src,
              baseUrl,
              mergedOptions.removeQueryParams,
            );

            const result = validateURL(url);

            if (result.normalizedURL) {
              links.add(result.normalizedURL);
            }

            if (!result.isValid && result.error) {
              skippedUrls?.set(url, result.error);
            }
          }
        },
      });

    await rewriter
      .transform(
        new Response(html, {
          headers: { 'content-type': 'text/html' },
        }),
      )
      .text();

    const categorizedLinks = this.categorizeLinks(
      links,
      baseUrl,
      rootUrl || this.getRootUrl(baseUrl),
      mergedOptions,
    );

    return categorizedLinks;
  }

  public getRootUrl(url: string): string {
    const urlObject = new URL(url);
    const rootDomain = this.extractRootDomain(urlObject.hostname);

    return `${urlObject.protocol}//${rootDomain}`;
  }

  public getAncestorPaths(url: string): string[] | undefined {
    const rootUrl = this.getRootUrl(url);
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/').filter(Boolean);
    const ancestorPaths: string[] | undefined = [];

    // Always include the root URL if it's different from the target URL
    if (rootUrl && rootUrl !== url) {
      ancestorPaths.push(rootUrl);
    }

    // Add path segments
    let currentPath = urlObject.origin;
    for (let i = 0; i < pathSegments.length - 1; i++) {
      currentPath += `/${pathSegments[i]}`;
      ancestorPaths.push(currentPath);
    }

    return ancestorPaths.length > 0 ? ancestorPaths : undefined;
  }

  /**
   * Gets descendant paths from a list of internal links relative to a base URL
   * @param baseUrl The base URL to find descendants for
   * @param internalLinks A Set or Array of internal links
   * @param maxSteps Maximum depth of descendants to include (1 = direct children only)
   * @returns Array of descendant paths, limited by maxSteps
   */
  public getDescendantPaths(
    baseUrl: string,
    internalLinks: Set<string> | string[],
    maxSteps?: number,
  ): string[] | undefined {
    // Normalize the base URL to ensure consistent comparison
    const normalizedBaseUrl = this.normalizeUrl(baseUrl, '', true);
    const baseUrlObj = new URL(normalizedBaseUrl);
    const basePathSegments = baseUrlObj.pathname.split('/').filter(Boolean);
    const descendantPaths: string[] = [];

    // Convert internalLinks to array if it's a Set
    const linksArray = Array.isArray(internalLinks)
      ? internalLinks
      : Array.from(internalLinks);

    for (const link of linksArray) {
      try {
        // Normalize the link for comparison
        const normalizedLink = this.normalizeUrl(link, '', true);
        const linkObj = new URL(normalizedLink);

        // Skip if not on the same hostname
        if (linkObj.hostname !== baseUrlObj.hostname) {
          continue;
        }

        const linkPathSegments = linkObj.pathname.split('/').filter(Boolean);

        // Check if this is a descendant path (has more segments and starts with base path)
        if (linkPathSegments.length > basePathSegments.length) {
          // Check if all base segments match the beginning of link segments
          let isDescendant = true;
          for (let i = 0; i < basePathSegments.length; i++) {
            if (basePathSegments[i] !== linkPathSegments[i]) {
              isDescendant = false;
              break;
            }
          }

          // Check if the descendant is within the maxSteps limit
          const stepsAway = linkPathSegments.length - basePathSegments.length;

          if (isDescendant && (maxSteps ? stepsAway <= maxSteps : true)) {
            descendantPaths.push(normalizedLink);
          }
        }
      } catch (error) {
        // Skip invalid URLs
        console.error(`Error processing link: ${link}`, error);
      }
    }

    // Sort by path length (shorter paths first)
    return descendantPaths.length > 0
      ? descendantPaths.sort((a, b) => {
          const aSegments = new URL(a).pathname
            .split('/')
            .filter(Boolean).length;
          const bSegments = new URL(b).pathname
            .split('/')
            .filter(Boolean).length;
          return aSegments - bSegments;
        })
      : undefined;
  }

  /**
   * Checks if a URL matches any exclude patterns
   */
  private isExcluded(url: string, patterns?: string[]): boolean {
    if (!patterns?.length) return false;
    return patterns.some((pattern) => {
      try {
        return new RegExp(pattern).test(url);
      } catch {
        return false;
      }
    });
  }

  /**
   * Checks if a URL is a framework-specific resource that should be excluded
   */
  private isFrameworkResource(url: string): boolean {
    try {
      const urlObj = new URL(url);

      // Check for framework-specific patterns in the pathname
      return FRAMEWORK_PATTERNS.some((pattern) =>
        urlObj.pathname.includes(pattern),
      );
    } catch {
      return false;
    }
  }

  /**
   * Normalizes a URL and optionally removes query parameters
   * Also performs security validation if validateSecurity is true
   */
  public normalizeUrl(
    url: string,
    baseUrl: string,
    removeQueryParams?: LinkExtractionOptions['removeQueryParams'],
  ): string {
    try {
      // Check if URL is valid before attempting to create a URL object
      if (!url || typeof url !== 'string') {
        return url || '';
      }

      // Handle absolute URLs directly without using baseUrl
      // This fixes issues when baseUrl is empty but url is already absolute
      let urlObj: URL;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        urlObj = new URL(url);
      } else if (baseUrl) {
        urlObj = new URL(url, baseUrl);
      } else {
        // Can't create a URL object without a base for relative URLs
        return url;
      }

      // Always remove fragments
      urlObj.hash = '';
      // Optionally remove query parameters
      if (removeQueryParams === undefined || removeQueryParams === true) {
        urlObj.search = '';
      }
      // Remove trailing slash
      let urlString = urlObj.toString();
      if (urlString.endsWith('/')) {
        urlString = urlString.slice(0, -1);
      }
      return urlString;
    } catch (error) {
      // Return the original URL instead of throwing an error
      console.warn(
        `Warning: Could not normalize URL "${url}": ${String(error)}`,
      );
      return url;
    }
  }

  /**
   * Categorizes a set of URLs into internal, external, and media links
   */
  private categorizeLinks(
    links: Set<string>,
    baseUrl: string,
    rootUrl: string,
    options: LinkExtractionOptions,
  ): ExtractedLinks {
    const result: ExtractedLinks = {};

    // Always include internal links
    result.internal = [];

    if (options.includeExternal) {
      result.external = [];
    }

    if (options.includeMedia) {
      result.media = {
        images: [],
        videos: [],
        documents: [],
      };
    }

    try {
      const base = new URL(baseUrl);
      const root = new URL(rootUrl);

      // Extract hostnames once
      const baseHostname = base.hostname;
      const rootHostname = root.hostname;

      // Get the last two parts of the hostname (the root domain) for comparison
      const baseHostnameParts = baseHostname.split('.');
      const rootHostnameParts = rootHostname.split('.');

      const baseRootDomain = baseHostnameParts.slice(-2).join('.');
      const rootRootDomain = rootHostnameParts.slice(-2).join('.');

      for (const url of links) {
        try {
          const parsedUrl = new URL(url);

          // Skip framework-specific resources
          if (this.isFrameworkResource(url)) {
            console.log(`Skipping framework resource: ${url}`);
            continue;
          }

          let isMedia = false;

          // Always check if it's a media URL, regardless of includeMedia setting
          for (const [type, extensions] of Object.entries(MEDIA_EXTENSIONS)) {
            if (extensions.some((ext) => url.toLowerCase().endsWith(ext))) {
              isMedia = true;
              // Only add to media arrays if includeMedia is true
              if (
                options.includeMedia &&
                result?.media?.[type as keyof typeof MEDIA_EXTENSIONS]
              ) {
                result.media[type as keyof typeof MEDIA_EXTENSIONS]?.push(url);
              }
              break;
            }
          }

          if (!isMedia) {
            // Extract parsed URL's root domain only once
            const parsedHostname = parsedUrl.hostname;
            const parsedHostnameParts = parsedHostname.split('.');
            const parsedRootDomain = parsedHostnameParts.slice(-2).join('.');

            // Check if the URL belongs to the same root domain
            if (
              parsedUrl.hostname === base.hostname ||
              parsedUrl.hostname === root.hostname ||
              parsedRootDomain === baseRootDomain ||
              parsedRootDomain === rootRootDomain
            ) {
              if (parsedUrl.pathname !== '/') {
                result.internal?.push(url);
              }
            } else {
              result.external?.push(url);
            }
          }
        } catch (error) {
          console.error('Failed to categorize URL:', { url, error });
        }
      }
    } catch (error) {
      console.error('Failed to parse base URL:', { baseUrl, error });
    }

    // --- Sorting removed to preserve page/discovery order ---
    // DEPRECATED AND SHOULD BE REMOVED IN FUTURE VERSIONS
    /*
    // Pre-compute sorting metadata to avoid repeated URL parsing during sort
    const sortMetadata = new Map<
      string,
      { isTargetDomain: boolean; pathSegmentCount: number }
    >();

    for (const url of result.internal) {
      try {
        const parsedUrl = new URL(url);
        sortMetadata.set(url, {
          isTargetDomain: parsedUrl.hostname === baseHostname,
          pathSegmentCount: this.getPathSegmentCount(url),
        });
      } catch (error) {
        console.error('Error pre-computing sort metadata:', { url, error });
        sortMetadata.set(url, {
          isTargetDomain: false,
          pathSegmentCount: Number.POSITIVE_INFINITY,
        });
      }
    }

    // Sort using the pre-computed metadata
    result.internal.sort((a, b) => {
      const metadataA = sortMetadata.get(a) || {
        isTargetDomain: false,
        pathSegmentCount: 0,
      };
      const metadataB = sortMetadata.get(b) || {
        isTargetDomain: false,
        pathSegmentCount: 0,
      };

      // First, prioritize the target domain
      if (metadataA.isTargetDomain && !metadataB.isTargetDomain) return -1;
      if (!metadataA.isTargetDomain && metadataB.isTargetDomain) return 1;

      // If both are from the same domain, sort by path segment count
      return metadataA.pathSegmentCount - metadataB.pathSegmentCount;
    });
    */

    if (result.external && result.external.length > 0) {
      result.external.sort();
    } else {
      result.external = undefined;
    }

    // Handle media arrays
    if (result.media) {
      if (result.media.images && result.media.images.length > 0) {
        result.media.images.sort();
      } else {
        result.media.images = undefined;
      }

      if (result.media.videos && result.media.videos.length > 0) {
        result.media.videos.sort();
      } else {
        result.media.videos = undefined;
      }

      if (result.media.documents && result.media.documents.length > 0) {
        result.media.documents.sort();
      } else {
        result.media.documents = undefined;
      }

      // If all media arrays are undefined, set the entire media object to undefined
      if (
        !result.media.images &&
        !result.media.videos &&
        !result.media.documents
      ) {
        result.media = undefined;
      }
    }

    return result;
  }

  public extractRootDomain(hostname: string): string {
    const hostnameParts = hostname.split('.');
    return hostnameParts.slice(-2).join('.');
  }

  /**
   * Calculates the number of path segments in a URL
   * Used for sorting links by hierarchy level (direct children first)
   */
  public getPathSegmentCount(url: string): number {
    try {
      const parsedUrl = new URL(url);
      // Remove leading and trailing slashes, then count segments
      const path = parsedUrl.pathname.replace(/^\/|\/$/g, '');
      // Empty path means root (0 segments)
      if (!path) return 0;
      // Count segments by splitting on slashes
      return path.split('/').length;
    } catch (error) {
      console.error('Failed to parse URL for segment counting:', {
        url,
        error,
      });
      return Number.POSITIVE_INFINITY; // Place invalid URLs at the end
    }
  }

  // Helper function to merge extracted links into our sets
  public mergeLinks(links: ExtractedLinks, linksSets: _linksSets) {
    // Add internal and external links
    if (links.internal) {
      for (const link of links.internal) {
        linksSets.internal.add(link);
      }
    }
    if (links.external) {
      for (const link of links.external) {
        linksSets.external.add(link);
      }
    }

    // Add media links if they exist
    if (links.media?.images) {
      for (const link of links.media.images) {
        linksSets.media.images.add(link);
      }
    }
    if (links.media?.videos) {
      for (const link of links.media.videos) {
        linksSets.media.videos.add(link);
      }
    }
    if (links.media?.documents) {
      for (const link of links.media.documents) {
        linksSets.media.documents.add(link);
      }
    }
  }

  /**
   * Helper function to merge and deduplicate visited URLs
   * @param existingUrls Existing visited URLs
   * @param newlyVisitedUrls Newly visited URLs with their timestamps
   * @returns A Set of merged and deduplicated visited URLs, sorted by lastVisited (newest first)
   */
  public mergeVisitedUrls(
    existingUrls: Set<VisitedUrl>,
    newlyVisitedUrls: Set<string>,
    urlTimestamps: Map<string, string>,
  ): Set<VisitedUrl> {
    const urlMap = new Map<string, VisitedUrl>();

    // First add all existing URLs to the map
    for (const visitedItem of existingUrls) {
      urlMap.set(visitedItem.url, visitedItem);
    }

    // Then add or update with newly visited URLs, using their individual timestamps
    for (const url of newlyVisitedUrls) {
      const timestamp = urlTimestamps.get(url) || new Date().toISOString();
      urlMap.set(url, { url, lastVisited: timestamp });
    }

    // Convert to array, sort by lastVisited (newest first)
    const urlArray = Array.from(urlMap.values());
    urlArray.sort((a, b) => {
      // Handle null or undefined lastVisited values
      if (!a.lastVisited) return 1;
      if (!b.lastVisited) return -1;
      // Sort newest first
      return (
        new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
      );
    });

    // Limit the number of visited URLs to prevent excessive growth
    const limitedUrlArray = urlArray.slice(0, MAX_VISITED_URLS_LIMIT);

    return new Set(limitedUrlArray);
  }
}
