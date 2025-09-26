/**
 * @file Generic hook for managing operation-specific options
 *
 * Provides type-safe state management for operation options with URL preservation,
 * smart default handling, and automatic URL parameter management.
 */

import { parseAsJson, useQueryState } from 'nuqs';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import type { z } from 'zod/v4';
import { isEqual } from '@/utils/playground/deep-equal';
import type { OperationOptionsUpdate, OperationQueryState } from './types';

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
 *
 * ## React 18 `startTransition` Benefits:
 *
 * **Atomic State Updates**: All state changes (local + URL) are wrapped in transitions
 * - Prevents blocking urgent UI updates (typing, clicking)
 * - Multiple simultaneous state updates don't freeze the interface
 * - Complex JSON serialization to URL doesn't block user interactions
 * - `isTransitioning` indicates when complex updates are in progress
 *
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
  // React 18 concurrent features for atomic state updates
  const [isTransitioning, startTransition] = useTransition();
  // Initialize with defaults + initial values
  const initDefaults = useMemo<T>(
    () => ({ ...defaultOptions, ...initialValues }) as T,
    [defaultOptions, initialValues],
  );

  const parser = useMemo(
    () =>
      parseAsJson(schema) // schema: ZodType<T>
        .withDefault(initDefaults)
        .withOptions({ clearOnDefault: true, shallow: true, history: 'push' }),
    [schema, initDefaults],
  );

  // URL state with client-side optimizations
  const [queryOptions, setQueryOptions] = useQueryState(urlKey, parser);

  // Local preservation state - maintains values when operation is inactive
  const [_localOptions, _setLocalOptions] = useState<T>(initDefaults);

  // Track last known URL state for sync detection
  const lastUrlStateRef = useRef<T>(queryOptions as T);

  // Current options: URL when active, local when inactive
  const currentOptions = active ? (queryOptions as T) : _localOptions;

  // Type-safe option getter with fallback support
  const getOption = useCallback(
    <K extends keyof T>(key: K, fallback?: T[K]): T[K] => {
      return currentOptions[key] ?? fallback ?? defaultOptions[key];
    },
    [currentOptions, defaultOptions],
  );

  // Atomic state setter with proper batching and transitions
  const setOptions = useCallback(
    (update: OperationOptionsUpdate<T>) => {
      const newValue =
        typeof update === 'function'
          ? update(currentOptions)
          : { ...currentOptions, ...update };

      // Validation: ensure new value is different
      if (isEqual(newValue, currentOptions)) {
        return;
      }

      // Use startTransition for non-urgent state updates to prevent blocking UI
      // This is especially beneficial for playground where:
      // - Complex nested options objects need JSON serialization to URL
      // - Users are actively typing/interacting while options change
      // - Multiple state updates happen simultaneously (local + URL sync)
      startTransition(() => {
        if (active) {
          // Update URL state when active
          setQueryOptions(newValue);
          // Also keep local state in sync for potential future switches
          _setLocalOptions(newValue);
        } else {
          // Update local state when inactive
          _setLocalOptions(newValue);
        }
      });
    },
    [active, currentOptions, setQueryOptions, startTransition],
  );

  // Reset to defaults function
  const resetToDefaults = useCallback(() => {
    setOptions(initDefaults);
  }, [setOptions, initDefaults]);

  // Sync local→URL when becoming active (only if values differ)
  useEffect(() => {
    if (active && !isEqual(_localOptions, queryOptions)) {
      // Use transition for non-urgent URL sync when becoming active
      startTransition(() => {
        setQueryOptions(_localOptions);
      });
    }
  }, [active, _localOptions, queryOptions, setQueryOptions, startTransition]);

  // Update local state when URL state changes while active
  useEffect(() => {
    if (active && !isEqual(queryOptions, lastUrlStateRef.current)) {
      // Use transition for non-urgent local state sync
      startTransition(() => {
        _setLocalOptions(queryOptions as T);
        lastUrlStateRef.current = queryOptions as T;
      });
    }
  }, [active, queryOptions, startTransition]);

  // Development validation
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Validate schema compatibility
      try {
        schema.parse(currentOptions);
      } catch (error) {
        console.warn(
          `[useOperationOptions:${urlKey}] Schema validation failed:`,
          error,
        );
      }

      // Validate defaults are present
      if (!defaultOptions || typeof defaultOptions !== 'object') {
        console.warn(
          `[useOperationOptions:${urlKey}] Invalid defaultOptions provided`,
        );
      }
    }
  }, [schema, currentOptions, defaultOptions, urlKey]);

  return {
    options: currentOptions,
    setOptions,
    resetToDefaults,
    getOption,
    // Always expose isTransitioning since we use it for atomic state updates
    isTransitioning,
  };
}
