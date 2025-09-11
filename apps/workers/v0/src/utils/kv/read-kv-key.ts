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
  const { url, metricsOptions: _mO, ...rest } = params;

  // Generate hash of all options except for metricsOptions
  const optionsHash = await sha256Hash(stableStringify({ url, ...rest }));

  // Prefix includes handler type
  const handlerType = isStringResponse ? 'GET' : 'POST';
  const expirationTtl = params.cacheOptions?.expirationTtl;
  const ttl = expirationTtl
    ? `${Math.floor(expirationTtl / 86400)}d`
    : 'default-ttl';

  return `${handlerType}|read|${url}|${optionsHash}|${ttl}`;
}
