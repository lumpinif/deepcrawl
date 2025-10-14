import { z } from 'zod/v4';

/**
 * Optional boolean schema with default value.
 * Convenient helper for common use case.
 *
 * @param defaultValue - The default boolean value
 * @returns Zod schema with boolean parsing and default
 */
export const OptionalBoolWithDefault = (defaultValue: boolean) =>
  z.boolean().default(defaultValue).optional();
