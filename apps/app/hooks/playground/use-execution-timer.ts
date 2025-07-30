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
    const startTime = Date.now();
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
      const startTime = prev.startTimes[operationId];
      const finalTime = startTime ? Date.now() - startTime : 0;

      return {
        ...prev,
        isRunning: { ...prev.isRunning, [operationId]: false },
        currentTimes: { ...prev.currentTimes, [operationId]: 0 },
      };
    });
  }, []);

  // Get elapsed time for an operation
  const getElapsedTime = useCallback(
    (operationId: string, startTime?: number): number => {
      if (startTime) {
        return Date.now() - startTime;
      }
      const recorded = state.startTimes[operationId];
      return recorded ? Date.now() - recorded : 0;
    },
    [state.startTimes],
  );

  // Format time for display
  const formatTime = useCallback((ms: number): string => {
    if (ms < 1000) {
      return `${ms} ms`;
    }
    return `${(ms / 1000).toFixed(2)} s`;
  }, []);

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
              updated[operationId] = Date.now() - prev.startTimes[operationId];
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
    formatTime,
    currentTimes: state.currentTimes,
    isRunning: state.isRunning,
  };
}
