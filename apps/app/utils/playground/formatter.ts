export function formatDaysFromSeconds(seconds: number): string {
  const days = seconds / 86400;
  return Number.isInteger(days) ? String(days) : days.toFixed(1);
}

/**
 * Format timestamp to locale string
 */
export const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) {
    return 'N/A';
  }
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
};

/**
 * Format response data to JSON string
 */
export const formatResponseData = (data: unknown): string => {
  return JSON.stringify(data, null, 2);
};
