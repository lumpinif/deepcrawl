/**
 * @file Enhanced task input state management hook
 *
 * Main orchestrator hook that coordinates operation-specific state management
 * with improved type safety, URL parameter handling, and state preservation.
 *
 * This is the new implementation that replaces use-task-input-state.ts
 */

import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';
import {
  type DeepcrawlOperations,
  type GetOptionFor,
  type OperationQueryStateMap,
  type OperationToOptions,
  type PlaygroundResponses,
  pickState,
} from './types';
import { useExtractLinksOptions } from './use-extractlinks-options';
import { useGetMarkdownOptions } from './use-getmarkdown-options';
import { useReadUrlOptions } from './use-readurl-options';

interface UseEnhancedTaskInputStateProps {
  defaultOperation?: DeepcrawlOperations;
  defaultUrl?: string;
}

// Available operations for type safety
const operations: readonly DeepcrawlOperations[] = [
  'getMarkdown',
  'readUrl',
  'extractLinks',
] as const;

/**
 * Enhanced task input state management hook.
 *
 * Features:
 * - Operation-specific state management with URL sync
 * - Type-safe option access with proper TypeScript inference
 * - State preservation when switching between operations
 * - Clean URL parameters (only current operation visible)
 * - Enhanced user experience with default value hiding
 * - Backward compatibility with existing components
 *
 * @param props - Configuration for the hook
 * @returns Enhanced state management interface
 *
 * @example
 * ```tsx
 * const {
 *   selectedOperation,
 *   setSelectedOperation,
 *   requestUrl,
 *   setRequestUrl,
 *   currentState,
 *   getOptionValue,
 *   operationStates
 * } = useEnhancedTaskInputState({
 *   defaultOperation: 'getMarkdown',
 *   defaultUrl: ''
 * });
 *
 * // Type-safe current state access
 * console.log(currentState.options.markdown); // Type error if not readUrl operation
 *
 * // Generic option access with fallback
 * const markdownEnabled = getOptionValue('markdown', true);
 *
 * // Operation-specific state access
 * const readUrlState = operationStates.readUrl;
 * readUrlState.setOptions({ markdown: false });
 * ```
 */
export function useEnhancedTaskInputState({
  defaultOperation = 'getMarkdown',
  defaultUrl = '',
}: UseEnhancedTaskInputStateProps = {}) {
  // Core URL and operation state management
  const [requestUrl, setRequestUrl] = useQueryState(
    'url',
    parseAsString.withDefault(defaultUrl).withOptions({
      clearOnDefault: true,
      shallow: true,
      history: 'push',
    }),
  );

  const [selectedOperation, setSelectedOperation] = useQueryState(
    'op',
    parseAsStringLiteral(operations).withDefault(defaultOperation).withOptions({
      shallow: true,
      history: 'push',
    }),
  );

  // Operation-specific state hooks
  const readUrlState = useReadUrlOptions({
    active: selectedOperation === 'readUrl',
  });

  const extractLinksState = useExtractLinksOptions({
    active: selectedOperation === 'extractLinks',
  });

  const getMarkdownState = useGetMarkdownOptions({
    active: selectedOperation === 'getMarkdown',
  });

  // API execution state management
  const [isExecuting, setIsExecuting] = useState<
    Record<DeepcrawlOperations, boolean>
  >({
    getMarkdown: false,
    readUrl: false,
    extractLinks: false,
  });

  // API response state management
  const [responses, setResponses] = useState<PlaygroundResponses>({});

  // Deduplication ref for preventing multiple simultaneous requests
  const activeRequestsRef = useMemo(() => ({ current: new Set<string>() }), []);

  // Operation state map for type-safe access
  const operationQueryStates: OperationQueryStateMap = useMemo(
    () => ({
      readUrl: readUrlState,
      extractLinks: extractLinksState,
      getMarkdown: getMarkdownState,
    }),
    [readUrlState, extractLinksState, getMarkdownState],
  );

  // Type-safe current state getter
  const currentQueryState = useMemo(() => {
    return pickState(selectedOperation, operationQueryStates);
  }, [operationQueryStates, selectedOperation]);

  // Removed getOptionValue - now using direct typed options access

  // Reset to defaults function
  const resetToDefaults = useCallback(
    (operation?: DeepcrawlOperations) => {
      if (operation) {
        // Reset specific operation
        pickState(operation, operationQueryStates).resetToDefaults();
      } else {
        // Reset current operation
        currentQueryState.resetToDefaults();
      }
    },
    [operationQueryStates, currentQueryState],
  );

  // Utility function to get state for specific operation
  // Bonus: add overloads for even better IntelliSense when needed
  const getAnyOperationState = useCallback(
    <K extends keyof OperationToOptions>(op: K) =>
      pickState(op, operationQueryStates),
    [operationQueryStates],
  );

  const getOptionFor = useCallback(
    ((operation, key, fallback) => {
      const state = operationQueryStates[operation];
      const value = state.options[key];

      if (value !== undefined) {
        return value;
      }

      if (fallback !== undefined) {
        return fallback;
      }

      return state.defaults[key];
    }) as GetOptionFor,
    [operationQueryStates],
  );

  return {
    // Core state
    requestUrl,
    selectedOperation,
    isExecuting,
    responses,
    activeRequestsRef,

    // Actions
    setRequestUrl,
    setSelectedOperation,
    setIsExecuting,
    setResponses,

    // Enhanced state access
    currentQueryState,
    operationQueryStates,
    getAnyOperationState,
    getOptionFor,

    // Core helpers (minimized for clean architecture)
    resetToDefaults,

    // Additional utilities for enhanced functionality
    options: currentQueryState.options, // Direct access to current options
  };
}

// Type export for components
export type UseEnhancedTaskInputStateReturn = ReturnType<
  typeof useEnhancedTaskInputState
>;
