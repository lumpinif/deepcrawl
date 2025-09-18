export function secondsToMinutes(seconds: number): number {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
    throw new TypeError('secondsToMinutes expects a valid number');
  }

  if (!Number.isFinite(seconds)) {
    throw new TypeError('secondsToMinutes expects a finite number');
  }

  return seconds / 60;
}
