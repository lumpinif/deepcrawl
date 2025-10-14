import type { z } from 'zod/v4';
import type { MarkdownConverterOptionsSchema } from '../markdown/schemas';

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
