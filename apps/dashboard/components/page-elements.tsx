import { cn } from '@deepcrawl/ui/lib/utils';

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('my-8 md:my-14', className)}>
      <h1 className="mb-4 font-bold text-3xl">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
