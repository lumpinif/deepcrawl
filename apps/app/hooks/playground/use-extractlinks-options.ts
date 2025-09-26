/**
 * @file ExtractLinks operation options hook
 *
 * Provides type-safe state management for extractLinks operation options.
 * Handles URL synchronization and local state preservation.
 */

import { LinksOptionsSchema } from '@deepcrawl/types';
import { DEFAULT_EXTRACT_LINKS_OPTIONS_FOR_HOOK } from './defaults';
import type { ExtractLinksOptionsWithoutUrl } from './types';
import { useOperationOptions } from './use-operation-options';

interface UseExtractLinksOptionsProps {
  /**
   * Whether extractLinks operation is currently active.
   */
  active: boolean;

  /**
   * Optional initial values to override defaults.
   */
  initialValues?: Partial<ExtractLinksOptionsWithoutUrl>;
}

/**
 * Hook for managing extractLinks operation options.
 *
 * Features:
 * - Type-safe extractLinks options management
 * - URL synchronization when operation is active
 * - Local state preservation when inactive
 * - Smart default handling with single source of truth
 * - Deep equality checks for nested objects like linkExtractionOptions, treeOptions
 *
 * @param props - Configuration for extractLinks options
 * @returns Operation state for extractLinks options
 *
 * @example
 * ```tsx
 * const extractLinksState = useExtractLinksOptions({
 *   active: selectedOperation === 'extractLinks'
 * });
 *
 * // Type-safe access to options
 * const treeEnabled = extractLinksState.getOption('tree', true);
 * const folderFirst = extractLinksState.getOption('treeOptions')?.folderFirst;
 *
 * // Type-safe updates
 * extractLinksState.setOptions({
 *   tree: false,
 *   linkExtractionOptions: { includeExternal: true },
 *   treeOptions: { folderFirst: false, linksOrder: 'alphabetical' }
 * });
 * ```
 */
export function useExtractLinksOptions({
  active,
  initialValues,
}: UseExtractLinksOptionsProps) {
  // Create URL-less schema by omitting url property
  const schemaForHook = LinksOptionsSchema.omit({ url: true });

  return useOperationOptions({
    active,
    defaultOptions: DEFAULT_EXTRACT_LINKS_OPTIONS_FOR_HOOK,
    urlKey: 'extractLinksOptions',
    schema: schemaForHook,
    initialValues,
  });
}
