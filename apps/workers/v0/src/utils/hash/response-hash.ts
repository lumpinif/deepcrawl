import type { ResponseTypes } from '@/services/response/response-record.service';
import { sha256Hash } from '@/utils/hash/hash-tools';

/**
 * Generate response hash for both read and links response
 * Hash = SHA-256(requestUrl + optionsHash + responseJSON)
 */
export async function generateResponseHash(
  targetUrl: string, // make sure use normalized target url
  optionsHash: string,
  response: ResponseTypes,
): Promise<string> {
  // Create deterministic response representation
  const responseString = JSON.stringify(response);

  // Combine URL, options, and response for hash
  const hashInput = `${targetUrl}|${optionsHash}|${responseString}`;

  return await sha256Hash(hashInput);
}

/**
 * Calculate response size in bytes for storage analytics
 * Approximates JSON serialization size
 */
export function calculateResponseSize(response: ResponseTypes): number {
  try {
    return new TextEncoder().encode(JSON.stringify(response)).length;
  } catch {
    // Fallback if response can't be serialized
    return 0;
  }
}
