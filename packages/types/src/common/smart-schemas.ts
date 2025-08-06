import { z } from 'zod/v4';

/**
 * Smart boolean schema that accepts both boolean and string values.
 *
 * Accepts:
 * - Boolean: true, false
 * - String: "true", "false"
 *
 * This provides the best of both worlds for API flexibility while maintaining
 * clean type inference for oRPC.
 *
 * @example
 * ```typescript
 * const schema = smartbool().optional().default(true);
 *
 * schema.parse(true);     // ✅ true
 * schema.parse(false);    // ✅ false
 * schema.parse("true");   // ✅ true
 * schema.parse("false");  // ✅ false
 * schema.parse("maybe");  // ❌ ZodError
 * ```
 */
export const smartbool = () =>
  z
    .stringbool({
      truthy: ['true'],
      falsy: ['false'],
    })
    .or(z.boolean());

export const smartboolOptional = () => smartbool().optional();

/**
 * Smart boolean schema with default value.
 * Convenient helper for common use case.
 *
 * @param defaultValue - The default boolean value
 * @returns Zod schema with smart boolean parsing and default
 *
 * @example
 * ```typescript
 * const enabledSchema = smartboolWithDefault(true);
 * const disabledSchema = smartboolWithDefault(false);
 * ```
 */
export const smartboolOptionalWithDefault = (defaultValue: boolean) =>
  smartbool().default(defaultValue).optional();

// They are optional by default
export const smartboolTrue = () => smartboolOptionalWithDefault(true);
export const smartboolFalse = () => smartboolOptionalWithDefault(false);
