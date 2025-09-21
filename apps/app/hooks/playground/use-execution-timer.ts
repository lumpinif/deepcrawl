import { useCallback, useEffect, useRef, useState } from 'react';

interface ExecutionTimerState {
  startTimes: Record<string, number>;
  currentTimes: Record<string, number>;
  isRunning: Record<string, boolean>;
}

/**
 * Custom hook for managing execution timing across multiple operations
 * Provides real-time timing updates and proper cleanup
 */
export function useExecutionTimer() {
  const [state, setState] = useState<ExecutionTimerState>({
    startTimes: {},
    currentTimes: {},
    isRunning: {},
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timing for an operation
  const startTimer = useCallback((operationId: string) => {
    const startTime = performance.now();
    setState((prev) => ({
      ...prev,
      startTimes: { ...prev.startTimes, [operationId]: startTime },
      isRunning: { ...prev.isRunning, [operationId]: true },
      currentTimes: { ...prev.currentTimes, [operationId]: 0 },
    }));
    return startTime;
  }, []);

  // Stop timing for an operation
  const stopTimer = useCallback((operationId: string) => {
    setState((prev) => {
      const { [operationId]: removedStart, ...remainingStartTimes } =
        prev.startTimes;
      const { [operationId]: removedRunning, ...remainingRunning } =
        prev.isRunning;
      const { [operationId]: removedCurrent, ...remainingCurrentTimes } =
        prev.currentTimes;

      return {
        startTimes: remainingStartTimes,
        isRunning: remainingRunning,
        currentTimes: remainingCurrentTimes,
      };
    });
  }, []);

  // Get elapsed time for an operation
  const getElapsedTime = useCallback(
    (operationId: string, startTime?: number): number => {
      if (startTime) {
        return performance.now() - startTime;
      }
      const recorded = state.startTimes[operationId];
      return recorded ? performance.now() - recorded : 0;
    },
    [state.startTimes],
  );

  // Get current real-time execution time for a running operation
  const getCurrentExecutionTime = useCallback(
    (operationId: string): number => {
      return state.currentTimes[operationId] || 0;
    },
    [state.currentTimes],
  );

  // Format time for display
  const formatTime = useCallback(
    (ms: number, asString = false): number | string => {
      if (ms < 1000) {
        return asString ? `${ms} ms` : ms;
      }

      const roundedMs = (ms / 1000).toFixed(2);

      return asString ? `${roundedMs} s` : roundedMs;
    },
    [],
  );

  // Update current times for running operations
  useEffect(() => {
    const hasRunningOperations = Object.values(state.isRunning).some(Boolean);

    if (hasRunningOperations) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const updated = { ...prev.currentTimes };

          for (const [operationId, isRunning] of Object.entries(
            prev.isRunning,
          )) {
            if (isRunning && prev.startTimes[operationId]) {
              updated[operationId] =
                performance.now() - prev.startTimes[operationId];
            }
          }

          return { ...prev, currentTimes: updated };
        });
      }, 100); // Update every 100ms for smooth display
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning]);

  return {
    startTimer,
    stopTimer,
    getElapsedTime,
    getCurrentExecutionTime,
    formatTime,
  };
}
