/**
 * Utility for retrying KV operations with exponential backoff
 */

/**
 * Retry a function with exponential backoff
 * Specifically designed to handle Cloudflare KV rate limiting (429 errors)
 *
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of retry attempts
 * @param initialDelay - Initial delay in milliseconds
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  initialDelay = 1000,
): Promise<T> {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    try {
      // Attempt the function
      return await fn();
    } catch (error) {
      // Check if the error is a rate limit error
      if (
        error instanceof Error &&
        error.message.includes('KV PUT failed: 429 Too Many Requests')
      ) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(
            `Max retry attempts (${maxAttempts}) reached: ${error.message}`,
          );
        }

        // Wait for the backoff period
        console.warn(
          `KV operation attempt ${attempts} failed. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Exponential backoff
        delay *= 2;
      } else {
        // If it's a different error, rethrow it
        throw error;
      }
    }
  }

  // This should never be reached due to the throw in the loop,
  // but TypeScript requires a return value
  throw new Error('Max retry attempts reached');
}

/**
 * Wrapper for KV put operation with retry logic
 *
 * @param kv - KV namespace
 * @param key - Key to write to
 * @param value - Value to write
 * @param options - KV put options
 * @returns Promise that resolves when the operation is complete
 */
export async function kvPutWithRetry<T>(
  kv: KVNamespace,
  key: string,
  value: string | ReadableStream | ArrayBuffer,
  options?: KVNamespacePutOptions,
): Promise<void> {
  const expirationTtl = options?.expirationTtl;
  const normalizedOptions =
    typeof expirationTtl === 'number' && Number.isFinite(expirationTtl)
      ? { ...options, expirationTtl: Math.max(60, expirationTtl) }
      : options;

  return retryWithBackoff(async () => {
    return await kv.put(key, value, normalizedOptions);
  });
}

/**
 * Wrapper for KV delete operation with retry logic
 *
 * @param kv - KV namespace
 * @param key - Key to delete
 * @returns Promise that resolves when the operation is complete
 */
export async function kvDeleteWithRetry(
  kv: KVNamespace,
  key: string,
): Promise<void> {
  return retryWithBackoff(async () => {
    return await kv.delete(key);
  });
}
