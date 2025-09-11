import { z } from 'zod/v4';
import { smartboolOptionalWithDefault } from '../common/smart-schemas';
import { DEFAULT_METRICS_OPTIONS } from '../configs/default';

const { enable } = DEFAULT_METRICS_OPTIONS;

export const MetricsOptionsSchema = z
  .object({
    enable: smartboolOptionalWithDefault(enable).meta({
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

export type Metrics = z.infer<typeof MetricsSchema>;
