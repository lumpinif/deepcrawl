import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { SidebarInset } from '@deepcrawl/ui/components/ui/sidebar';
import { cn } from '@deepcrawl/ui/lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { HeaderNavigationLayout } from '@/components/layout/header-navigation-layout';
import type { NavigationMode } from '@/components/providers';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { authGetSession } from '@/query/auth-query.server';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // KNOWN ISSUE: DO NOT FETCH listDeviceSessions FROM ANY LAYOUT SERVER COMPONENT WHICH IS BREAKING MULTI-SESSION DATA FETCHING FROM CLIENT COMPONENT AND SESSION REVOKING ISSUES
  const currentSession = await authGetSession().catch(() => {
    // Auth failed - redirect to login
    throw redirect('/login');
  });

  // Redirect to login if no session
  if (!currentSession?.user) {
    redirect('/login');
  }

  // Get navigation mode from cookies
  const cookieStore = await cookies();
  const navigationMode =
    (cookieStore.get('navigation:mode')?.value as NavigationMode) || 'header';

  const defaultInsetClassname = cn(
    '!overflow-hidden !shadow-none !max-h-svh border-none',
    /* desktop */
    'peer-data-[variant=inset]:max-h-[calc(100svh-theme(spacing.4))] peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]',
    /* mobile */
    'max-md:max-h-svh',
  );

  if (navigationMode === 'sidebar') {
    return (
      <>
        <AppSidebar />
        <SidebarInset className={defaultInsetClassname}>
          <SiteHeader
            enableThemeToggle={false}
            navigationMode={navigationMode}
            session={currentSession}
          />
          <ScrollArea className="relative flex min-h-0 flex-1 flex-col">
            {children}
          </ScrollArea>
        </SidebarInset>
      </>
    );
  }

  // Header navigation mode
  return (
    <HeaderNavigationLayout
      defaultInsetClassname={defaultInsetClassname}
      navigationMode={navigationMode}
      SiteHeaderSlot={
        <SiteHeader
          className={cn(
            'absolute top-0 right-0 left-0 z-50 transition-transform duration-100 ease-in-out will-change-transform',
            // shouldHideHeader && '-translate-y-full',
          )}
          enableThemeToggle={false}
          navigationMode={navigationMode}
          session={currentSession}
        />
      }
    >
      {children}
    </HeaderNavigationLayout>
  );
}
