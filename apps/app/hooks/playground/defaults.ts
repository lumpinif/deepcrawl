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
  DeepcrawlOperations,
  ExtractLinksOptionsWithoutUrl,
  GetMarkdownOptionsWithoutUrl,
  OperationOptions,
  ReadUrlOptionsWithoutUrl,
} from './types';

/* NOTE: FOR_HOOK GENERALLY MEANS OPTIONS WITHOUT URL */

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

export const DEFAULT_OPERATION_OPTIONS: Record<
  DeepcrawlOperations,
  OperationOptions
> = {
  readUrl: DEFAULT_READ_OPTIONS_FOR_HOOK,
  getMarkdown: DEFAULT_GET_MARKDOWN_OPTIONS_FOR_HOOK,
  extractLinks: DEFAULT_EXTRACT_LINKS_OPTIONS_FOR_HOOK,
};

export const RESULT_IDENTIFIER: Record<DeepcrawlOperations, string> = {
  readUrl: 'result',
  getMarkdown: 'markdown',
  extractLinks: 'links',
};
