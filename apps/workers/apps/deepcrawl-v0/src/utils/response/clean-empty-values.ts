/**
 * Recursively cleans an object by removing empty values (empty strings, empty objects, empty arrays)
 * and converting them to undefined
 * @param data The data to clean
 * @returns The cleaned data with empty values converted to undefined
 */
export function cleanEmptyValues<T>(data: T): T | undefined {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return undefined;
  }

  // Handle empty strings
  if (typeof data === 'string' && data.trim() === '') {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return undefined;
    }

    const cleanedArray = data
      .map((item) => cleanEmptyValues(item))
      .filter((item) => item !== undefined);

    return cleanedArray.length > 0 ? (cleanedArray as unknown as T) : undefined;
  }

  // Handle objects
  if (typeof data === 'object') {
    const cleanedObj: Record<string, unknown> = {};
    let hasValues = false;

    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      const cleanedValue = cleanEmptyValues(value);
      if (cleanedValue !== undefined) {
        cleanedObj[key] = cleanedValue;
        hasValues = true;
      }
    }

    return hasValues ? (cleanedObj as unknown as T) : undefined;
  }

  // Return other values as is
  return data;
}
