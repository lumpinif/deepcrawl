import type { z } from 'zod/v4';
import type { MetricsOptionsSchema, MetricsSchema } from './schemas';

/**
 * Type representing metrics collection configuration options.
 *
 * @property {boolean} [enable] - Whether to collect and include metrics in responses
 *
 * @example
 * ```typescript
 * const options: MetricsOptions = { enable: true };
 * ```
 */
export type MetricsOptions = z.infer<typeof MetricsOptionsSchema>;

/**
 * Type representing performance metrics data.
 * Contains timing information for operations including readable duration and precise timestamps.
 *
 * @property {string} readableDuration - Human-readable duration (e.g., "0.2s", "1.5s")
 * @property {number} durationMs - Total operation duration in milliseconds
 * @property {number} startTimeMs - Unix timestamp in milliseconds when operation started
 * @property {number} endTimeMs - Unix timestamp in milliseconds when operation finished
 *
 * @example
 * ```typescript
 * const metrics: Metrics = {
 *   readableDuration: '1.2s',
 *   durationMs: 1200,
 *   startTimeMs: 1704067800000,
 *   endTimeMs: 1704067801200
 * };
 * ```
 */
export type Metrics = z.infer<typeof MetricsSchema>;
