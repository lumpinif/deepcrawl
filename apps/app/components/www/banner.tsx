import { cn } from '@deepcrawl/ui/lib/utils';

export function Banner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        '!border-b-0 !border-none h-12 w-full md:h-16 lg:h-18',
        className,
      )}
    />
  );
}
