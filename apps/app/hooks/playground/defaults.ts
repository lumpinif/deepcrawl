/**
 * @file Default options for playground hooks
 *
 * Provides URL-less default configurations for each operation type.
 * These defaults match the service configurations but omit URL properties
 * since URLs are handled separately in the main hook state.
 */

import {
  DEFAULT_GET_MARKDOWN_OPTIONS,
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_READ_OPTIONS,
} from '@deepcrawl/types/configs';
import type {
  ExtractLinksOptionsWithoutUrl,
  GetMarkdownOptionsWithoutUrl,
  ReadUrlOptionsWithoutUrl,
} from './types';

/**
 * Hook-specific default options for readUrl operation.
 * Cast to SDK types to align with Zod schema expectations.
 */
export const DEFAULT_READ_OPTIONS_FOR_HOOK: ReadUrlOptionsWithoutUrl =
  DEFAULT_READ_OPTIONS satisfies ReadUrlOptionsWithoutUrl;

/**
 * Hook-specific default options for extractLinks operation.
 * Cast to SDK types to align with Zod schema expectations.
 */
export const DEFAULT_EXTRACT_LINKS_OPTIONS_FOR_HOOK: ExtractLinksOptionsWithoutUrl =
  DEFAULT_LINKS_OPTIONS satisfies ExtractLinksOptionsWithoutUrl;

/**
 * Hook-specific default options for getMarkdown operation.
 * Cast to SDK types to align with Zod schema expectations.
 */
export const DEFAULT_GET_MARKDOWN_OPTIONS_FOR_HOOK: GetMarkdownOptionsWithoutUrl =
  DEFAULT_GET_MARKDOWN_OPTIONS satisfies GetMarkdownOptionsWithoutUrl;
