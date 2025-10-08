import { useLogsFilters } from '@/hooks/use-logs-filters';
import { LogsDateRangeSelect } from './logs-date-range-select';
import type { FilterOption } from './logs-filter-popover';
import { LogsFilterPopover } from './logs-filter-popover';
import { LogsSearchBar } from './logs-search-bar';

interface LogsToolbarProps {
  statusOptions: FilterOption[];
  pathOptions: FilterOption[];
}

export function LogsToolbar({ statusOptions, pathOptions }: LogsToolbarProps) {
  const {
    searchQuery,
    selectedStatuses,
    selectedPaths,
    setSearchQuery,
    clearSearch,
    toggleStatus,
    togglePath,
  } = useLogsFilters();

  return (
    <div className="flex w-full items-center justify-between gap-x-2 max-sm:flex-col max-sm:items-start max-sm:gap-4">
      <div className="flex w-full items-center gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <LogsSearchBar
          className="max-sm:w-full max-sm:flex-1"
          onChange={setSearchQuery}
          onClear={clearSearch}
          value={searchQuery}
        />
        <div className="flex items-center gap-2.5 max-sm:w-full">
          <LogsFilterPopover
            className="max-sm:flex-1"
            label="Status"
            onToggle={toggleStatus}
            options={statusOptions}
            selectedValues={selectedStatuses}
          />
          <LogsFilterPopover
            className="max-sm:flex-1"
            contentWidth="w-60"
            emptyMessage="No paths available"
            label="Path"
            onToggle={togglePath}
            options={pathOptions}
            selectedValues={selectedPaths}
          />
        </div>
      </div>
      <LogsDateRangeSelect className="max-sm:w-full max-sm:flex-1" />
    </div>
  );
}
