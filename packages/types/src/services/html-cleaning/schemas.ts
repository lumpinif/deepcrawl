import { z } from 'zod/v4';
import { OptionalBoolWithDefault } from '../../common/utils';
import {
  DEFAULT_HTML_REWRITER_OPTIONS,
  DEFAULT_READER_CLEANING_OPTIONS,
} from '../../configs';

/**
 * Configuration schema for HTML cleaning with the cheerio-reader processor.
 * Only applied when the cleaning processor is set to 'cheerio-reader'.
 * Controls how HTML is sanitized and cleaned using the Readability library.
 *
 * @property {boolean} [debug] - Whether to enable logging
 * @property {number} [maxElemsToParse] - Maximum number of elements to parse (0 = no limit)
 * @property {number} [nbTopCandidates] - Number of top candidates to consider when analyzing competition among candidates
 * @property {number} [charThreshold] - Minimum number of characters an article must have to return a result
 * @property {boolean} [keepClasses] - Whether to preserve all classes on HTML elements
 * @property {string[]} [classesToPreserve] - Classes to preserve when keepClasses is false
 * @property {boolean} [disableJSONLD] - Whether to skip JSON-LD parsing when extracting page metadata
 * @property {RegExp} [allowedVideoRegex] - Regular expression for video URLs allowed in article content
 * @property {number} [linkDensityModifier] - Number added to base link density threshold during shadiness checks
 * @property {boolean} [extraction] - Whether to perform full extraction
 * @property {string} [baseURI] - Base URI for resolving relative URLs
 *
 * @example
 * ```typescript
 * const options: ReaderOptions = {
 *   debug: false,
 *   maxElemsToParse: 0,
 *   nbTopCandidates: 5,
 *   charThreshold: 500,
 *   keepClasses: false,
 *   extraction: true
 * };
 * ```
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
 * Configuration schema for Cheerio parser options.
 * Parser-specific options are only recognized if the relevant parser is used.
 *
 * @property {string | URL} [baseURI] - Base URI for resolving href and src properties
 * @property {function | null} [onParseError] - Callback for handling parse errors
 * @property {Record<string, string | function>} [pseudos] - Extension point for pseudo-classes
 * @property {boolean} [quirksMode] - Whether document is in quirks mode (affects case sensitivity)
 * @property {boolean} [scriptingEnabled] - Whether to parse noscript element content as text
 * @property {boolean} [sourceCodeLocationInfo] - Whether to enable source code location information
 * @property {any} [treeAdapter] - Specifies the resulting tree format
 * @property {boolean | Record<string, any>} [xml] - XML parsing configuration
 *
 * @example
 * ```typescript
 * const options: CheerioOptions = {
 *   baseURI: 'https://example.com',
 *   quirksMode: false,
 *   scriptingEnabled: true
 * };
 * ```
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

const {
  cheerioOptions: defaultCheerioOptions,
  readerOptions: defaultReaderOptions,
} = DEFAULT_READER_CLEANING_OPTIONS;
/**
 * Configuration schema combining Cheerio and Readability options for HTML cleaning.
 * Provides comprehensive control over HTML sanitization and cleaning using the cheerio-reader processor.
 *
 * @property {CheerioOptions} [cheerioOptions] - Cheerio parser configuration options
 * @property {ReaderOptions} [readerOptions] - Readability library configuration options
 *
 * @example
 * ```typescript
 * const options: ReaderCleaningOptions = {
 *   cheerioOptions: {
 *     baseURI: 'https://example.com',
 *     quirksMode: false,
 *     scriptingEnabled: true
 *   },
 *   readerOptions: {
 *     debug: false,
 *     charThreshold: 500,
 *     extraction: true
 *   }
 * };
 * ```
 */
export const ReaderCleaningOptionsSchema = z
  .object({
    cheerioOptions: CheerioOptionsSchema.default(
      defaultCheerioOptions,
    ).optional(),
    readerOptions: ReaderOptionsSchema.default(defaultReaderOptions).optional(),
  })
  .default(DEFAULT_READER_CLEANING_OPTIONS)
  .meta({
    description: 'Options for HTML cleaning with cheerio-reader.',
    examples: [DEFAULT_READER_CLEANING_OPTIONS],
  });

const { extractMainContent, removeBase64Images } =
  DEFAULT_HTML_REWRITER_OPTIONS;

/**
 * Configuration schema for HTML rewriter cleaning options.
 * Used only with the 'html-rewriter' cleaning processor.
 * Defines validation rules for HTML sanitization parameters.
 *
 * @property {string[]} [allowedHTMLTags] - HTML tags to preserve (whitelist approach)
 * @property {string[]} [disallowedHTMLTags] - HTML tags to remove (blacklist approach)
 * @property {boolean} [extractMainContent] - Whether to extract only the main content area
 * @property {boolean} [removeBase64Images] - Whether to remove base64 encoded images
 *
 * @example
 * ```typescript
 * const options: HTMLRewriterOptions = {
 *   allowedHTMLTags: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'strong', 'em'],
 *   disallowedHTMLTags: ['script', 'style', 'iframe', 'form', 'button'],
 *   extractMainContent: true,
 *   removeBase64Images: true
 * };
 * ```
 */
export const HTMLRewriterOptionsSchema = z
  .object({
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
    disallowedHTMLTags: z
      .array(z.string())
      .optional()
      .meta({
        description: 'If disallowedHTMLTags is specified, remove matching tags',
        examples: ['script', 'style', 'iframe', 'form', 'button'],
      }),
    extractMainContent: OptionalBoolWithDefault(extractMainContent).meta({
      description:
        'Whether to extract only the main content area, removing navigation, footers, etc. Default: true',
      default: extractMainContent,
      examples: [extractMainContent],
    }),
    removeBase64Images: OptionalBoolWithDefault(removeBase64Images).meta({
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
 * Schema for defining patterns to match DOM elements during HTML processing.
 * Used to create selectors for targeting specific elements.
 *
 * @property {string | RegExp} [tag] - HTML tag name or pattern to match
 * @property {Array<{name: string | RegExp, value?: string | RegExp}>} [attributes] - Element attributes to match
 * @property {Array<string | RegExp>} [classNames] - CSS class names or patterns to match
 * @property {Array<string | RegExp>} [ids] - Element IDs or patterns to match
 *
 * @example
 * ```typescript
 * const pattern: ElementPattern = {
 *   tag: 'div',
 *   attributes: [{ name: 'data-role', value: 'content' }],
 *   classNames: ['main-content', /^content-/],
 *   ids: ['main', 'article-body']
 * };
 * ```
 */
export const ElementPatternSchema = z
  .strictObject({
    tag: z.union([z.string(), z.instanceof(RegExp)]).optional(),
    attributes: z
      .array(
        z.strictObject({
          name: z.union([z.string(), z.instanceof(RegExp)]),
          value: z.union([z.string(), z.instanceof(RegExp)]).optional(),
        }),
      )
      .optional(),
    classNames: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
    ids: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  })
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
 *
 * @property {number} inputSize - Original HTML size in bytes before cleaning
 * @property {number} outputSize - Cleaned HTML size in bytes after processing
 * @property {number} compressionRatio - Compression ratio (output/input size)
 *
 * @example
 * ```typescript
 * const metrics: HTMLCleaningMetrics = {
 *   inputSize: 125000,
 *   outputSize: 42000,
 *   compressionRatio: 0.336
 * };
 * ```
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
 * Schema for HTML cleaning operation result.
 * Contains the cleaned HTML content along with metadata about the cleaning process.
 *
 * @property {string} cleanedHtml - The cleaned and sanitized HTML content
 * @property {HTMLCleaningMetrics} [metrics] - Optional performance metrics for the cleaning operation
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
