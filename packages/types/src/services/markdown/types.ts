import { DEFAULT_MARKDOWN_CONVERTER_OPTIONS } from '@deepcrawl/types/configs';
import { z } from 'zod/v4';

const {
  preferNativeParser,
  codeFence,
  bulletMarker,
  codeBlockStyle,
  emDelimiter,
  strongDelimiter,
  strikeDelimiter,
  maxConsecutiveNewlines,
  keepDataImages,
  useInlineLinks,
  useLinkReferenceDefinitions,
} = DEFAULT_MARKDOWN_CONVERTER_OPTIONS;

/**
 * Schema for markdown converter options that control HTML to Markdown conversion.
 * Defines validation rules for configuring how HTML is converted to Markdown format.
 *
 * @property {boolean} [preferNativeParser] - Use native window DOMParser when available
 * @property {string} [codeFence] - Characters used to wrap code blocks
 * @property {string} [bulletMarker] - Character used for unordered list items
 * @property {'indented' | 'fenced'} [codeBlockStyle] - Style for code blocks
 * @property {string} [emDelimiter] - Characters used to wrap emphasized text
 * @property {string} [strongDelimiter] - Characters used to wrap strong text
 * @property {string} [strikeDelimiter] - Characters used to wrap strikethrough text
 * @property {string[]} [ignore] - HTML elements to completely ignore
 * @property {string[]} [blockElements] - HTML elements to treat as block elements
 * @property {number} [maxConsecutiveNewlines] - Maximum consecutive newlines to preserve
 * @property {[RegExp, string]} [lineStartEscape] - Pattern for escaping special characters at line start
 * @property {[RegExp, string]} [globalEscape] - Pattern for escaping special characters globally
 * @property {Array<[RegExp, string]>} [textReplace] - Custom text transformation patterns
 * @property {boolean} [keepDataImages] - Whether to preserve data URI images
 * @property {boolean} [useLinkReferenceDefinitions] - Use reference definitions for links
 * @property {boolean} [useInlineLinks] - Wrap URL text in angle brackets
 *
 * @example
 * ```typescript
 * const options: MarkdownConverterOptions = {
 *   preferNativeParser: false,
 *   codeFence: '```',
 *   bulletMarker: '*',
 *   codeBlockStyle: 'fenced',
 *   maxConsecutiveNewlines: 3,
 *   keepDataImages: false
 * };
 * ```
 */
export const MarkdownConverterOptionsSchema = z
  .object({
    /**
     * Use native window DOMParser when available
     * @default false - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser}
     */
    preferNativeParser: z
      .boolean()
      .optional()
      .default(preferNativeParser)
      .meta({
        title: 'Prefer Native Parser',
        description: `Use native window DOMParser when available instead of fallback parser (default: ${preferNativeParser})`,
        examples: [false, true],
        default: preferNativeParser,
      }),
    /**
     * Code block fence
     * @default {codeFence} - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.codeFence}
     */
    codeFence: z
      .string()
      .optional()
      .default(codeFence)
      .meta({
        title: 'Code Fence',
        description: `Characters used to wrap code blocks (default: "${codeFence}")`,
        examples: ['```', '~~~'],
        default: codeFence,
      }),
    /**
     * Bullet marker
     * @default {bulletMarker} - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.bulletMarker}
     */
    bulletMarker: z
      .string()
      .optional()
      .default(bulletMarker)
      .meta({
        title: 'Bullet Marker',
        description: 'Character used for unordered list items',
        examples: ['*', '-', '+'],
        default: bulletMarker,
      }),
    /**
     * Style for code block
     * @default fence - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.codeBlockStyle}
     */
    codeBlockStyle: z
      .enum(['indented', 'fenced'])
      .optional()
      .default(codeBlockStyle)
      .meta({
        title: 'Code Block Style',
        description:
          'How to format code blocks - either indented (4 spaces) or fenced (with code fence characters)',
        examples: ['fenced', 'indented'],
        default: codeBlockStyle,
      }),
    /**
     * Emphasis delimiter
     * @default _ - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.emDelimiter}
     */
    emDelimiter: z
      .string()
      .optional()
      .default(emDelimiter)
      .meta({
        title: 'Emphasis Delimiter',
        description: `Characters used to wrap emphasized (italic) text (default: ${emDelimiter})`,
        examples: ['_', '*'],
        default: emDelimiter,
      }),
    /**
     * Strong delimiter
     * @default ** - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.strongDelimiter}
     */
    strongDelimiter: z
      .string()
      .optional()
      .default(strongDelimiter)
      .meta({
        title: 'Strong Delimiter',
        description: `Characters used to wrap strong (bold) text (default: ${strongDelimiter})`,
        examples: ['**', '__'],
        default: strongDelimiter,
      }),
    /**
     * Strong delimiter
     * @default ~~ - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.strikeDelimiter}
     */
    strikeDelimiter: z
      .string()
      .optional()
      .default(strikeDelimiter)
      .meta({
        title: 'Strike Delimiter',
        description: `Characters used to wrap strikethrough text (default: ${strikeDelimiter})`,
        examples: ['~~'],
        default: strikeDelimiter,
      }),
    /**
     * Supplied elements will be ignored (ignores inner text does not parse children)
     */
    ignore: z
      .array(z.string())
      .optional()
      .meta({
        title: 'Ignore Elements',
        description:
          'HTML elements to completely ignore (including their content) during conversion',
        examples: [
          ['script', 'style'],
          ['nav', 'footer'],
        ],
        default: [],
      }),
    /**
     * Supplied elements will be treated as blocks (surrounded with blank lines)
     */
    blockElements: z
      .array(z.string())
      .optional()
      .meta({
        title: 'Block Elements',
        description:
          'HTML elements to treat as block elements (surrounded with blank lines)',
        examples: [
          ['div', 'section'],
          ['article', 'aside'],
        ],
        default: [],
      }),
    /**
     * Max consecutive new lines allowed
     * @default 3 - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.maxConsecutiveNewlines}
     */
    maxConsecutiveNewlines: z
      .int()
      .positive()
      .optional()
      .default(maxConsecutiveNewlines)
      .meta({
        title: 'Max Consecutive Newlines',
        description:
          'Maximum number of consecutive newlines to preserve in output',
        examples: [3, 2, 1],
        default: maxConsecutiveNewlines,
      }),
    /**
     * Line Start Escape pattern
     * (Note: Setting this will override the default escape settings, you might want to use textReplace option instead)
     */
    lineStartEscape: z
      .tuple([z.instanceof(RegExp), z.string()])
      .optional()
      .meta({
        title: 'Line Start Escape',
        description:
          'Pattern and replacement for escaping special characters at line start',
        examples: [[/^(\d+\.)/, '\\$1']],
        default: [],
      }),
    /**
     * Global escape pattern
     * (Note: Setting this will override the default escape settings, you might want to use textReplace option instead)
     */
    globalEscape: z
      .tuple([z.instanceof(RegExp), z.string()])
      .optional()
      .meta({
        title: 'Global Escape',
        description:
          'Pattern and replacement for escaping special characters globally',
        examples: [[/([*_`])/g, '\\$1']],
        default: [],
      }),
    /**
     * User-defined text replacement pattern (Replaces matching text retrieved from nodes)
     */
    textReplace: z
      .array(z.tuple([z.instanceof(RegExp), z.string()]))
      .optional()
      .meta({
        title: 'Text Replace',
        description:
          'Array of pattern-replacement pairs for custom text transformations',
        examples: [
          [[/\s+/g, ' ']],
          [
            [/&nbsp;/g, ' '],
            [/&amp;/g, '&'],
          ],
        ],
        default: [],
      }),
    /**
     * Keep images with data: URI (Note: These can be up to 1MB each)
     * @example
     * <img src="data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSK......0o/">
     * @default false - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.keepDataImages}
     */
    keepDataImages: z
      .boolean()
      .optional()
      .default(keepDataImages)
      .meta({
        title: 'Keep Data Images',
        description: `Whether to preserve images with data: URIs (can be up to 1MB each) (default: ${keepDataImages})`,
        examples: [false, true],
        default: keepDataImages,
      }),
    /**
     * Place URLS at the bottom and format links using link reference definitions
     *
     * @example
     * Click <a href="/url1">here</a>. Or <a href="/url2">here</a>. Or <a href="/url1">this link</a>.
     *
     * Becomes:
     * Click [here][1]. Or [here][2]. Or [this link][1].
     *
     * [1]: /url
     * [2]: /url2
     */
    useLinkReferenceDefinitions: z
      .boolean()
      .optional()
      .meta({
        title: 'Use Link Reference Definitions',
        description: `Format links using reference definitions at bottom instead of inline (default: ${useLinkReferenceDefinitions})`,
        examples: [false, true],
        default: useLinkReferenceDefinitions,
      }),
    /**
     * Wrap URL text in < > instead of []() syntax.
     *
     * @example
     * The input <a href="https://google.com">https://google.com</a>
     * becomes <https://google.com>
     * instead of [https://google.com](https://google.com)
     *
     * @default true - @see {@link DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useInlineLinks}
     */
    useInlineLinks: z
      .boolean()
      .optional()
      .default(useInlineLinks)
      .meta({
        title: 'Use Inline Links',
        description: `Wrap URL text in <> instead of []() syntax when text matches URL (default: ${useInlineLinks})`,
        examples: [true, false],
        default: useInlineLinks,
      }),
  })
  .default(DEFAULT_MARKDOWN_CONVERTER_OPTIONS)
  .meta({
    title: 'MarkdownConverterOptions',
    description: 'Options for markdown conversion.',
    default: DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
    examples: [DEFAULT_MARKDOWN_CONVERTER_OPTIONS],
  });

/**
 * Type representing options for controlling HTML to Markdown conversion.
 * Configuration for how HTML elements are converted to their Markdown equivalents.
 *
 * @property {boolean} [preferNativeParser] - Use native window DOMParser when available
 * @property {string} [codeFence] - Characters used to wrap code blocks
 * @property {string} [bulletMarker] - Character used for unordered list items
 * @property {'indented' | 'fenced'} [codeBlockStyle] - Style for code blocks
 * @property {string} [emDelimiter] - Characters used to wrap emphasized text
 * @property {string} [strongDelimiter] - Characters used to wrap strong text
 * @property {string} [strikeDelimiter] - Characters used to wrap strikethrough text
 * @property {string[]} [ignore] - HTML elements to completely ignore
 * @property {string[]} [blockElements] - HTML elements to treat as block elements
 * @property {number} [maxConsecutiveNewlines] - Maximum consecutive newlines to preserve
 * @property {[RegExp, string]} [lineStartEscape] - Pattern for escaping special characters at line start
 * @property {[RegExp, string]} [globalEscape] - Pattern for escaping special characters globally
 * @property {Array<[RegExp, string]>} [textReplace] - Custom text transformation patterns
 * @property {boolean} [keepDataImages] - Whether to preserve data URI images
 * @property {boolean} [useLinkReferenceDefinitions] - Use reference definitions for links
 * @property {boolean} [useInlineLinks] - Wrap URL text in angle brackets
 *
 * @example
 * ```typescript
 * const options: MarkdownConverterOptions = {
 *   preferNativeParser: false,
 *   codeFence: '```',
 *   bulletMarker: '*',
 *   codeBlockStyle: 'fenced',
 *   maxConsecutiveNewlines: 3,
 *   keepDataImages: false
 * };
 * ```
 */
export type MarkdownConverterOptions = z.infer<
  typeof MarkdownConverterOptionsSchema
>;

/**
 * @description This is the input type for the `MarkdownConverterOptions` schema.
 * This is a standalone export type that can be used as input which contains both string and boolean for smartbool.
 */
export type MarkdownConverterOptionsInput = z.input<
  typeof MarkdownConverterOptionsSchema
>;
