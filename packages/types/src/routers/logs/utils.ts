import type {
  GetManyLogsPaginationInput,
  NormalizedGetManyLogsPagination,
} from './types';

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
