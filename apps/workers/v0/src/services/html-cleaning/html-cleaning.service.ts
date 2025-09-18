import { DEFAULT_HTML_REWRITER_OPTIONS } from '@deepcrawl/types/configs';
import type {
  HTMLCleaningResult,
  HTMLRewriterOptions,
} from '@deepcrawl/types/services/html-cleaning';
import {
  AnchorFragmentHandler,
  ImageSrcNormalizeHandler,
  LinkNormalizeHandler,
} from '@/services/html-cleaning/handlers/link-normalize';
import { Base64ImageHandler } from './handlers/base64-image';
import { MainContentHandler } from './handlers/main-content';
import { TagFilterHandler } from './handlers/tag-filter';

/**
 * Main HTML cleaning service using HTMLRewriter
 * Key features:
 * 1. Main content extraction (removing headers, footers, etc)
 * 2. Tag filtering (include/exclude specific tags)
 * 3. Base64 image removal
 * 4. URL normalization
 */
export async function HTMLRewriterCleaning({
  rawHtml,
  baseUrl,
  options = DEFAULT_HTML_REWRITER_OPTIONS,
}: {
  rawHtml: string;
  baseUrl: string;
  options?: HTMLRewriterOptions;
}): Promise<HTMLCleaningResult> {
  // Initialize metrics
  // const metrics: HTMLCleaningMetrics = {
  //   inputSize: new TextEncoder().encode(rawHtml).length,
  //   outputSize: 0,
  //   compressionRatio: 0,
  // };

  // Create HTML Rewriter instance
  const rewriter = new HTMLRewriter();

  // Step 1: Handle tag filtering
  if (options?.allowedHTMLTags?.length || options?.disallowedHTMLTags?.length) {
    rewriter.on(
      '*',
      new TagFilterHandler(
        options?.allowedHTMLTags,
        options?.disallowedHTMLTags,
      ),
    );
  }

  // Step 2: Handle main content extraction (if not using allowedTags)
  if (
    !options?.allowedHTMLTags?.length &&
    options?.extractMainContent !== false
  ) {
    rewriter.on('*', new MainContentHandler());
  }

  // Step 3: Handle base64 images (default: true)
  if (options?.removeBase64Images !== false) {
    rewriter.on('img[src]', new Base64ImageHandler());
  }

  // Step 4: Handle URL normalization if base URL is provided
  if (baseUrl) {
    // Normalize image URLs
    rewriter.on('img[src]', new ImageSrcNormalizeHandler(baseUrl));

    // Handle anchor tags with fragment links (#)
    rewriter.on('a[href^="#"]', new AnchorFragmentHandler());

    // Normalize all types of links
    const linkHandler = new LinkNormalizeHandler(baseUrl);
    rewriter.on('a[href]', linkHandler);
    rewriter.on('link[href]', linkHandler);
    rewriter.on('area[href]', linkHandler);
  }

  // Transform the HTML
  const response = new Response(rawHtml, {
    headers: { 'content-type': 'text/html' },
  });

  const transformedResponse = rewriter.transform(response);
  const cleanedHtml = await transformedResponse.text();

  // Calculate metrics
  // metrics.outputSize = new TextEncoder().encode(cleanedHtml).length;
  // metrics.compressionRatio = metrics.outputSize / metrics.inputSize;

  return {
    cleanedHtml,
    // metrics, // CURRENTLY NOT USED
  };
}
