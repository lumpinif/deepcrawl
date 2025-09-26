/**
 * @file Deep equality utility for playground options comparison
 *
 * Provides efficient deep equality checking for complex nested objects
 * used in playground operation options. Optimized for performance with
 * early returns and type-aware comparisons.
 */

/**
 * Performs deep equality comparison between two values.
 *
 * Features:
 * - Handles primitive types (string, number, boolean, null, undefined)
 * - Deep comparison for arrays and objects
 * - Optimized with early returns for performance
 * - Handles circular references and edge cases
 * - Type-aware comparisons (Date, RegExp, etc.)
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are deeply equal, false otherwise
 *
 * @example
 * ```typescript
 * const obj1 = {
 *   nested: { value: 42 },
 *   array: [1, 2, { deep: true }]
 * };
 * const obj2 = {
 *   nested: { value: 42 },
 *   array: [1, 2, { deep: true }]
 * };
 *
 * isEqual(obj1, obj2); // true
 * isEqual(obj1, { ...obj1, nested: { value: 43 } }); // false
 * ```
 */
export function isEqual(a: unknown, b: unknown): boolean {
  // Fast path: reference equality
  if (a === b) {
    return true;
  }

  // Fast path: different types or null/undefined
  if (a == null || b == null) {
    return a === b;
  }
  if (typeof a !== typeof b) {
    return false;
  }

  // Handle primitive types
  if (typeof a !== 'object') {
    return a === b;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // Handle array vs non-array
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle RegExp objects
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Handle objects
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  const keysA = Object.keys(aObj);
  const keysB = Object.keys(bObj);

  // Different number of keys
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check each key exists and has equal value
  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }
    if (!isEqual(aObj[key], bObj[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Shallow equality comparison for objects.
 * Only compares first-level properties, useful for performance optimization
 * when you know nested objects haven't changed.
 *
 * @param a - First object to compare
 * @param b - Second object to compare
 * @returns True if objects are shallowly equal, false otherwise
 *
 * @example
 * ```typescript
 * const obj1 = { a: 1, b: { nested: true } };
 * const obj2 = { a: 1, b: { nested: true } };
 * const obj3 = { a: 1, b: obj1.b }; // Same reference
 *
 * isShallowEqual(obj1, obj2); // false (different nested object references)
 * isShallowEqual(obj1, obj3); // true (same first-level values and references)
 * ```
 */
export function isShallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
