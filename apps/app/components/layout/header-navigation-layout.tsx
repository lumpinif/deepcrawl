'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import useScrollPosition from '@react-hook/window-scroll';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement, useMemo } from 'react';
import AppNavTabs from '@/components/app-nav-tabs';
import type { NavigationMode } from '@/components/providers';
import { useDeployAttributionBannerOffsetPx } from '../deploy-attribution-banner';
import type { SiteHeaderProps } from '../site-header';

interface HeaderNavigationLayoutProps {
  children: ReactNode;
  navigationMode: NavigationMode;
  SiteHeaderSlot: ReactNode;
  shouldHideAuthEntries?: boolean;
}

const useRange = (
  num: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  const mappedValue = useMemo(() => {
    const newValue =
      ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    const largest = Math.max(outMin, outMax);
    const smallest = Math.min(outMin, outMax);
    return Math.min(Math.max(newValue, smallest), largest);
  }, [num, inMin, inMax, outMin, outMax]);

  return mappedValue;
};

export function HeaderNavigationLayout({
  children,
  navigationMode,
  SiteHeaderSlot,
  shouldHideAuthEntries,
}: HeaderNavigationLayoutProps) {
  const bannerOffset = useDeployAttributionBannerOffsetPx({
    assumeRendered: true,
  });

  const y = useScrollPosition(60);
  const navX = useRange(y, 0, 50 + bannerOffset, 0, 85);
  const logoTransformY = useRange(
    y,
    0,
    50 + bannerOffset,
    20 + bannerOffset,
    9,
  );
  const logoScale = useRange(y, 0, 50 + bannerOffset, 1, 0.85);

  const clonedHeader = cloneElement(
    SiteHeaderSlot as ReactElement<SiteHeaderProps>,
    {
      logoScale: logoScale,
      logoTransformY: logoTransformY,
    },
  );

  return (
    <main
      className={cn(
        'group/header-nav-layout relative flex w-full flex-1 flex-col bg-background',
      )}
      data-nav-mode={navigationMode === 'header' ? 'header' : 'sidebar'}
    >
      {clonedHeader}

      {/* @ DEPRECATED: Add spacing for absolute header only when visible */}
      {/* <div
          className={cn(
            'bg-background-subtle transition-all duration-100 ease-in-out',
            shouldHideHeader ? 'h-0' : 'h-14',
          )}
        /> */}

      {/* Sticky nav tabs */}
      <AppNavTabs hideAuthEntries={shouldHideAuthEntries} transFormX={navX} />

      {/* @ DEPRECATED: <ScrollArea
        className={cn('relative flex min-h-0 flex-1 flex-col')}
        viewportRef={viewportRef}
      > */}
      <div className="sm:scrollbar-thin relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </div>
      {/* </ScrollArea> */}
    </main>
  );
}
