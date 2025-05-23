/**
 * Common URL utilities for HTML cleaning handlers
 */
interface URLUtils {
  /**
   * Removes the anchor fragment from a URL while preserving the rest of the URL
   */
  removeAnchorFragment: (url: string) => string;

  /**
   * Normalizes a URL by converting relative paths to absolute using the base URL
   */
  normalizeUrl: (url: string) => string;
}

/**
 * Base handler class with common URL normalization functionality
 */
abstract class BaseURLHandler
  implements HTMLRewriterElementContentHandlers, URLUtils
{
  protected readonly baseUrl: URL;

  constructor(baseUrl: string) {
    this.baseUrl = new URL(baseUrl);
  }

  abstract element(element: Element): void;

  /**
   * Removes the anchor fragment from a URL while preserving the rest of the URL
   */
  removeAnchorFragment(url: string): string {
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      return url.substring(0, hashIndex);
    }
    return url;
  }

  /**
   * Normalizes a URL by converting relative paths to absolute using the base URL
   */
  normalizeUrl(url: string): string {
    // Special URLs that should be preserved as-is
    if (
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.startsWith('data:')
    ) {
      return url;
    }

    let normalizedUrl: string;

    // Handle protocol-relative URLs
    if (url.startsWith('//')) {
      normalizedUrl = `${this.baseUrl.protocol}${url}`;
    }
    // Handle absolute paths
    else if (url.startsWith('/')) {
      normalizedUrl = `${this.baseUrl.origin}${url}`;
    }
    // Handle all other URLs
    else {
      try {
        normalizedUrl = new URL(url, this.baseUrl).toString();
      } catch {
        return url; // Return original URL if invalid
      }
    }

    // Remove anchor fragment from the normalized URL
    return this.removeAnchorFragment(normalizedUrl);
  }
}

/**
 * Normalizes href URLs by converting relative paths to absolute using the base URL.
 * Handles both <a> tags and other elements with href attributes.
 */
export class LinkNormalizeHandler extends BaseURLHandler {
  element(element: Element): void {
    const href = element.getAttribute('href');
    if (!href) return;

    // Skip fragment-only URLs as they're handled by AnchorFragmentHandler
    if (href.startsWith('#')) {
      return;
    }

    try {
      const normalizedUrl = this.normalizeUrl(href);
      element.setAttribute('href', normalizedUrl);
    } catch (error) {
      // Skip invalid URLs
    }
  }
}

/**
 * Handles anchor tags with fragment links (#) by transforming them into spans.
 * Since HTMLRewriter doesn't allow changing tag names directly, this handler
 * uses other available methods to achieve a similar effect.
 */
export class AnchorFragmentHandler
  implements HTMLRewriterElementContentHandlers
{
  element(element: Element): void {
    const href = element.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    // Remove the href attribute
    element.removeAttribute('href');

    // Add a class to indicate this was an anchor link
    element.setAttribute(
      'class',
      `${element.getAttribute('class') || ''} converted-anchor`,
    );

    // Set a data attribute to store the original fragment (useful for debugging)
    element.setAttribute('data-original-fragment', href);

    // Set role to 'text' to make it behave more like a span semantically
    element.setAttribute('role', 'text');

    // Remove any onclick handlers that might be present
    element.removeAttribute('onclick');

    // Remove any other interactive attributes
    element.removeAttribute('target');
    element.removeAttribute('rel');
  }
}

/**
 * Normalizes image URLs by converting relative paths to absolute using the base URL.
 * Useful for ensuring images are correctly loaded from the same domain.
 */
export class ImageSrcNormalizeHandler extends BaseURLHandler {
  element(element: Element): void {
    const src = element.getAttribute('src');
    if (!src) return;

    try {
      const normalizedUrl = this.normalizeUrl(src);
      element.setAttribute('src', normalizedUrl);
    } catch (error) {
      // Skip invalid URLs
    }
  }
}
