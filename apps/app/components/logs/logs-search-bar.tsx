import { Button } from '@deepcrawl/ui/components/ui/button';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Search, X } from 'lucide-react';

interface LogsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export function LogsSearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
}: LogsSearchBarProps) {
  return (
    <div className={className}>
      <div className="relative max-sm:w-full max-sm:flex-1">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="w-full min-w-60 ps-9 pe-9 max-sm:w-full sm:max-w-80"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          value={value}
        />
        {value.length > 0 && (
          <Button
            className="absolute end-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
            onClick={onClear}
            variant="ghost"
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
