import { smartboolTrue } from '@deepcrawl/types/common/smart-schemas';
import { z } from 'zod/v4';

/**
 * Cache configuration for read operation based on KV put options except for `metadata`.
 * An object containing the `expiration` (optional) and `expirationTtl` (optional) attributes
 * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/#put-method
 */
export const CacheOptionsSchema = z
  .object({
    enabled: smartboolTrue().meta({
      description: 'Whether to enable cache. Default is true.',
      default: true,
      examples: [true],
    }),
    expiration: z
      .number()
      .optional()
      .meta({
        description:
          'The number that represents when to expire the key-value pair in seconds since epoch',
        examples: [1717708800], // 2024-06-06 00:00:00
      }),
    expirationTtl: z
      .number()
      .min(60) // 1 minute
      .optional()
      .meta({
        description:
          'The number that represents when to expire the key-value pair in seconds from now. The minimum value is 60',
        examples: [86400],
      }),
  })
  .default({ enabled: true }) // initialize zobject with default value
  .optional();

/**
 * @default { enabled: true }
 */
export type CacheOptions = z.infer<typeof CacheOptionsSchema>;
