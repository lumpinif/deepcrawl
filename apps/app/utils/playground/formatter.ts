export function formatDaysFromSeconds(seconds: number): string {
  const days = seconds / 86400;
  return Number.isInteger(days) ? String(days) : days.toFixed(1);
}
