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
        'mb-4 font-bold text-2xl text-primary tracking-tight md:text-3xl lg:text-4xl',
        className,
      )}
    >
      {children}
    </h2>
  );
}
