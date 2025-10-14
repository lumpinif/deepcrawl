import { DEFAULT_METRICS_OPTIONS } from '@deepcrawl/types/configs/default';
import { OptionalBoolWithDefault } from '@deepcrawl/types/utils';
import z from 'zod/v4';

const { enable } = DEFAULT_METRICS_OPTIONS;

/**
 * Configuration schema for metrics collection settings.
 * Controls whether performance timing data should be collected and included in responses.
 *
 * @property {boolean} [enable] - Whether to collect and include metrics in responses
 *
 * @example
 * ```typescript
 * const metricsConfig = {
 *   enable: true  // Include timing metrics
 * };
 * ```
 */
export const MetricsOptionsSchema = z
  .object({
    enable: OptionalBoolWithDefault(enable).meta({
      description: 'Whether to enable metrics.',
      default: enable,
      examples: [enable, !enable],
    }),
  })
  .default(DEFAULT_METRICS_OPTIONS)
  .meta({
    title: 'MetricsOptions',
    description: 'Options for metrics.',
    default: DEFAULT_METRICS_OPTIONS,
    examples: [DEFAULT_METRICS_OPTIONS],
  });

/**
 * Performance metrics schema for tracking operation timing data.
 * Provides detailed timing information including human-readable duration and precise timestamps.
 *
 * @property {string} readableDuration - Human-readable duration (e.g., "0.2s", "1.5s")
 * @property {number} durationMs - Total operation duration in milliseconds
 * @property {number} startTimeMs - Unix timestamp in milliseconds when operation started
 * @property {number} endTimeMs - Unix timestamp in milliseconds when operation finished
 *
 * @example
 * ```typescript
 * const metrics = {
 *   readableDuration: '0.2s',
 *   durationMs: 200,
 *   startTimeMs: 1704067800000,
 *   endTimeMs: 1704067800200
 * };
 * ```
 */
export const MetricsSchema = z
  .object({
    readableDuration: z.string().meta({
      description: 'Human-readable representation of the operation duration',
      examples: ['0.2s'],
    }),
    durationMs: z.number().meta({
      description: 'Duration of the operation in milliseconds',
      examples: [200],
    }),
    startTimeMs: z.number().meta({
      description: 'Timestamp in milliseconds when the operation started',
      examples: [1704067800000],
    }),
    endTimeMs: z.number().meta({
      description: 'Timestamp in milliseconds when the operation finished',
      examples: [1704067800200],
    }),
  })
  .meta({
    title: 'Metrics',
    description: 'Performance metrics for the request operation',
    examples: [
      {
        readableDuration: '0.2s',
        durationMs: 200,
        startTimeMs: 1704067800000,
        endTimeMs: 1704067800200,
      },
    ],
  });
