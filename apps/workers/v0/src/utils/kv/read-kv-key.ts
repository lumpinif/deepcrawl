import type { ReadOptions } from '@deepcrawl/types/routers/read';
import { sha256Hash, stableStringify } from '../hash/hash-tools';

/**
 * Generates a deterministic cache key for read endpoint KV storage.
 * Includes all options that affect the response content.
 */
export async function getReadCacheKey(
  params: ReadOptions,
  isStringResponse: boolean,
): Promise<string> {
  const { url, cacheOptions, ...contentAffectingOptions } = params;

  // Generate hash of all options that affect response content
  // Exclude cacheOptions since it only affects KV storage behavior, not response content
  const optionsHash = await sha256Hash(
    stableStringify(contentAffectingOptions),
  );

  // Prefix includes handler type (string or json)
  const handlerType = isStringResponse ? 'string' : 'json';
  return `${handlerType}:read:${url}:${optionsHash}`;
}
