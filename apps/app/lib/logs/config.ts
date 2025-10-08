export const LOGS_DATE_RANGE_PRESET_IN_DAYS = {
  'last-2-days': 2,
  'last-7-days': 7,
  'last-30-days': 30,
  'last-90-days': 90,
} as const;

export type LogsDateRangePreset = keyof typeof LOGS_DATE_RANGE_PRESET_IN_DAYS;

export const DATE_RANGE_PRESET_LABELS: Record<LogsDateRangePreset, string> = {
  'last-2-days': 'Last 2 days',
  'last-7-days': 'Last 7 days',
  'last-30-days': 'Last 30 days',
  'last-90-days': 'Last 90 days',
} as const;

export const DEFAULT_LOGS_DATE_RANGE_PRESET: LogsDateRangePreset =
  'last-2-days';
