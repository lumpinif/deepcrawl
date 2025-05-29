import { z } from '@hono/zod-openapi';

/**
 * Schema for HTML cleaning configuration options.
 * Defines the validation rules for HTML sanitization parameters.
 */
export const HTMLCleaningOptionsSchema = z
  .object({
    allowedHTMLTags: z.array(z.string()).optional(),
    disallowedHTMLTags: z.array(z.string()).optional(),
    extractMainContent: z.boolean().optional().default(true),
    /* Deprecated property, will be removed in future. add baseUrl to HTMLCleaning as a required parameter instead*/
    documentBaseUrl: z.string().optional(),
    removeBase64Images: z.boolean().optional().default(true),
  })
  .strict()
  .openapi('HTMLCleaningOptions');

/**
 * Configuration options for HTML content cleaning and sanitization.
 * Controls which elements are preserved or removed during processing.
 *
 * @property allowedHTMLTags - HTML tags to preserve in the output (whitelist)
 * @property disallowedHTMLTags - HTML tags to remove from the output (blacklist)
 * @property extractMainContent - Whether to extract only the main content area, removing navigation, footers, etc.
 * @property documentBaseUrl - Base URL for resolving relative URLs (deprecated, use baseUrl parameter instead)
 * @property removeBase64Images - Whether to remove base64 encoded images to reduce payload size
 *
 * @example
 * ```typescript
 * const cleaningOptions: HTMLCleaningOptions = {
 *   allowedHTMLTags: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'strong', 'em'],
 *   disallowedHTMLTags: ['script', 'style', 'iframe', 'form', 'button'],
 *   extractMainContent: true,
 *   documentBaseUrl: 'https://example.com',
 *   removeBase64Images: true
 * };
 * ```
 */
export type HTMLCleaningOptions = z.infer<typeof HTMLCleaningOptionsSchema>;

/**
 * Schema for defining patterns to match DOM elements.
 * Used to create selectors for targeting specific elements during HTML processing.
 */
export const ElementPatternSchema = z
  .object({
    tag: z.union([z.string(), z.instanceof(RegExp)]).optional(),
    attributes: z
      .array(
        z
          .object({
            name: z.union([z.string(), z.instanceof(RegExp)]),
            value: z.union([z.string(), z.instanceof(RegExp)]).optional(),
          })
          .strict(),
      )
      .optional(),
    classNames: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
    ids: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  })
  .strict();

/**
 * Defines a pattern for matching DOM elements based on their properties.
 * Used for targeted element selection during HTML sanitization.
 *
 * @property tag - Element tag name or regex pattern to match (e.g., 'div', /^h[1-6]$/)
 * @property attributes - List of attribute patterns to match by name and optional value
 * @property classNames - List of class names or regex patterns to match in the class attribute
 * @property ids - List of ID patterns to match in the id attribute
 *
 * @example
 * ```typescript
 * const mainContentPattern: ElementPattern = {
 *   tag: 'div',
 *   attributes: [{ name: 'data-role', value: 'content' }],
 *   classNames: ['main-content', /^content-/],
 *   ids: ['main', 'article-body']
 * };
 *
 * const navigationPattern: ElementPattern = {
 *   tag: /^nav$/i,
 *   classNames: [/nav/, /menu/, /header/],
 *   ids: ['navigation', 'main-menu']
 * };
 * ```
 */
export type ElementPattern = z.infer<typeof ElementPatternSchema>;

/**
 * Schema for metrics collected during HTML cleaning.
 * Tracks performance and effectiveness of the cleaning process.
 */
export const HTMLCleaningMetricsSchema = z
  .object({
    inputSize: z.number(),
    outputSize: z.number(),
    compressionRatio: z.number(),
  })
  .openapi('HTMLCleaningMetrics');

/**
 * Metrics collected during HTML cleaning and sanitization.
 * Provides insights into the effectiveness of the cleaning process.
 *
 * @property inputSize - Size of input HTML in bytes before cleaning
 * @property outputSize - Size of cleaned HTML in bytes after processing
 * @property compressionRatio - Ratio of output size to input size (lower is better)
 *
 * @example
 * ```typescript
 * const metrics: HTMLCleaningMetrics = {
 *   inputSize: 125000,  // 125KB input
 *   outputSize: 42000,  // 42KB output
 *   compressionRatio: 0.336  // 33.6% of original size
 * };
 * ```
 */
export type HTMLCleaningMetrics = z.infer<typeof HTMLCleaningMetricsSchema>;

/**
 * Schema for the result of HTML cleaning operation.
 * Defines the structure of the cleaning operation output.
 */
export const HTMLCleaningResultSchema = z
  .object({
    cleanedHtml: z.string(),
    metrics: HTMLCleaningMetricsSchema.optional(),
  })
  .openapi('HTMLCleaningResult');

/**
 * Result of HTML cleaning and sanitization.
 * Contains the processed HTML and optional performance metrics.
 *
 * @property cleanedHtml - Cleaned and sanitized HTML content
 * @property metrics - Optional metrics collected during the cleaning process
 *
 * @example
 * ```typescript
 * const result: HTMLCleaningResult = {
 *   cleanedHtml: "<div><h1>Article Title</h1><p>Clean content...</p></div>",
 *   metrics: {
 *     inputSize: 125000,
 *     outputSize: 42000,
 *     compressionRatio: 0.336
 *   }
 * };
 * ```
 */
export type HTMLCleaningResult = z.infer<typeof HTMLCleaningResultSchema>;
