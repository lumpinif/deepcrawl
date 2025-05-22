import { URLError } from '@/middlewares/error';

import type { ScrapeAllowedResult } from './validate-url';

import { isScrapeAllowed, validateURL } from './validate-url';

/**
 * Validate and normalize a URL, and check if it's allowed for scraping.
 *
 * @param url - The URL to validate.
 * @param shouldRemoveFragment - Whether to remove the fragment (e.g., #section) from the URL.
 * @returns The normalized URL.
 * @throws URLError if the URL is invalid, not allowed for security reasons, or not allowed for scraping.
 */
export function targetUrlHelper(
  url: string | null,
  shouldRemoveFragment = false,
): string {
  if (!url) {
    throw new URLError('URL parameter is required');
  }

  const result = validateURL(url);

  if (!result.isValid) {
    throw new URLError(result.error || 'Invalid URL format');
  }

  if (result.unsafe) {
    throw new URLError('URL is not allowed for security reasons');
  }

  if (!result.normalizedURL) {
    throw new URLError('Failed to normalize URL');
  }

  // Additional check for scrapeable content
  const scrapeResult: ScrapeAllowedResult = isScrapeAllowed(
    result.normalizedURL,
  );
  if (!scrapeResult.allowed) {
    throw new URLError(
      scrapeResult.reason ||
        'URL content type or path is not allowed for scraping',
    );
  }

  if (shouldRemoveFragment) {
    const urlObj = new URL(result.normalizedURL);
    urlObj.hash = '';
    return urlObj.toString();
  }

  return result.normalizedURL;
}
