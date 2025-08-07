import { smartboolTrue } from '@deepcrawl/types/common/smart-schemas';
import {
  DEFAULT_HTML_REWRITER_OPTIONS,
  DEFAULT_READER_CLEANING_OPTIONS,
} from '@deepcrawl/types/configs';
import { z } from 'zod/v4';

/**
 * @note only applied when cleaning processor is 'cheerio-reader'
 * Options for HTML cleaning with cheerio-reader.
 * Controls how HTML is sanitized and cleaned.
 */
export const ReaderOptionsSchema = z
  .object({
    /**
     * Whether to enable logging.
     * Default: false
     */
    debug: z
      .boolean()
      .optional()
      .meta({
        description: 'Whether to enable logging.',
        examples: [false],
      }),

    /**
     * The maximum number of elements to parse.
     * Default: 0 (no limit)
     */
    maxElemsToParse: z
      .number()
      .optional()
      .meta({
        description:
          'The maximum number of elements to parse. 0 means no limit.',
        examples: [0, 1000],
      }),

    /**
     * The number of top candidates to consider when analysing how tight the competition is among candidates.
     * Default: 5
     */
    nbTopCandidates: z
      .number()
      .optional()
      .meta({
        description:
          'The number of top candidates to consider when analysing competition among candidates.',
        examples: [5, 10],
      }),

    /**
     * The number of characters an article must have in order to return a result.
     * Default: 500
     */
    charThreshold: z
      .number()
      .optional()
      .meta({
        description:
          'The minimum number of characters an article must have to return a result.',
        examples: [500, 300, 1000],
      }),

    /**
     * Whether to preserve all classes on HTML elements.
     * Default: false
     */
    keepClasses: z
      .boolean()
      .optional()
      .meta({
        description:
          'Whether to preserve all classes on HTML elements. When false, only classesToPreserve are kept.',
        examples: [false, true],
      }),

    /**
     * A set of classes to preserve on HTML elements when keepClasses is false.
     */
    classesToPreserve: z
      .array(z.string())
      .optional()
      .meta({
        description:
          'Classes to preserve on HTML elements when keepClasses is false.',
        examples: [
          ['article', 'content'],
          ['post-body', 'main-content'],
        ],
      }),

    /**
     * When extracting page metadata, cheer-reader gives precedence to Schema.org fields specified in JSON-LD format.
     * Default: false
     */
    disableJSONLD: z
      .boolean()
      .optional()
      .meta({
        description:
          'Whether to skip JSON-LD parsing when extracting page metadata.',
        examples: [false, true],
      }),

    /**
     * A regular expression that matches video URLs that should be allowed in article content.
     * If undefined, the default regex is applied.
     */
    allowedVideoRegex: z.instanceof(RegExp).optional().meta({
      description:
        'Regular expression for video URLs allowed in article content.',
    }),

    /**
     * A number added to the base link density threshold during shadiness checks.
     * Default: 0
     */
    linkDensityModifier: z
      .number()
      .optional()
      .meta({
        description:
          'Number added to base link density threshold during shadiness checks.',
        examples: [0, -0.1, 0.2],
      }),

    /**
     * Whether to perform full content extraction.
     * Default: true
     */
    extraction: z
      .boolean()
      .optional()
      .meta({
        description:
          'Whether to perform full extraction. When false, content/textContent/length/excerpt will be null.',
        examples: [true, false],
      }),

    /**
     * Base URI for resolving relative URLs.
     */
    baseURI: z
      .string()
      .optional()
      .meta({
        description: 'Base URI for resolving relative URLs.',
        examples: ['https://example.com', 'https://blog.example.com/posts/'],
      }),
  })
  .meta({
    title: 'ReaderOptions',
    description:
      'Configuration options for the Readability library. All options are optional.',
    examples: [
      {
        debug: false,
        maxElemsToParse: 0,
        nbTopCandidates: 5,
        charThreshold: 500,
        keepClasses: false,
        extraction: true,
      },
      {
        charThreshold: 300,
        keepClasses: true,
        extraction: false,
        baseURI: 'https://example.com',
      },
    ],
  });

/**
 * Options for HTML cleaning with cheerio-reader.
 * Controls how HTML is sanitized and cleaned.
 */
export type ReaderOptions = z.infer<typeof ReaderOptionsSchema>;

/**
 * Options accepted by Cheerio.
 *
 * Please note that parser-specific options are _only recognized_ if the
 * relevant parser is used.
 */
export const CheerioOptionsSchema = z
  .object({
    /**
     * The base URI for the document. Used to resolve href and src props.
     */
    baseURI: z
      .union([z.string(), z.instanceof(URL)])
      .optional()
      .meta({
        description:
          'The base URI for the document. Used to resolve href and src props.',
        examples: ['https://example.com'],
      }),

    /**
     * Callback for parse errors.
     * Default: null
     */
    onParseError: z
      .union([z.null(), z.any()])
      .optional()
      .meta({
        description: 'Callback for parse errors.',
        examples: [null],
      }),

    /**
     * Extension point for pseudo-classes.
     * Maps from names to either strings or functions.
     */
    pseudos: z
      .record(z.string(), z.union([z.string(), z.any()]))
      .optional()
      .meta({
        description:
          'Extension point for pseudo-classes. Maps from names to either strings or functions.',
        examples: [{ foo: 'div.foo' }],
      }),

    /**
     * Is the document in quirks mode?
     * Default: false
     */
    quirksMode: z
      .boolean()
      .optional()
      .meta({
        description:
          'Is the document in quirks mode? This will lead to .className and #id being case-insensitive.',
        examples: [false],
      }),

    /**
     * The scripting flag. If set to true, noscript element content will be parsed as text.
     * Default: true
     */
    scriptingEnabled: z
      .boolean()
      .optional()
      .meta({
        description:
          'The scripting flag. If set to true, noscript element content will be parsed as text.',
        examples: [true],
      }),

    /**
     * Enables source code location information.
     * Default: false
     */
    sourceCodeLocationInfo: z
      .boolean()
      .optional()
      .meta({
        description:
          'Enables source code location information. When enabled, each node will have a sourceCodeLocation property.',
        examples: [false],
      }),

    /**
     * Specifies the resulting tree format.
     * Default: treeAdapters.default
     */
    treeAdapter: z.any().optional().meta({
      description: 'Specifies the resulting tree format.',
    }),

    /**
     * Recommended way of configuring htmlparser2 when wanting to parse XML.
     * Default: false
     */
    xml: z
      .union([z.boolean(), z.record(z.string(), z.any())])
      .optional()
      .meta({
        description:
          'Recommended way of configuring htmlparser2 when wanting to parse XML.',
        examples: [false, true],
      }),
  })
  .meta({
    title: 'CheerioOptions',
    description:
      'Configuration options for Cheerio. Parser-specific options are only recognized if the relevant parser is used.',
    examples: [
      {
        baseURI: 'https://example.com',
        quirksMode: false,
        scriptingEnabled: true,
      },
      {
        xml: true,
        sourceCodeLocationInfo: true,
        pseudos: { foo: 'div.foo' },
      },
    ],
  });

/**
 * Options for HTML cleaning with cheerio-reader.
 * Controls how HTML is sanitized and cleaned.
 */
export type CheerioOptions = z.infer<typeof CheerioOptionsSchema>;

const {
  cheerioOptions: defaultCheerioOptions,
  readerOptions: defaultReaderOptions,
} = DEFAULT_READER_CLEANING_OPTIONS;
/**
 * Options for HTML cleaning with cheerio-reader.
 * Controls how HTML is sanitized and cleaned.
 */
export const ReaderCleaningOptionsSchema = z
  .object({
    /**
     * Options for HTML cleaning with cheerio-reader.
     * Controls how HTML is sanitized and cleaned.
     */
    cheerioOptions: CheerioOptionsSchema.default(
      defaultCheerioOptions,
    ).optional(),

    /**
     * Options for HTML cleaning with cheerio-reader.
     * Controls how HTML is sanitized and cleaned.
     */
    readerOptions: ReaderOptionsSchema.default(defaultReaderOptions).optional(),
  })
  .default(DEFAULT_READER_CLEANING_OPTIONS)
  .meta({
    description: 'Options for HTML cleaning with cheerio-reader.',
    examples: [DEFAULT_READER_CLEANING_OPTIONS],
  });

/**
 * Options for HTML cleaning with cheerio-reader.
 * Controls how HTML is sanitized and cleaned.
 */
export type ReaderCleaningOptions = z.infer<typeof ReaderCleaningOptionsSchema>;

const { extractMainContent, removeBase64Images } =
  DEFAULT_HTML_REWRITER_OPTIONS;

/**
 * @note used only for 'html-rewriter' cleaning processor
 * Schema for HTML rewriter cleaning configuration options.
 * Defines the validation rules for HTML sanitization parameters.
 */
export const HTMLRewriterOptionsSchema = z
  .object({
    /**
     * @note If allowedHTMLTags is specified, remove everything not in the list
     * */
    allowedHTMLTags: z
      .array(z.string())
      .optional()
      .meta({
        description:
          'If allowedHTMLTags is specified, remove everything not in the list',
        examples: [
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
      }),
    /**
     * @note If disallowedHTMLTags is specified, remove matching tags
     * */
    disallowedHTMLTags: z
      .array(z.string())
      .optional()
      .meta({
        description: 'If disallowedHTMLTags is specified, remove matching tags',
        examples: ['script', 'style', 'iframe', 'form', 'button'],
      }),
    /**
     * @note Whether to extract only the main content area, removing navigation, footers, etc.
     * */
    extractMainContent: smartboolTrue().meta({
      description:
        'Whether to extract only the main content area, removing navigation, footers, etc. Default: true',
      default: extractMainContent,
      examples: [extractMainContent],
    }),
    /**
     * @note Whether to remove base64 encoded images to reduce payload size
     * */
    removeBase64Images: smartboolTrue().meta({
      description:
        'Whether to remove base64 encoded images to reduce payload size. Default: true',
      default: removeBase64Images,
      examples: [removeBase64Images],
    }),
  })
  .default(DEFAULT_HTML_REWRITER_OPTIONS)
  .meta({
    title: 'HTMLRewriterOptions',
    description: 'Schema for HTML rewriter cleaning configuration options',
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
 * const cleaningOptions: HTMLRewriterOptions = {
 *   allowedHTMLTags: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'strong', 'em'],
 *   disallowedHTMLTags: ['script', 'style', 'iframe', 'form', 'button'],
 *   extractMainContent: true,
 *   documentBaseUrl: 'https://example.com',
 *   removeBase64Images: true
 * };
 * ```
 */
export type HTMLRewriterOptions = z.infer<typeof HTMLRewriterOptionsSchema>;

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
  .strict()
  .meta({
    title: 'ElementPattern',
    description: 'Schema for defining patterns to match DOM elements',
    examples: [
      {
        tag: 'div',
        attributes: [{ name: 'data-role', value: 'content' }],
        classNames: ['main-content', /^content-/],
        ids: ['main', 'article-body'],
      },
    ],
  });

/**
 * Schema for HTML cleaning performance metrics.
 * Tracks the size changes during HTML cleaning operations.
 */
export const HTMLCleaningMetricsSchema = z
  .object({
    inputSize: z.number().meta({
      description: 'Original HTML size in bytes before cleaning',
      examples: [125000],
    }),
    outputSize: z.number().meta({
      description: 'Cleaned HTML size in bytes after processing',
      examples: [42000],
    }),
    compressionRatio: z.number().meta({
      description: 'Compression ratio (cleaned size / original size)',
      examples: [0.336],
    }),
  })
  .meta({
    title: 'HTMLCleaningMetrics',
    description: 'Schema for HTML cleaning performance metrics',
    examples: [
      {
        inputSize: 125000,
        outputSize: 42000,
        compressionRatio: 0.336,
      },
    ],
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
      examples: [
        '<h1>Clean Title</h1><p>Clean content without scripts or styles.</p>',
      ],
    }),
    metrics: HTMLCleaningMetricsSchema.optional().meta({
      description: 'Performance metrics for the cleaning operation',
    }),
  })
  .meta({
    title: 'HTMLCleaningResult',
    description: 'Schema for HTML cleaning operation result',
    examples: [
      {
        cleanedHtml: '<div><h1>Article Title</h1><p>Clean content...</p></div>',
        metrics: {
          inputSize: 125000,
          outputSize: 42000,
          compressionRatio: 0.336,
        },
      },
    ],
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
