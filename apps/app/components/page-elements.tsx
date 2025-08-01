import { cn } from '@deepcrawl/ui/lib/utils';

const baseContainerCN = 'container mx-auto px-6 2xl:px-[8rem]';

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
  titleSize = '3xl',
}: {
  title: string;
  description?: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
} & React.HTMLAttributes<HTMLDivElement>) {
  const defaultTitleSize = '3xl';
  return (
    <div className={cn('my-2 w-full', className)}>
      <h1
        className={cn('font-semibold', `text-${titleSize || defaultTitleSize}`)}
      >
        {title}
      </h1>
      {description && <p className="text-muted-foreground">{description}</p>}
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
          title={title}
          description={description}
          className={cn('my-0', titleClassName)}
        />
        {children}
      </div>
    </div>
  );
}
