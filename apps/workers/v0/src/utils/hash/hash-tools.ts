import type { LinksOptions } from '@deepcrawl/types/routers/links';
import type { ReadOptions } from '@deepcrawl/types/routers/read';

/**
 * Stable stringify with deep key sorting for deterministic hashing.
 * Ensures nested object differences affect the output.
 */
export function stableStringify(
  obj: ReadOptions | LinksOptions | unknown,
): string {
  const seen = new WeakSet<object>();

  function normalize(value: unknown): unknown {
    if (value === null) return null;
    const valueType = typeof value;
    if (valueType !== 'object') return value;

    // Arrays: preserve order, normalize items
    if (Array.isArray(value)) return value.map((item) => normalize(item));

    // Objects: deep sort keys
    const objectValue = value as Record<string, unknown>;
    if (seen.has(objectValue)) return null; // guard against cycles
    seen.add(objectValue);

    const sortedKeys = Object.keys(objectValue).sort();
    const normalized: Record<string, unknown> = {};
    for (const key of sortedKeys) normalized[key] = normalize(objectValue[key]);
    return normalized;
  }

  return JSON.stringify(normalize(obj));
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
