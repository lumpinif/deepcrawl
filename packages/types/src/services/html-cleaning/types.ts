import { z } from 'zod/v4';

/**
 * Schema for HTML cleaning configuration options.
 * Defines the validation rules for HTML sanitization parameters.
 */
export const HTMLCleaningOptionsSchema = z
  .object({
    allowedHTMLTags: z
      .array(z.string())
      .optional()
      .meta({
        description: 'HTML tags to preserve in the output (whitelist)',
        example: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'strong', 'em'],
      }),
    disallowedHTMLTags: z
      .array(z.string())
      .optional()
      .meta({
        description: 'HTML tags to remove from the output (blacklist)',
        example: ['script', 'style', 'iframe', 'form', 'button'],
      }),
    extractMainContent: z.boolean().optional().default(true).meta({
      description:
        'Whether to extract only the main content area, removing navigation, footers, etc.',
      example: true,
    }),
    /* Deprecated property, will be removed in future. add baseUrl to HTMLCleaning as a required parameter instead*/
    documentBaseUrl: z.string().optional().meta({
      description:
        'Base URL for resolving relative URLs (deprecated, use baseUrl parameter instead)',
      example: 'https://example.com',
      deprecated: true,
    }),
    removeBase64Images: z.boolean().optional().default(true).meta({
      description:
        'Whether to remove base64 encoded images to reduce payload size',
      example: true,
    }),
  })
  .strict()
  .meta({
    title: 'HTMLCleaningOptions',
    description: 'Schema for HTML cleaning configuration options',
    examples: [
      {
        allowedHTMLTags: [
          'p',
          'h1',
          'h2',
          'h3',
          'ul',
          'ol',
          'li',
          'a',
          'strong',
          'em',
        ],
        disallowedHTMLTags: ['script', 'style', 'iframe', 'form', 'button'],
        extractMainContent: true,
        documentBaseUrl: 'https://example.com',
        removeBase64Images: true,
      },
    ],
  });

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
 * Schema for HTML cleaning performance metrics.
 * Tracks the size changes during HTML cleaning operations.
 */
export const HTMLCleaningMetricsSchema = z
  .object({
    inputSize: z.number().meta({
      description: 'Original HTML size in bytes',
      example: 45000,
    }),
    outputSize: z.number().meta({
      description: 'Cleaned HTML size in bytes',
      example: 12000,
    }),
    compressionRatio: z.number().meta({
      description: 'Compression ratio (original size / cleaned size)',
      example: 0.75,
    }),
  })
  .meta({
    title: 'HTMLCleaningMetrics',
    description: 'Schema for HTML cleaning performance metrics',
  });

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
 * Schema for HTML cleaning operation result.
 * Contains the cleaned HTML content along with metadata about the cleaning process.
 */
export const HTMLCleaningResultSchema = z
  .object({
    cleanedHtml: z.string().meta({
      description: 'The cleaned HTML content',
      example:
        '<h1>Clean Title</h1><p>Clean content without scripts or styles.</p>',
    }),
    metrics: HTMLCleaningMetricsSchema.optional().meta({
      description: 'Performance metrics for the cleaning operation',
    }),
  })
  .meta({
    title: 'HTMLCleaningResult',
    description: 'Schema for HTML cleaning operation result',
  });

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
