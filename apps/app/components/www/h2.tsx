import { cn } from '@deepcrawl/ui/lib/utils';

export function H2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'mb-4 font-medium text-2xl text-primary md:text-3xl',
        className,
      )}
    >
      {children}
    </h2>
  );
}
