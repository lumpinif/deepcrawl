/**
 * @file ReadUrl operation options hook
 *
 * Provides type-safe state management for readUrl operation options.
 * Handles URL synchronization and local state preservation.
 */

import { ReadOptionsSchema } from '@deepcrawl/types';
import { DEFAULT_READ_OPTIONS_FOR_HOOK } from './defaults';
import type { ReadUrlOptionsWithoutUrl } from './types';
import { useOperationOptions } from './use-operation-options';

interface UseReadUrlOptionsProps {
  /**
   * Whether readUrl operation is currently active.
   */
  active: boolean;

  /**
   * Optional initial values to override defaults.
   */
  initialValues?: Partial<ReadUrlOptionsWithoutUrl>;
}

/**
 * Hook for managing readUrl operation options.
 *
 * Features:
 * - Type-safe readUrl options management
 * - URL synchronization when operation is active
 * - Local state preservation when inactive
 * - Smart default handling with single source of truth
 * - Deep equality checks for nested objects like cacheOptions, markdownConverterOptions
 *
 * @param props - Configuration for readUrl options
 * @returns Operation state for readUrl options
 *
 * @example
 * ```tsx
 * const readUrlState = useReadUrlOptions({
 *   active: selectedOperation === 'readUrl'
 * });
 *
 * // Type-safe access to options
 * const markdownEnabled = readUrlState.options.markdown ?? true;
 * const cacheEnabled = readUrlState.options.cacheOptions?.enabled ?? false;
 *
 * // Type-safe updates
 * readUrlState.setOptions({
 *   markdown: true,
 *   rawHtml: false,
 *   cacheOptions: { enabled: true, expirationTtl: 3600 },
 *   markdownConverterOptions: { codeFence: '```', bulletMarker: '*' }
 * });
 * ```
 */
export function useReadUrlOptions({
  active,
  initialValues,
}: UseReadUrlOptionsProps) {
  // Create URL-less schema by omitting url property
  const schemaForHook = ReadOptionsSchema.omit({ url: true });

  return useOperationOptions<ReadUrlOptionsWithoutUrl>({
    active,
    defaultOptions: DEFAULT_READ_OPTIONS_FOR_HOOK,
    urlKey: 'ro',
    schema: schemaForHook,
    initialValues,
  });
}
