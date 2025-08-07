import { smartboolOptionalWithDefault } from '@deepcrawl/types/common/smart-schemas';
import { DEFAULT_CACHE_OPTIONS } from '@deepcrawl/types/configs';
import { z } from 'zod/v4';

const { enabled } = DEFAULT_CACHE_OPTIONS;

/**
 * Cache configuration for read operation based on KV put options except for `metadata`.
 * An object containing the `expiration` (optional) and `expirationTtl` (optional) attributes
 * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/#put-method
 */
export const CacheOptionsSchema = z
  .object({
    enabled: smartboolOptionalWithDefault(enabled).meta({
      description: 'Whether to enable cache. Default is true.',
      default: enabled,
      examples: [enabled, !enabled],
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
        examples: [60],
      }),
  })
  .default(DEFAULT_CACHE_OPTIONS); // initialize zobject with default value

/**
 * @default { enabled: true }
 */
export type CacheOptions = z.infer<typeof CacheOptionsSchema>;
