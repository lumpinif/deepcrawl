import { cn } from '@deepcrawl/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import Link from 'next/link';
import { brandName } from '@/lib/brand';

// TODO: CONSIDER CREATE A CUSTOM CSS LAYER SINCE base → components → utilities.
export const DeepcrawlLogoClassNames =
  'font-semibold text-base tracking-tighter' as const;

export function DeepcrawlLogoText({
  className,
  children = brandName,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span className={cn(DeepcrawlLogoClassNames, className)} {...props}>
      {children}
    </span>
  );
}

export interface DeepcrawlLogoLinkProps
  extends Omit<
    React.ComponentProps<typeof Link>,
    'children' | 'className' | 'href'
  > {
  asChild?: false;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface DeepcrawlLogoAsChildProps
  extends Omit<React.ComponentProps<typeof Slot>, 'children' | 'className'> {
  asChild: true;
  className?: string;
  children: React.ReactElement;
}

export type DeepcrawlLogoProps =
  | DeepcrawlLogoLinkProps
  | DeepcrawlLogoAsChildProps;

export function DeepcrawlLogo({ className, ...props }: DeepcrawlLogoProps) {
  const mergedClassName = cn(DeepcrawlLogoClassNames, className);

  if (props.asChild) {
    const { asChild: _asChild, children, ...slotProps } = props;

    return (
      <Slot className={mergedClassName} {...slotProps}>
        {children}
      </Slot>
    );
  }

  const {
    asChild: _asChild,
    href = '/',
    children = brandName,
    ...linkProps
  } = props;

  return (
    <Link className={mergedClassName} href={href} {...linkProps}>
      {children}
    </Link>
  );
}
