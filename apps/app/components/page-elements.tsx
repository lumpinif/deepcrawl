import { cn } from '@deepcrawl/ui/lib/utils';

export const baseContainerCN = 'container mx-auto px-6 2xl:px-[6rem]' as const;

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        'flex flex-col gap-4 pb-6 sm:gap-6 xl:pb-8 2xl:pb-10',
        baseContainerCN,
        className,
      )}
    >
      {children}
    </main>
  );
}

export function PageTitle({
  title,
  className,
  description,
  titleSize,
  desPos = 'bottom',
}: {
  title: string;
  description?: string;
  desPos?: 'top' | 'bottom';
  titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
} & React.HTMLAttributes<HTMLDivElement>) {
  const titleSizeCN = titleSize ? `text-${titleSize}` : 'text-3xl';
  return (
    <div className={cn('my-2 w-full', className)}>
      {description && desPos === 'top' && (
        <p className="text-muted-foreground">{description}</p>
      )}
      <h1 className={cn('font-semibold', titleSizeCN)}>{title}</h1>
      {description && desPos === 'bottom' && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  children,
  className,
  description,
  titleClassName,
  containerClassName,
}: {
  title: string;
  description?: string;
  titleClassName?: string;
  children?: React.ReactNode;
  containerClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-8 border-b py-8 md:mb-10 md:py-10', className)}>
      <div className={cn(baseContainerCN, containerClassName)}>
        <PageTitle
          className={cn('my-0', titleClassName)}
          description={description}
          title={title}
        />
        {children}
      </div>
    </div>
  );
}
