import type { LinksOptions } from '@deepcrawl/types/routers/links';
import { sha256Hash, stableStringify } from '../hash/hash-tools';

/**
 * Generates a deterministic cache key for non-tree links endpoint KV storage.
 * Includes all options that affect the response content for non-tree requests.
 */
export async function getLinksNonTreeCacheKey(
  params: LinksOptions,
  isGETRequest = false,
): Promise<string> {
  const { url } = params;

  // For non-tree requests, we only need to include options that affect the response
  const relevantOptions = {
    url: params.url,
    metadata: params.metadata,
    cleanedHtml: params.cleanedHtml,
    extractedLinks: params.extractedLinks,
    linkExtractionOptions: params.linkExtractionOptions,
    robots: params.robots,
    sitemapXML: params.sitemapXML,
    fetchOptions: params.fetchOptions,
    // Note: tree, folderFirst, linksOrder are excluded as they don't affect non-tree responses
  };

  // Generate hash of relevant options
  const optionsHash = await sha256Hash(stableStringify(relevantOptions));

  // Prefix includes handler type and indicates non-tree request
  const handlerType = isGETRequest ? 'GET' : 'POST';
  const expirationTtl = params.cacheOptions?.expirationTtl;
  const ttl = expirationTtl
    ? `${Math.floor(expirationTtl / 86400)}d`
    : 'default-ttl';

  return `${handlerType}|notree|${url}|${optionsHash}|${ttl}`;
}
