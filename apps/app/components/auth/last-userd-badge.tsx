'use client';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { cn } from '@deepcrawl/ui/lib/utils';
import React from 'react';
import { useIsHydrated } from '@/hooks/use-hydrated';

type LastUsedBadgeProps = React.ComponentProps<typeof Badge>;

export function LastUsedBadge({ className, ...props }: LastUsedBadgeProps) {
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return null;
  }

  return (
    <Badge
      className={cn(
        'absolute right-3 text-muted-foreground text-xs transition-colors duration-150 group-hover:text-foreground',
        className,
      )}
      variant={props.variant || 'secondary'}
      {...props}
    >
      Last used
    </Badge>
  );
}
