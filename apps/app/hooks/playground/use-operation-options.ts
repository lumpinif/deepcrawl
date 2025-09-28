/**
 * @file Generic hook for managing operation-specific options
 *
 * Provides type-safe state management for operation options with URL preservation,
 * smart default handling, and automatic URL parameter management.
 */

import { deepmerge } from 'deepmerge-ts';
import { parseAsJson, useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { z } from 'zod/v4';
import { isEqual } from '@/utils/playground/deep-equal';
import type { OperationOptionsUpdate, OperationQueryState } from './types';

function hasEntries(
  value: Record<string, unknown> | null | undefined,
): boolean {
  return !!value && Object.keys(value).length > 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function computeChangedValues<T extends Record<string, unknown>>(
  fullOptions: T,
  baseline: T,
): Partial<T> {
  const changed: Partial<T> = {};

  for (const key in fullOptions) {
    const value = fullOptions[key];
    const base = baseline[key];

    if (isEqual(value, base)) {
      continue;
    }

    if (isPlainObject(value) && isPlainObject(base)) {
      const nestedDiff = computeChangedValues(
        value as Record<string, unknown>,
        base as Record<string, unknown>,
      );

      if (Object.keys(nestedDiff).length > 0) {
        changed[key] = nestedDiff as T[typeof key];
      }

      continue;
    }

    changed[key] = value;
  }

  return changed;
}

interface UseOperationOptionsProps<T> {
  /**
   * Whether this operation is currently active.
   * Only active operations sync state to URL parameters.
   */
  active: boolean;

  /**
   * Default options for this operation.
   * Used for initialization and reset functionality.
   */
  defaultOptions: T;

  /**
   * URL key for storing options in search parameters.
   * Should be unique per operation.
   */
  urlKey: string;

  /**
   * Zod schema for validation and parsing.
   * Used to ensure type safety of URL serialization.
   */
  schema: z.ZodType<T>;

  /**
   * Optional initial values to override defaults.
   * Useful for component-level customization.
   */
  initialValues?: Partial<T>;
}

const ENABLE_QUERY_STATE = true;

/**
 * Generic hook for managing operation-specific options with URL synchronization.
 *
 * Features:
 * - URL sync only when operation is active
 * - Local state preservation when inactive
 * - Smart default handling with clearOnDefault
 * - Deep equality checks for nested objects
 * - Type-safe option getters
 * - Atomic state updates with React 18 concurrent rendering
 * - Non-blocking state transitions

 * **Optimized for Client-Side Playground Usage**:
 * - Uses `shallow: true` for fast client-side navigation
 * - No server round-trips, optimal for interactive playground components
 *
 * @template T - Type of options object
 * @param props - Configuration for the hook
 * @returns Operation state interface
 */
export function useOperationOptions<T extends Record<string, unknown>>({
  active,
  defaultOptions,
  urlKey,
  schema,
  initialValues,
}: UseOperationOptionsProps<T>): OperationQueryState<T> {
  // Initialize with defaults + initial values
  const initDefaults = useMemo<T>(
    () => deepmerge(defaultOptions, initialValues ?? {}) as T,
    [defaultOptions, initialValues],
  );

  const parser = useMemo(
    () =>
      parseAsJson(schema) // schema: ZodType<T>
        .withDefault({} as T) // Empty object as default - only store changed values for query state
        .withOptions({ clearOnDefault: true, shallow: true, history: 'push' }),
    [schema],
  );

  // Query state with NUQS (represents diff from defaults)
  const [queryOptions, setQueryOptions] = useQueryState(urlKey, parser);

  // Local state keeps full options for persistence across operation switches
  const [localOptions, setLocalOptions] = useState<T>(() => initDefaults);

  // Skip flag to avoid clearing local state when we intentionally emptied the query
  const skipNextQuerySyncRef = useRef(false);

  const extractChangedValues = useCallback(
    (fullOptions: T): Partial<T> =>
      computeChangedValues(fullOptions, initDefaults),
    [initDefaults],
  );

  // Keep local options aligned when defaults change (e.g., new initial values)
  useEffect(() => {
    setLocalOptions((prev) =>
      isEqual(prev, initDefaults) ? prev : initDefaults,
    );
  }, [initDefaults]);

  // Current options: merge defaults with query/local values
  const currentOptions = useMemo(() => {
    if (active && ENABLE_QUERY_STATE && hasEntries(queryOptions)) {
      return deepmerge(localOptions, queryOptions) as T;
    }
    return localOptions;
  }, [active, localOptions, queryOptions]);

  // Helper function to extract only changed values (non-defaults)
  // Reset to defaults function
  const resetToDefaults = useCallback(() => {
    setLocalOptions((prev) =>
      isEqual(prev, initDefaults) ? prev : initDefaults,
    );

    if (active && ENABLE_QUERY_STATE) {
      setQueryOptions({} as T);
    }
  }, [active, initDefaults, setQueryOptions]);

  // Atomic state setter with proper batching and transitions
  const setOptions = useCallback(
    (update: OperationOptionsUpdate<T>) => {
      // whole new object with defaults
      const newValue =
        typeof update === 'function'
          ? update(currentOptions)
          : (deepmerge(currentOptions, update) as T);

      if (isEqual(newValue, currentOptions)) {
        return;
      }

      if (isEqual(newValue, initDefaults)) {
        resetToDefaults();
        return;
      }

      const changedValues = extractChangedValues(newValue);

      setLocalOptions((prev) => (isEqual(prev, newValue) ? prev : newValue));

      if (active && ENABLE_QUERY_STATE) {
        if (hasEntries(changedValues as Record<string, unknown>)) {
          setQueryOptions(changedValues as T);
        } else {
          setQueryOptions({} as T);
        }
      }
    },
    [
      active,
      currentOptions,
      initDefaults,
      extractChangedValues,
      resetToDefaults,
      setQueryOptions,
    ],
  );

  // Handle activation/deactivation side-effects for URL parameters
  useEffect(() => {
    if (!ENABLE_QUERY_STATE) {
      return;
    }

    if (active) {
      if (!hasEntries(queryOptions)) {
        const diff = computeChangedValues(localOptions, initDefaults);
        if (hasEntries(diff as Record<string, unknown>)) {
          setQueryOptions(diff as T);
        }
      }
      return;
    }

    if (hasEntries(queryOptions)) {
      skipNextQuerySyncRef.current = true;
      setQueryOptions({} as T);
    }
  }, [active, initDefaults, localOptions, queryOptions, setQueryOptions]);

  // Keep local state in sync with URL-driven changes (manual query edits)
  useEffect(() => {
    if (!(active && ENABLE_QUERY_STATE)) {
      return;
    }

    if (skipNextQuerySyncRef.current) {
      skipNextQuerySyncRef.current = false;
      return;
    }

    if (!hasEntries(queryOptions)) {
      setLocalOptions((prev) =>
        isEqual(prev, initDefaults) ? prev : initDefaults,
      );
      return;
    }

    const nextOptions = deepmerge(initDefaults, queryOptions) as T;

    setLocalOptions((prev) =>
      isEqual(prev, nextOptions) ? prev : nextOptions,
    );
  }, [active, initDefaults, queryOptions]);

  return {
    options: currentOptions,
    defaults: initDefaults,
    setOptions,
    resetToDefaults,
  };
}
