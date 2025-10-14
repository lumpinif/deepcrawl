import { z } from 'zod/v4';
import { OptionalBoolWithDefault } from '../../common/utils';
import { DEFAULT_CACHE_OPTIONS } from '../../configs';

const { enabled } = DEFAULT_CACHE_OPTIONS;

/**
 * Cache configuration schema for Cloudflare KV storage operations.
 * Based on KV put options except for `metadata` field.
 * Controls how long responses should be cached and whether caching is enabled.
 *
 * @property {boolean} [enabled] - Whether to enable caching
 * @property {number} [expirationTtl] - TTL in seconds from now (minimum 60 seconds)
 *
 * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/#put-method
 *
 * @example
 * ```typescript
 * const cacheConfig = {
 *   enabled: true,
 *   expirationTtl: 3600  // Cache for 1 hour
 * };
 * ```
 */
export const CacheOptionsSchema = z
  .object({
    enabled: OptionalBoolWithDefault(enabled).meta({
      description: 'Whether to enable cache. Default is true.',
      default: enabled,
      examples: [enabled, !enabled],
    }),
    /* @deprecated */
    // expiration: z
    //   .number()
    //   .optional()
    //   .meta({
    //     description:
    //       'The number that represents when to expire the key-value pair in seconds since epoch',
    //     examples: [1717708800], // 2024-06-06 00:00:00
    //   }),
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
