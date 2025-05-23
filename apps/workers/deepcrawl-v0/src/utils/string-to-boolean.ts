export function stringToBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized === 'true' || normalized === '1';
  }
  return undefined;
}
