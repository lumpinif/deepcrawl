import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@deepcrawl/ui/components/ui/popover';
import { Filter } from 'lucide-react';

export interface FilterOption {
  value: string;
  count: number;
}

interface LogsFilterPopoverProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string, checked: boolean) => void;
  className?: string;
  contentWidth?: string;
  emptyMessage?: string;
}

export function LogsFilterPopover({
  label,
  options,
  selectedValues,
  onToggle,
  className,
  contentWidth = 'w-40',
  emptyMessage = 'No options available',
}: LogsFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={className} variant="outline">
          <Filter />
          {label}
          {selectedValues.length > 0 && (
            <Badge variant="outline">{selectedValues.length}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={`${contentWidth} p-3`}>
        <div className="space-y-3">
          <div className="font-medium text-muted-foreground text-xs">
            {label}
          </div>
          <div className="space-y-3">
            {options.length > 0 ? (
              options.map((option, index) => {
                const checkboxId = `${label.toLowerCase()}-filter-${index}`;
                return (
                  <div className="flex items-center gap-2.5" key={option.value}>
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      id={checkboxId}
                      onCheckedChange={(checked) =>
                        onToggle(option.value, checked === true)
                      }
                    />
                    <Label
                      className="flex grow items-center justify-between gap-1.5 font-normal"
                      htmlFor={checkboxId}
                    >
                      <span className="truncate">{option.value}</span>
                      <span className="text-muted-foreground">
                        {option.count}
                      </span>
                    </Label>
                  </div>
                );
              })
            ) : (
              <div className="text-muted-foreground text-xs">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
