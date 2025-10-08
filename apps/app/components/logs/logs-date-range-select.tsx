'use client';

import { Calendar } from '@deepcrawl/ui/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@deepcrawl/ui/components/ui/select';
import { formatDateRange } from 'little-date';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  DATE_RANGE_PRESET_LABELS,
  DEFAULT_LOGS_DATE_RANGE_PRESET,
  type LogsDateRangePreset,
} from '@/lib/logs/config';
import type { LogsDateRange } from '@/lib/logs/types';

const DATE_RANGE_OPTIONS = Object.entries(DATE_RANGE_PRESET_LABELS).map(
  ([value, label]) => ({
    value: value as LogsDateRangePreset,
    label,
  }),
);

export type LogsDateRangeSelectValue = LogsDateRangePreset | 'custom';

export interface LogsDateRangeSelectProps {
  readonly value?: LogsDateRangeSelectValue;
  readonly onValueChange?: (value: LogsDateRangeSelectValue) => void;
  readonly customRange?: DateRange;
  readonly onCustomRangeChange?: (range: DateRange | undefined) => void;
  readonly appliedRange: LogsDateRange;
  readonly disabled?: boolean;
  readonly className?: string;
}

function createFallbackRange(applied: LogsDateRange): DateRange {
  return {
    from: new Date(applied.startDate),
    to: new Date(applied.endDate),
  };
}

function formatCustomLabel(range?: DateRange): string {
  if (!(range?.from && range?.to)) {
    return 'Custom range';
  }

  return formatDateRange(range.from, range.to, { includeTime: false });
}

export function LogsDateRangeSelect({
  value = DEFAULT_LOGS_DATE_RANGE_PRESET,
  onValueChange,
  customRange,
  onCustomRangeChange,
  appliedRange,
  disabled,
  className,
}: LogsDateRangeSelectProps) {
  const [open, setOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState(false);
  const [localRange, setLocalRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (!calendarMode) {
      setLocalRange(customRange);
    }
  }, [calendarMode, customRange]);

  const triggerLabel = useMemo(() => {
    if (value === 'custom') {
      return formatCustomLabel(customRange);
    }
    return DATE_RANGE_PRESET_LABELS[value];
  }, [customRange, value]);

  const handlePresetChange = useCallback(
    (preset: LogsDateRangePreset) => {
      setCalendarMode(false);
      setLocalRange(undefined);
      onValueChange?.(preset);
      setOpen(false);
    },
    [onValueChange],
  );

  const handleCustomInitiate = useCallback(() => {
    const fallback = customRange ?? createFallbackRange(appliedRange);
    setLocalRange({ ...fallback });
    setCalendarMode(true);
    setOpen(true);
    onValueChange?.('custom');
  }, [appliedRange, customRange, onValueChange]);

  const handleRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setLocalRange(range);
      onCustomRangeChange?.(range);

      if (range?.from && range?.to) {
        setCalendarMode(false);
        setOpen(false);
      }
    },
    [onCustomRangeChange],
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && calendarMode) {
        setCalendarMode(false);
        setLocalRange(undefined);
        if (!(customRange?.from && customRange?.to)) {
          onCustomRangeChange?.(undefined);
        }
      }
      setOpen(isOpen);
    },
    [calendarMode, customRange, onCustomRangeChange],
  );

  return (
    <Select
      disabled={disabled}
      onOpenChange={handleOpenChange}
      onValueChange={(nextValue) => {
        if (nextValue === 'custom') {
          handleCustomInitiate();
          return;
        }

        handlePresetChange(nextValue as LogsDateRangePreset);
      }}
      open={open}
      value={value}
    >
      <SelectTrigger className={className ?? 'w-44'}>
        <span className="truncate text-left">{triggerLabel}</span>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[240px]">
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {DATE_RANGE_OPTIONS.map(({ value: preset, label }) => (
            <SelectItem key={preset} value={preset}>
              {label}
            </SelectItem>
          ))}
          <SelectItem
            onSelect={(event) => {
              event.preventDefault();
              handleCustomInitiate();
            }}
            value="custom"
          >
            {formatCustomLabel(localRange ?? customRange)}
          </SelectItem>
        </div>
        {calendarMode ? (
          <div className="border-border border-t p-3">
            <Calendar
              autoFocus
              captionLayout="dropdown"
              mode="range"
              onSelect={handleRangeChange}
              selected={localRange}
            />
          </div>
        ) : null}
      </SelectContent>
    </Select>
  );
}
