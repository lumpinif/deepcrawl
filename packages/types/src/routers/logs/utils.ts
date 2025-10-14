import type {
  GetManyLogsPaginationInput,
  NormalizedGetManyLogsPagination,
} from './types';

/**
 * @description Normalize get many logs pagination input
 *
 * @param input - Get many logs pagination input
 * @returns Normalized get many logs pagination
 *
 * @example
 * ```typescript
 * import { normalizeGetManyLogsPagination } from '@deepcrawl/types/routers/logs/utils';
 *
 * const normalized = normalizeGetManyLogsPagination({ limit: 150, offset: -5 });
 * // Returns: { limit: 100, offset: 0 } (clamped to valid ranges)
 * ```
 */
export function normalizeGetManyLogsPagination(
  input: GetManyLogsPaginationInput = {},
): NormalizedGetManyLogsPagination {
  const { limit, offset } = input;
  const limitNumber = Number(limit);
  const offsetNumber = Number(offset);
  const normalizedLimit = Number.isFinite(limitNumber)
    ? Math.min(Math.max(Math.trunc(limitNumber), 1), 100)
    : undefined;
  const normalizedOffset = Number.isFinite(offsetNumber)
    ? Math.max(Math.trunc(offsetNumber), 0)
    : undefined;
  return {
    limit: normalizedLimit,
    offset: normalizedOffset,
  };
}
