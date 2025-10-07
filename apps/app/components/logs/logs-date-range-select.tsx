'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@deepcrawl/ui/components/ui/select';
import {
  DATE_RANGE_PRESET_LABELS,
  DEFAULT_LOGS_DATE_RANGE_PRESET,
  type LogsDateRangePreset,
} from '@/query/logs-query.shared';

const DATE_RANGE_OPTIONS = Object.entries(DATE_RANGE_PRESET_LABELS).map(
  ([value, label]) => ({
    value: value as LogsDateRangePreset,
    label,
  }),
);

export interface LogsDateRangeSelectProps {
  readonly value?: LogsDateRangePreset;
  readonly onValueChange?: (preset: LogsDateRangePreset) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function LogsDateRangeSelect({
  value = DEFAULT_LOGS_DATE_RANGE_PRESET,
  onValueChange,
  disabled,
  className,
}: LogsDateRangeSelectProps) {
  return (
    <Select
      disabled={disabled}
      onValueChange={(nextValue) =>
        onValueChange?.(nextValue as LogsDateRangePreset)
      }
      value={value}
    >
      <SelectTrigger className={className ?? 'w-44'}>
        <SelectValue placeholder="Select date range" />
      </SelectTrigger>
      <SelectContent align="end">
        {DATE_RANGE_OPTIONS.map(({ value: preset, label }) => (
          <SelectItem key={preset} value={preset}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
