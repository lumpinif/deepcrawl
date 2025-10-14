/**
 * @file Types utils
 *
 * Re-export utilities from @deepcrawl/types/utils
 *
 * @example
 * ```typescript
 * import {
 * // Zod schema helper
 * OptionalBoolWithDefault,
 *
 * // Pagination normalization
 * normalizeGetManyLogsPagination
 * } from 'deepcrawl/types/utils';
 *
 * // Example: Create optional boolean schema with default
 * const schema = OptionalBoolWithDefault(true);
 *
 * // Example: Normalize pagination input
 * const normalized = normalizeGetManyLogsPagination({ limit: 150, offset: -5 });
 *
 * // Returns: { limit: 100, offset: 0 } (clamped to valid ranges)
 * ```
 */
export * from '@deepcrawl/types/utils';
