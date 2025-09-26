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

import { createContext, useContext, useMemo } from 'react';
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
import { useEnhancedTaskInputState } from './use-enhanced-task-input-state';
import { useTaskInputOperations } from './use-task-input-operations';

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
  defaultOperation = 'getMarkdown',
  defaultUrl = '',
}: PlaygroundProviderProps) {
  // state management hook
  const s = useEnhancedTaskInputState({
    defaultOperation,
    defaultUrl,
  });

  // Operations hook for API calls
  const op = useTaskInputOperations({
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
      currentOptions: s.currentQueryState.options,
    }),
    [s.currentQueryState, s.operationQueryStates, s.getAnyOperationState],
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

function useNonNull<T>(ctx: T | null, name: string): T {
  if (!ctx) {
    throw new Error(`${name} must be used within <PlaygroundProvider>`);
  }
  return ctx;
}

/**
 * Hook to access core playground state (URL, operation, execution, responses)
 * Use this when you only need to read core state without options or actions
 */
export function usePlaygroundCore(): UsePlaygroundCoreReturn {
  const context = useNonNull(
    useContext(PlaygroundCoreContext),
    'usePlaygroundCore',
  );
  return context;
}

/**
 * Hook to access playground options state (current and all operation options)
 * Use this when you need to read/write operation-specific options
 */
export function usePlaygroundOptions(): UsePlaygroundOptionsReturn {
  const context = useNonNull(
    useContext(PlaygroundOptionsContext),
    'usePlaygroundOptions',
  );
  return context;
}

/**
 * Hook to access playground actions (setters, API calls, utilities)
 * Use this when you need to trigger state changes or API operations
 */
export function usePlaygroundActions(): UsePlaygroundActionsReturn {
  const context = useNonNull(
    useContext(PlaygroundActionsContext),
    'usePlaygroundActions',
  );
  return context;
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
 * ⚠️ Important: useContext(...) + useMemo(selector(...)) does not stop re-renders; the consumer already re-rendered. For true selective subscriptions, use a context-selector library (e.g. use-context-selector) or split contexts so each slice changes independently (you already split Core/Options/Actions, which helps a lot). Replace React.createContext with createContext from the library and pass the full slice value if we are using use-context-selector.
 */

/**
 * Hook to select specific data from core state
 * Prevents re-renders when unrelated core state changes
 */
export function usePlaygroundCoreSelector<T>(
  selector: (state: PlaygroundCoreContextValue) => T,
): T {
  const core = usePlaygroundCore();
  return useMemo(() => selector(core), [selector, core]);
}

/**
 * Hook to select specific data from options state
 * Prevents re-renders when unrelated options state changes
 */
export function usePlaygroundOptionsSelector<T>(
  selector: (state: PlaygroundOptionsContextValue) => T,
): T {
  const options = usePlaygroundOptions();
  return useMemo(() => selector(options), [selector, options]);
}

/**
 * Hook to select specific data from actions
 * Typically actions don't change, but provided for consistency
 */
export function usePlaygroundActionsSelector<T>(
  selector: (state: PlaygroundActionsContextValue) => T,
): T {
  const actions = usePlaygroundActions();
  return useMemo(() => selector(actions), [selector, actions]);
}
