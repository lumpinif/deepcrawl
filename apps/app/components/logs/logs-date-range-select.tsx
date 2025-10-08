'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { Calendar } from '@deepcrawl/ui/components/ui/calendar';
import {
  Card,
  CardContent,
  CardFooter,
} from '@deepcrawl/ui/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@deepcrawl/ui/components/ui/popover';
import { formatDateRange } from 'little-date';
import { ChevronDownIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useLogsDateRange } from '@/hooks/use-logs-date-range';
import {
  DATE_RANGE_PRESET_LABELS,
  LOGS_DATE_RANGE_PRESET_IN_DAYS,
  type LogsDateRangePreset,
} from '@/lib/logs/config';
import type { LogsDateRange } from '@/lib/logs/types';
import {
  createLogsDateRangeFromDates,
  createLogsDateRangeFromPreset,
} from '@/utils/logs';

const DATE_RANGE_PRESET_OPTIONS = Object.entries(DATE_RANGE_PRESET_LABELS).map(
  ([value, label]) => ({
    value: value as LogsDateRangePreset,
    label,
    days: LOGS_DATE_RANGE_PRESET_IN_DAYS[value as LogsDateRangePreset],
  }),
);

interface LogsDateRangeSelectProps {
  disabled?: boolean;
  className?: string;
}

/**
 * Convert LogsDateRange (ISO strings) to DateRange (Date objects)
 */
function toDateRange(logsRange: LogsDateRange): DateRange {
  return {
    from: new Date(logsRange.startDate),
    to: new Date(logsRange.endDate),
  };
}

/**
 * Check if a LogsDateRange matches a preset
 * Compares the number of days between start and end dates
 * and checks if end date is today (local timezone)
 */
function matchesPreset(
  range: LogsDateRange,
  preset: LogsDateRangePreset,
): boolean {
  const expectedDays = LOGS_DATE_RANGE_PRESET_IN_DAYS[preset];

  // Parse the ISO date strings and work in local timezone
  const rangeStart = new Date(range.startDate);
  const rangeEnd = new Date(range.endDate);

  // Get today's date in local timezone (midnight)
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();

  // Get range end date in local timezone (midnight)
  const rangeEndMidnight = new Date(
    rangeEnd.getFullYear(),
    rangeEnd.getMonth(),
    rangeEnd.getDate(),
  ).getTime();

  // Check if end date is today
  if (rangeEndMidnight !== todayMidnight) {
    return false;
  }

  // Calculate the number of days in the range
  const rangeStartMidnight = new Date(
    rangeStart.getFullYear(),
    rangeStart.getMonth(),
    rangeStart.getDate(),
  ).getTime();

  const daysDiff =
    Math.round(
      (rangeEndMidnight - rangeStartMidnight) / (1000 * 60 * 60 * 24),
    ) + 1;

  return daysDiff === expectedDays;
}

/**
 * Get label for the current date range
 */
function getDateRangeLabel(range: LogsDateRange): string {
  // Check if matches any preset
  for (const { value, label } of DATE_RANGE_PRESET_OPTIONS) {
    if (matchesPreset(range, value)) {
      return label;
    }
  }

  // Custom range - format the dates
  const dateRange = toDateRange(range);
  if (!(dateRange.from && dateRange.to)) {
    return 'Select date range';
  }
  return formatDateRange(dateRange.from, dateRange.to, {
    includeTime: false,
  });
}

export function LogsDateRangeSelect({
  disabled,
  className,
}: LogsDateRangeSelectProps) {
  const [open, setOpen] = useState(false);
  // Local draft state while popover is open
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();

  const { activeRange: value, setActiveRange: onChange } = useLogsDateRange();

  // Current range as DateRange for calendar
  const currentDateRange = useMemo(() => toDateRange(value), [value]);

  // Label to show in trigger
  const triggerLabel = useMemo(() => getDateRangeLabel(value), [value]);

  // When popover opens, sync draft with current value
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setDraftRange(currentDateRange);
      } else {
        setDraftRange(undefined);
      }
      setOpen(isOpen);
    },
    [currentDateRange],
  );

  // Handle preset button click - updates draft state
  const handlePresetClick = useCallback((preset: LogsDateRangePreset) => {
    // Use the same function as context initialization for consistency
    const presetRange = createLogsDateRangeFromPreset(preset);
    const dateRange = toDateRange(presetRange);

    // Update draft state, don't apply yet
    setDraftRange(dateRange);
  }, []);

  // Handle calendar date selection - updates draft state
  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    setDraftRange(range);
  }, []);

  // Handle reset button click - resets draft to current value
  const handleReset = useCallback(() => {
    setDraftRange(currentDateRange);
  }, [currentDateRange]);

  // Handle confirm button click - applies the draft range
  const handleConfirm = useCallback(() => {
    if (draftRange?.from && draftRange?.to) {
      // Close popover immediately to avoid blocking UI during refetch
      setOpen(false);

      // Apply the changes (triggers data refetch)
      const newRange = createLogsDateRangeFromDates(
        draftRange.from,
        draftRange.to,
      );
      onChange(newRange);
    }
  }, [draftRange, onChange]);

  // Check if confirm button should be enabled
  const canConfirm = Boolean(draftRange?.from && draftRange?.to);

  // Check if draft has changes from current value
  const hasChanges = useMemo(() => {
    if (!(draftRange?.from && draftRange?.to)) {
      return false;
    }
    const currentDateRange = toDateRange(value);
    return (
      draftRange.from.toDateString() !==
        currentDateRange.from?.toDateString() ||
      draftRange.to.toDateString() !== currentDateRange.to?.toDateString()
    );
  }, [draftRange, value]);

  // Button label based on whether there are changes
  const confirmButtonLabel = hasChanges ? 'Apply Date Range' : 'Apply';

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={className ?? 'w-fit justify-between font-normal'}
          disabled={disabled}
          variant="outline"
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        asChild
        className="w-auto overflow-hidden p-0"
        side="bottom"
      >
        <Card className="max-w-xs gap-0">
          <CardContent className="p-2">
            <Calendar
              captionLayout="dropdown"
              className="dark:!bg-card mx-auto w-full rounded-md border"
              mode="range"
              onSelect={handleCalendarSelect}
              selected={draftRange}
            />
          </CardContent>
          <CardFooter className="!py-2 !px-2 flex w-full flex-col gap-2 border-t">
            <div className="flex w-full flex-wrap gap-2">
              {DATE_RANGE_PRESET_OPTIONS.map((preset) => (
                <Button
                  className="flex-1"
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  size="sm"
                  variant="outline"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {hasChanges && (
              <div className="flex w-full items-center gap-2">
                <Button
                  className="w-full flex-1"
                  onClick={handleReset}
                  size="sm"
                  variant="outline"
                >
                  Reset
                </Button>
                <Button
                  className="w-full flex-1"
                  disabled={!canConfirm}
                  onClick={handleConfirm}
                  size="sm"
                >
                  {confirmButtonLabel}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
