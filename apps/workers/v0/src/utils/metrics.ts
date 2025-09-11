import type { Metrics } from '@deepcrawl/types/metrics';

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(2);
  return `${minutes}m ${seconds}s`;
}

/**
 * Calculates performance metrics for the read operation.
 * @param startTimeMs - Timestamp in milliseconds when the operation started.
 * @param endTimeMs - Timestamp in milliseconds when the operation finished.
 * @returns An object with durationMs metrics.
 * @property readableDuration - Human-readable representation of the durationMs.
 * @property durationMs - Duration of the operation in milliseconds.
 * @property startTimeMs - Timestamp in milliseconds when the operation started.
 * @property endTimeMs - Timestamp in milliseconds when the operation finished.
 */
export function getMetrics(startTimeMs: number, endTimeMs: number): Metrics {
  return {
    readableDuration: formatDuration(endTimeMs - startTimeMs),
    durationMs: endTimeMs - startTimeMs,
    startTimeMs: startTimeMs,
    endTimeMs: endTimeMs,
  };
}
