import { cn } from '@deepcrawl/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import Link from 'next/link';

// TODO: CONSIDER CREATE A CUSTOM CSS LAYER SINCE base → components → utilities.
export const DeepcrawlLogoClassNames =
  'font-semibold text-base tracking-tighter' as const;

export function DeepcrawlLogoText({
  className,
  children = 'Deepcrawl',
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span className={cn(DeepcrawlLogoClassNames, className)} {...props}>
      {children}
    </span>
  );
}

export interface DeepcrawlLogoProps
  extends Omit<React.ComponentProps<typeof Link>, 'href'> {
  href?: string;
  asChild?: boolean;
  className?: string;
}

export function DeepcrawlLogo({
  className,
  href = '/',
  asChild = false,
  children = 'Deepcrawl',
  ...props
}: DeepcrawlLogoProps) {
  const Comp = asChild ? Slot : href ? Link : 'span';

  return (
    <Comp
      className={cn(DeepcrawlLogoClassNames, className)}
      href={href}
      {...props}
    >
      {children}
    </Comp>
  );
}
