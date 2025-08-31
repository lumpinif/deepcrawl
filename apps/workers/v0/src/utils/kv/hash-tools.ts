import type { LinksOptions } from '@deepcrawl/types/routers/links';
import type { ReadOptions } from '@deepcrawl/types/routers/read';

/**
 * Stable stringify with sorted keys for deterministic hashing
 */
export function stableStringify(
  obj: ReadOptions | LinksOptions | unknown,
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
