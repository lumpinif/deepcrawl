import type {
  ListLogsPaginationInput,
  NormalizedListLogsPagination,
} from './types';

/**
 * @description Normalize list logs pagination input
 *
 * @param input - List logs pagination input
 * @returns Normalized list logs pagination
 *
 * @example
 * ```typescript
 * import { normalizeListLogsPagination } from '@deepcrawl/types/routers/logs/utils';
 *
 * const normalized = normalizeListLogsPagination({ limit: 150, offset: -5 });
 * // Returns: { limit: 100, offset: 0 } (clamped to valid ranges)
 * ```
 */
export function normalizeListLogsPagination(
  input: ListLogsPaginationInput = {},
): NormalizedListLogsPagination {
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
