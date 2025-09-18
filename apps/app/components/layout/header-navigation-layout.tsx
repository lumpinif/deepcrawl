'use client';

import type { ListDeviceSessions, Session } from '@deepcrawl/auth/types';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import AppNavTabs from '@/components/app-nav-tabs';
import type { NavigationMode } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import { useHeaderScroll } from '@/hooks/use-header-scroll';

interface HeaderNavigationLayoutProps {
  children: ReactNode;
  session: Session;
  deviceSessions: ListDeviceSessions;
  navigationMode: NavigationMode;
  defaultInsetClassname: string;
}

/** **********************************************************************************************
 * SOCIAL: Note: A little performance overhead expected to be noticed but it's not a big deal in overall
 * I am using this approach to experiment with scrolling detection from ScrollArea to animate the header instead of native `overflow-y-auto` approach which natively more performant however the scrollbar will be extended full page to block certain part of the site header which is not beautiful.
 * If you have any better approaches, PR is always welcome!!
 * **********************************************************************************************/

export function HeaderNavigationLayout({
  children,
  session,
  deviceSessions,
  navigationMode,
  defaultInsetClassname,
}: HeaderNavigationLayoutProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const { shouldHideHeader } = useHeaderScroll({
    viewportRef,
  });

  return (
    <main
      className={cn(
        'relative flex w-full flex-1 flex-col bg-background',
        defaultInsetClassname,
      )}
    >
      <div className="relative">
        <SiteHeader
          className={cn(
            'absolute top-0 right-0 left-0 z-50 h-16 transition-transform duration-100 ease-in-out will-change-transform',
            shouldHideHeader && '-translate-y-full',
          )}
          deviceSessions={deviceSessions}
          enableThemeToggle={false}
          navigationMode={navigationMode}
          session={session}
        />

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
        className="relative flex min-h-0 flex-1 flex-col gap-4 md:gap-6"
        viewportRef={viewportRef}
      >
        {children}
      </ScrollArea>
    </main>
  );
}
