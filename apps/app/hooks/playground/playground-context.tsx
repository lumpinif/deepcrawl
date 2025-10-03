'use client';

/**
 * @file Granular React Context implementation for playground state management
 *
 * This provides three focused contexts for optimal performance:
 * - PlaygroundCoreContext: URL, operation, execution, responses
 * - PlaygroundOptionsContext: Operation options and current state
 * - PlaygroundActionsContext: All action functions
 *
 * Each context is optimized to prevent unnecessary re-renders.
 */

// SOCIAL: SHARE USE-CONTEXT-SELECTOR ON SOCIAL: Hard to quote a single percentage without measuring your exact UI. The re-render savings depend on how many components subscribed to each context field, how expensive their renders are, and how often the underlying data changes. In practice, when a large form or dashboard switches from plain useContext to per-field selectors, it's common to see render counts drop by 50–90 % for the busiest components, which translates to noticeably smoother interactions (URL typing, option toggles) and lower React DevTools flame charts. Grab a React Profiler snapshot before and after (type a URL, flip a few switches) to get the real numbers for your playground— that will show precisely how many renders were skipped and what the timing gains are.

import { useCallback, useMemo } from 'react';
import {
  type Context,
  createContext,
  useContextSelector,
} from 'use-context-selector';
import type {
  PlaygroundActionsContextValue,
  PlaygroundCoreContextValue,
  PlaygroundOptionsContextValue,
  PlaygroundProviderProps,
  UsePlaygroundActionsReturn,
  UsePlaygroundCoreReturn,
  UsePlaygroundOptionsReturn,
  UsePlaygroundReturn,
} from './types';
import { usePlaygroundOperations } from './use-playground-operations';
import { usePlaygroundState } from './use-playground-state';

/* ------------------------------------------------------------------------------------ */
/* CONTEXT DEFINITIONS */
/* ------------------------------------------------------------------------------------ */

const PlaygroundCoreContext = createContext<PlaygroundCoreContextValue | null>(
  null,
);
const PlaygroundOptionsContext =
  createContext<PlaygroundOptionsContextValue | null>(null);
const PlaygroundActionsContext =
  createContext<PlaygroundActionsContextValue | null>(null);

/* ------------------------------------------------------------------------------------ */
/* CONTEXT PROVIDER */
/* ------------------------------------------------------------------------------------ */

export function PlaygroundProvider({
  children,
  defaultOperation = 'readUrl',
  defaultUrl = '',
}: PlaygroundProviderProps) {
  // state management hook
  const s = usePlaygroundState({
    defaultOperation,
    defaultUrl,
  });

  // Operations hook for API calls
  const op = usePlaygroundOperations({
    requestUrl: s.requestUrl,
    getAnyOperationState: s.getAnyOperationState,
    activeRequestsRef: s.activeRequestsRef,
    setIsExecuting: s.setIsExecuting,
    setResponses: s.setResponses,
  });

  // Core state context value
  const coreValue: PlaygroundCoreContextValue = useMemo(
    () => ({
      requestUrl: s.requestUrl,
      selectedOperation: s.selectedOperation,
      isExecuting: s.isExecuting,
      responses: s.responses,
      activeRequestsRef: s.activeRequestsRef,
    }),
    [
      s.requestUrl,
      s.selectedOperation,
      s.isExecuting,
      s.responses,
      s.activeRequestsRef,
    ],
  );

  // Options state context value
  const optionsValue: PlaygroundOptionsContextValue = useMemo(
    () => ({
      currentQueryState: s.currentQueryState,
      operationQueryStates: s.operationQueryStates,
      getAnyOperationState: s.getAnyOperationState,
      getOptionFor: s.getOptionFor,
      currentOptions: s.currentQueryState.options,
    }),
    [
      s.currentQueryState,
      s.operationQueryStates,
      s.getAnyOperationState,
      s.getOptionFor,
    ],
  );

  // Actions context value
  const actionsValue: PlaygroundActionsContextValue = useMemo(
    () => ({
      // Core actions
      setRequestUrl: s.setRequestUrl,
      setSelectedOperation: s.setSelectedOperation,
      setIsExecuting: s.setIsExecuting,
      setResponses: s.setResponses,

      // Option actions
      resetToDefaults: s.resetToDefaults,

      // API operations
      executeApiCall: op.executeApiCall,
      handleRetry: op.handleRetry,

      // Utility functions
      formatTime: op.formatTime,
      getCurrentExecutionTime: op.getCurrentExecutionTime,
    }),
    [
      s.setRequestUrl,
      s.setSelectedOperation,
      s.setIsExecuting,
      s.setResponses,
      s.resetToDefaults,
      op.executeApiCall,
      op.handleRetry,
      op.formatTime,
      op.getCurrentExecutionTime,
    ],
  );

  return (
    <PlaygroundCoreContext.Provider value={coreValue}>
      <PlaygroundOptionsContext.Provider value={optionsValue}>
        <PlaygroundActionsContext.Provider value={actionsValue}>
          {children}
        </PlaygroundActionsContext.Provider>
      </PlaygroundOptionsContext.Provider>
    </PlaygroundCoreContext.Provider>
  );
}

/* ------------------------------------------------------------------------------------ */
/* GRANULAR CONTEXT HOOKS */
/* ------------------------------------------------------------------------------------ */

type AnySelector<ContextValue, Selected> =
  | ((state: ContextValue) => Selected)
  | keyof ContextValue;

function useContextSlice<ContextValue, Selected>(
  context: Context<ContextValue | null>,
  hookName: string,
  selector: (state: ContextValue) => Selected,
): Selected {
  const wrappedSelector = useCallback(
    (value: ContextValue | null) => {
      if (!value) {
        throw new Error(`${hookName} must be used within <PlaygroundProvider>`);
      }
      return selector(value);
    },
    [hookName, selector],
  );

  return useContextSelector(context, wrappedSelector);
}

function useContextSelectorStrict<ContextValue, Selected>(
  context: Context<ContextValue | null>,
  hookName: string,
  selector: AnySelector<ContextValue, Selected>,
): Selected {
  const normalizedSelector = useMemo(
    () =>
      typeof selector === 'function'
        ? selector
        : (state: ContextValue) => state[selector] as Selected,
    [selector],
  );

  return useContextSlice(context, hookName, normalizedSelector);
}

const selectCoreIdentity = (state: PlaygroundCoreContextValue) => state;
const selectOptionsIdentity = (state: PlaygroundOptionsContextValue) => state;
const selectActionsIdentity = (state: PlaygroundActionsContextValue) => state;

/**
 * Hook to access core playground state (URL, operation, execution, responses)
 * Use this when you only need to read core state without options or actions
 */
export function usePlaygroundCore(): UsePlaygroundCoreReturn {
  return useContextSlice(
    PlaygroundCoreContext,
    'usePlaygroundCore',
    selectCoreIdentity,
  );
}

/**
 * Hook to access playground options state (current and all operation options)
 * Use this when you need to read/write operation-specific options
 */
export function usePlaygroundOptions(): UsePlaygroundOptionsReturn {
  return useContextSlice(
    PlaygroundOptionsContext,
    'usePlaygroundOptions',
    selectOptionsIdentity,
  );
}

/**
 * Hook to access playground actions (setters, API calls, utilities)
 * Use this when you need to trigger state changes or API operations
 */
export function usePlaygroundActions(): UsePlaygroundActionsReturn {
  return useContextSlice(
    PlaygroundActionsContext,
    'usePlaygroundActions',
    selectActionsIdentity,
  );
}

/* ------------------------------------------------------------------------------------ */
/* COMBINED HOOK FOR BACKWARD COMPATIBILITY */
/* ------------------------------------------------------------------------------------ */

/**
 * Hook to access all playground state and actions
 * Use this for backward compatibility or when you need access to everything
 * Note: This will cause re-renders when any state changes
 */
export function usePlayground(): UsePlaygroundReturn {
  const core = usePlaygroundCore();
  const options = usePlaygroundOptions();
  const actions = usePlaygroundActions();

  return useMemo(
    () => ({
      ...core,
      ...options,
      ...actions,
    }),
    [core, options, actions],
  );
}

/* ------------------------------------------------------------------------------------ */
/* SELECTOR HOOKS FOR PERFORMANCE OPTIMIZATION */
/* ------------------------------------------------------------------------------------ */

/**
 * Hook to select specific data from core state.
 * Accepts either a selector function or a property key.
 */
export function usePlaygroundCoreSelector<
  K extends keyof PlaygroundCoreContextValue,
>(selector: K): PlaygroundCoreContextValue[K];
export function usePlaygroundCoreSelector<T>(
  selector: (state: PlaygroundCoreContextValue) => T,
): T;
export function usePlaygroundCoreSelector<T>(
  selector:
    | ((state: PlaygroundCoreContextValue) => T)
    | keyof PlaygroundCoreContextValue,
): T {
  return useContextSelectorStrict(
    PlaygroundCoreContext,
    'usePlaygroundCoreSelector',
    selector,
  );
}

/**
 * Hook to select specific data from options state.
 * Accepts either a selector function or a property key.
 */
export function usePlaygroundOptionsSelector<
  K extends keyof PlaygroundOptionsContextValue,
>(selector: K): PlaygroundOptionsContextValue[K];
export function usePlaygroundOptionsSelector<T>(
  selector: (state: PlaygroundOptionsContextValue) => T,
): T;
export function usePlaygroundOptionsSelector<T>(
  selector:
    | ((state: PlaygroundOptionsContextValue) => T)
    | keyof PlaygroundOptionsContextValue,
): T {
  return useContextSelectorStrict(
    PlaygroundOptionsContext,
    'usePlaygroundOptionsSelector',
    selector,
  );
}

/**
 * Hook to select specific data from actions.
 * Accepts either a selector function or a property key.
 */
export function usePlaygroundActionsSelector<
  K extends keyof PlaygroundActionsContextValue,
>(selector: K): PlaygroundActionsContextValue[K];
export function usePlaygroundActionsSelector<T>(
  selector: (state: PlaygroundActionsContextValue) => T,
): T;
export function usePlaygroundActionsSelector<T>(
  selector:
    | ((state: PlaygroundActionsContextValue) => T)
    | keyof PlaygroundActionsContextValue,
): T {
  return useContextSelectorStrict(
    PlaygroundActionsContext,
    'usePlaygroundActionsSelector',
    selector,
  );
}
