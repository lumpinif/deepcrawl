import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { SidebarInset } from '@deepcrawl/ui/components/ui/sidebar';
import { cn } from '@deepcrawl/ui/lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import AppNavTabs from '@/components/app-nav-tabs';
import type { NavigationMode } from '@/components/providers';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { fetchAuthSession, fetchDeviceSessions } from '../actions/auth';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // TODO: CONSIDER MIGRATING TO REACT QUERY ADVANCED SSR PATTERN
  // Get session first to check authentication
  const [currentSession, listDeviceSessions] = await Promise.all([
    fetchAuthSession(),
    fetchDeviceSessions(),
    // auth.api.getFullOrganization({
    // 	headers: requestHeaders,
    // }),
  ]).catch(() => {
    // Auth failed - redirect to login
    throw redirect('/login');
  });

  // Redirect to login if no session
  if (!currentSession || !currentSession.user) {
    redirect('/login');
  }

  // Get navigation mode from cookies
  const cookieStore = await cookies();
  const navigationMode =
    (cookieStore.get('navigation:mode')?.value as NavigationMode) || 'header';

  const defaultInsetClassname = cn(
    '!overflow-hidden !shadow-none border-none !max-h-svh',
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
            user={currentSession.user}
            navigationMode={navigationMode}
            deviceSessions={listDeviceSessions}
          />
          <ScrollArea className="relative flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
            {children}
          </ScrollArea>
        </SidebarInset>
      </>
    );
  }

  // Header navigation mode
  return (
    <div className="min-h-svh w-full">
      <SiteHeader
        className="h-16"
        enableThemeToggle={false}
        user={currentSession.user}
        navigationMode={navigationMode}
        deviceSessions={listDeviceSessions}
      />
      <AppNavTabs />
      {children}
    </div>
  );
}
