import { z } from 'zod/v4';

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
