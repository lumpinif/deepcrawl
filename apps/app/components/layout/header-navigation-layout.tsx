'use client';

import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import AppNavTabs from '@/components/app-nav-tabs';
import type { NavigationMode } from '@/components/providers';
import { useHeaderScroll } from '@/hooks/use-header-scroll';

interface HeaderNavigationLayoutProps {
  children: ReactNode;
  navigationMode: NavigationMode;
  defaultInsetClassname: string;
  SiteHeaderSlot: ReactNode;
}

/** **********************************************************************************************
 * SOCIAL: Note: A little performance overhead expected to be noticed but it's not a big deal in overall
 * I am using this approach to experiment with scrolling detection from ScrollArea to animate the header instead of native `overflow-y-auto` approach which natively more performant however the scrollbar will be extended full page to block certain part of the site header which is not beautiful.
 * If you have any better approaches, PR is always welcome!!
 * **********************************************************************************************/

export function HeaderNavigationLayout({
  children,
  navigationMode,
  defaultInsetClassname,
  SiteHeaderSlot,
}: HeaderNavigationLayoutProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const { shouldHideHeader } = useHeaderScroll({
    viewportRef,
  });

  return (
    <main
      className={cn(
        'group/header-nav-layout relative flex w-full flex-1 flex-col bg-background',
        defaultInsetClassname,
      )}
      data-nav-mode={navigationMode === 'header' ? 'header' : 'sidebar'}
    >
      <div className="relative">
        {SiteHeaderSlot}

        {/* Add spacing for absolute header only when visible */}
        <div
          className={cn(
            'bg-background-subtle transition-all duration-100 ease-in-out',
            shouldHideHeader ? 'h-0' : 'h-14',
          )}
        />

        {/* AppNavTabs positioned right after header with no gap */}
        <AppNavTabs />
      </div>

      <ScrollArea
        className={cn('relative flex min-h-0 flex-1 flex-col')}
        viewportRef={viewportRef}
      >
        {children}
      </ScrollArea>
    </main>
  );
}
