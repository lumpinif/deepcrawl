import type { CacheOptionsSchema } from '@deepcrawl/types/schemas';
import type { z } from 'zod/v4';

/**
 * @default { enabled: true }
 * @description This is the output type for the `CacheOptions` schema.
 * You can use the Input types re-exported in `deepcrawl` from the `@deepcrawl/contracts` package for each endpoint such as `ReadUrlOptions['cacheOptions']`.
 */
export type CacheOptions = z.infer<typeof CacheOptionsSchema>;
