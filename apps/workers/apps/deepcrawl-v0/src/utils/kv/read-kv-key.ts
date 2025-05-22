import type { MetadataOptions } from '@deepcrawl-worker/types/index';
import type { ReadOptions } from '@deepcrawl-worker/types/routers/read';

/**
 * Stable stringify with sorted keys for deterministic hashing
 */
export function stableStringify(
  obj: MetadataOptions | ReadOptions | unknown,
): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort());
}

/**
 * Generates a SHA-256 hash of the input string using Web Crypto API
 * @param input - String to hash
 * @returns Hex string of the hash
 */
export async function sha256Hash(input: string): Promise<string> {
  // Encode the input string to Uint8Array
  const msgUint8 = new TextEncoder().encode(input);

  // Hash the message using Web Crypto API (native in Cloudflare Workers)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);

  // Convert the ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a deterministic cache key for read endpoint KV storage.
 * Includes all options that affect the response.
 */
export async function getReadCacheKey(
  params: ReadOptions,
  isStringResponse: boolean,
): Promise<string> {
  const {
    url,
    markdown,
    cleanedHtml,
    metadata,
    robots,
    metadataOptions,
    rawHtml,
  } = params;

  // Create options object without isStringResponse
  const keyObj = {
    markdown: !!markdown,
    cleanedHtml: !!cleanedHtml,
    metadata: !!metadata,
    robots: !!robots,
    metadataOptions: metadataOptions
      ? stableStringify(metadataOptions)
      : undefined,
    rawHtml: !!rawHtml,
  };

  // Generate hash of options
  const optionsHash = await sha256Hash(stableStringify(keyObj));

  // Prefix includes handler type (string or json)
  const handlerType = isStringResponse ? 'string' : 'json';
  return `${handlerType}:read:${url}:${optionsHash}`;
}
