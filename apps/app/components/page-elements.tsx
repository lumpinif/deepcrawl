import { cn } from '@deepcrawl/ui/lib/utils';
import {
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
} from 'react';

export const baseContainerCN = 'container mx-auto px-6 2xl:px-[6rem]' as const;

type PageContainerProps = PropsWithChildren<HTMLAttributes<HTMLElement>>;

export function PageContainer({
  children,
  className,
  ...rest
}: PageContainerProps) {
  return (
    <main
      {...rest}
      className={cn(
        'flex h-full min-h-svh flex-col gap-4 pb-6 sm:gap-6 xl:pb-8 2xl:pb-10',
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
  children,
  desPos = 'bottom',
  titleClassName,
}: {
  title:
    | string
    | ReactElement
    | React.ReactElement<React.HTMLAttributes<HTMLElement | HTMLAnchorElement>>;
  description?: string;
  desPos?: 'top' | 'bottom';
  titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  titleClassName?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const titleSizeCN = titleSize
    ? `text-${titleSize}`
    : 'text-3xl max-sm:text-2xl';

  const renderTitle = () => {
    if (typeof title === 'string') {
      return (
        <h1
          className={cn(
            'text-wrap break-words font-semibold',
            titleSizeCN,
            titleClassName,
          )}
        >
          {title}
        </h1>
      );
    }

    const el = title as ReactElement<
      React.HTMLAttributes<HTMLElement | HTMLAnchorElement>
    >;

    if (isValidElement(title)) {
      return cloneElement<
        React.HTMLAttributes<HTMLElement | HTMLAnchorElement>
      >(el, {
        className: cn(
          'text-wrap break-words font-semibold',
          titleSizeCN,
          titleClassName,
          el.props.className,
        ),
      });
    }

    return title;
  };

  return (
    <div className={cn('my-2 w-full', className)}>
      {description && desPos === 'top' && (
        <p className="text-muted-foreground">{description}</p>
      )}
      {desPos === 'bottom' && children}
      {renderTitle()}
      {description && desPos === 'bottom' && (
        <p className="text-muted-foreground">{description}</p>
      )}
      {desPos === 'top' && children}
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
  label,
}: {
  title:
    | string
    | ReactElement
    | React.ReactElement<React.HTMLAttributes<HTMLElement | HTMLAnchorElement>>;
  description?: string;
  titleClassName?: string;
  children?: React.ReactNode;
  containerClassName?: string;
  label?: string | React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-8 border-b py-8 md:mb-10 md:py-10', className)}>
      <div
        className={cn(
          baseContainerCN,
          'flex justify-between max-sm:flex-col max-sm:gap-y-4 sm:items-center',
          containerClassName,
        )}
      >
        <div className="[&:has(>:nth-child(2))]:flex [&:has(>:nth-child(2))]:flex-col [&:has(>:nth-child(2))]:gap-1">
          {label && label}
          <PageTitle
            className={cn('my-0', titleClassName)}
            description={description}
            title={title}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
