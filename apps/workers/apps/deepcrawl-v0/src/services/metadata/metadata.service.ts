import type {
  MetadataOptions,
  PageMetadata,
} from '@deepcrawl-worker/types/services/metadata';

import { DEFAULT_METADATA_OPTIONS } from '@/config/default-options';

/**
 * Handler for extracting metadata from HTML elements
 */
class MetadataHandler {
  private metadata: PageMetadata = {};
  private options: MetadataOptions;
  private currentElement = '';

  constructor(options: MetadataOptions) {
    this.options = options;
  }

  element(element: Element): void {
    const tagName = element.tagName.toLowerCase();
    this.currentElement = tagName;

    // Extract language
    if (this.options.language && tagName === 'html') {
      const lang = element.getAttribute('lang');
      if (lang) {
        this.metadata.language = lang;
      }
    }

    // Extract meta tags
    if (tagName === 'meta') {
      const name = element.getAttribute('name')?.toLowerCase();
      const property = element.getAttribute('property')?.toLowerCase();
      const content = element.getAttribute('content');

      if (content) {
        // Basic metadata
        if (
          this.options.description &&
          (name === 'description' || property === 'og:description')
        ) {
          this.metadata.description = content;
        }
        if (this.options.robots && name === 'robots') {
          this.metadata.robots = content;
        }
        if (this.options.author && name === 'author') {
          this.metadata.author = content;
        }
        if (this.options.keywords && name === 'keywords') {
          this.metadata.keywords = content.split(',').map((k) => k.trim());
        }
        // Extract last modified date from article:modified_time
        if (property === 'article:modified_time') {
          this.metadata.lastModified = content;
        }

        // OpenGraph metadata (flat structure)
        if (this.options.openGraph && property?.startsWith('og:')) {
          switch (property) {
            case 'og:title':
              this.metadata.ogTitle = content;
              break;
            case 'og:description':
              this.metadata.ogDescription = content;
              break;
            case 'og:image':
              this.metadata.ogImage = content;
              break;
            case 'og:url':
              this.metadata.ogUrl = content;
              break;
            case 'og:type':
              this.metadata.ogType = content;
              break;
            case 'og:site_name':
              this.metadata.ogSiteName = content;
              break;
          }
        }

        // Twitter Card metadata (flat structure)
        if (
          this.options.twitter &&
          (name?.startsWith('twitter:') || property?.startsWith('twitter:'))
        ) {
          const twitterProp = (name || property)?.replace('twitter:', '');

          switch (twitterProp) {
            case 'card':
              this.metadata.twitterCard = content;
              break;
            case 'site':
              this.metadata.twitterSite = content;
              break;
            case 'creator':
              this.metadata.twitterCreator = content;
              break;
            case 'title':
              this.metadata.twitterTitle = content;
              break;
            case 'description':
              this.metadata.twitterDescription = content;
              break;
            case 'image':
              this.metadata.twitterImage = content;
              break;
          }
        }
      }
    }

    // Extract canonical URL and favicon
    if (tagName === 'link') {
      const rel = element.getAttribute('rel');
      const href = element.getAttribute('href');

      if (href) {
        // Extract canonical URL
        if (this.options.canonical && rel === 'canonical') {
          this.metadata.canonical = href;
        }

        // Extract favicon
        if (
          this.options.favicon &&
          (rel === 'icon' ||
            rel === 'shortcut icon' ||
            rel === 'apple-touch-icon')
        ) {
          this.metadata.favicon = href;
        }
      }
    }
  }

  text(text: Text): void {
    // Extract title text content
    if (this.options.title && this.currentElement === 'title') {
      const titleText = text.text.trim();
      if (titleText) {
        this.metadata.title = titleText;
      }
    }
  }

  getMetadata(): PageMetadata {
    return this.metadata;
  }
}

/**
 * Resolves a URL against a base URL
 * @param url The URL to resolve (may be relative or absolute)
 * @param baseUrl The base URL to resolve against
 * @returns The resolved absolute URL
 */
function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).toString();
  } catch (e) {
    return url; // Return original if parsing fails
  }
}

export class MetadataService {
  /**
   * Extracts essential metadata from a page using HTMLRewriter
   * @param html Raw HTML content of the page
   * @param options Metadata extraction options
   * @returns Object containing extracted metadata
   * @throws {Error} When metadata extraction fails
   */
  async extractMetadata({
    rawHtml,
    baseUrl,
    options = DEFAULT_METADATA_OPTIONS,
    isIframeAllowed,
  }: {
    rawHtml: string;
    baseUrl: string;
    options?: MetadataOptions;
    isIframeAllowed?: boolean;
  }): Promise<PageMetadata> {
    try {
      const mergedOptions = { ...DEFAULT_METADATA_OPTIONS, ...options };
      const handler = new MetadataHandler(mergedOptions);

      // Use HTMLRewriter to process the HTML
      const rewriter = new HTMLRewriter()
        .on('title', handler)
        .on('meta', handler)
        .on('html', handler)
        .on('link', handler);

      // Process the HTML
      await rewriter.transform(new Response(rawHtml)).text();

      const metadata = handler.getMetadata();

      // Resolve relative URLs to absolute URLs
      if (
        metadata.favicon &&
        !metadata.favicon.startsWith('http') &&
        mergedOptions.favicon
      ) {
        metadata.favicon = resolveUrl(metadata.favicon, baseUrl);
      }

      if (
        metadata.ogImage &&
        !metadata.ogImage.startsWith('http') &&
        mergedOptions.openGraph
      ) {
        metadata.ogImage = resolveUrl(metadata.ogImage, baseUrl);
      }

      if (
        metadata.twitterImage &&
        !metadata.twitterImage.startsWith('http') &&
        mergedOptions.twitter
      ) {
        metadata.twitterImage = resolveUrl(metadata.twitterImage, baseUrl);
      }

      if (
        metadata.canonical &&
        !metadata.canonical.startsWith('http') &&
        mergedOptions.canonical
      ) {
        metadata.canonical = resolveUrl(metadata.canonical, baseUrl);
      }

      return {
        ...metadata,
        isIframeAllowed,
      };
    } catch (error) {
      console.error('Failed to extract metadata:', error);
      // Return empty metadata object instead of throwing to prevent crawl failure
      return {
        title: 'failed to extract metadata',
      };
    }
  }
}
