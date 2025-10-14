/**
 * @file GetMarkdown operation options hook
 *
 * Provides type-safe state management for getMarkdown operation options.
 * Handles URL synchronization and local state preservation.
 */

import { GetMarkdownOptionsSchema } from 'deepcrawl/schemas';
import { DEFAULT_GET_MARKDOWN_OPTIONS_FOR_HOOK } from './defaults';
import type { GetMarkdownOptionsWithoutUrl } from './types';
import { useOperationOptions } from './use-operation-options';

interface UseGetMarkdownOptionsProps {
  /**
   * Whether getMarkdown operation is currently active.
   */
  active: boolean;

  /**
   * Optional initial values to override defaults.
   */
  initialValues?: Partial<GetMarkdownOptionsWithoutUrl>;
}

/**
 * Hook for managing getMarkdown operation options.
 *
 * Features:
 * - Type-safe getMarkdown options management
 * - URL synchronization when operation is active
 * - Local state preservation when inactive
 * - Smart default handling with single source of truth
 * - Deep equality checks for nested objects like markdownConverterOptions
 *
 * @param props - Configuration for getMarkdown options
 * @returns Operation state for getMarkdown options
 *
 * @example
 * ```tsx
 * const getMarkdownState = useGetMarkdownOptions({
 *   active: selectedOperation === 'getMarkdown'
 * });
 *
 * // Type-safe access to options
 * const cacheEnabled = getMarkdownState.options.cacheOptions?.enabled ?? false;
 * const codeFence = getMarkdownState.options.markdownConverterOptions?.codeFence ?? '```';
 *
 * // Type-safe updates
 * getMarkdownState.setOptions({
 *   cacheOptions: { enabled: false, expirationTtl: 7200 },
 *   markdownConverterOptions: { codeFence: '~~~', bulletMarker: '-' }
 * });
 * ```
 */
export function useGetMarkdownOptions({
  active,
  initialValues,
}: UseGetMarkdownOptionsProps) {
  // Use the GetMarkdownOptionsSchema which already excludes url for GET endpoint
  const schemaForHook = GetMarkdownOptionsSchema.omit({ url: true });

  return useOperationOptions({
    active,
    defaultOptions: DEFAULT_GET_MARKDOWN_OPTIONS_FOR_HOOK,
    urlKey: 'go',
    schema: schemaForHook,
    initialValues,
  });
}
