import AppNavTabs from '@/components/app-nav-tabs';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import type { NavigationMode } from '@/lib/types';
import { auth } from '@deepcrawl/auth/lib/auth';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { SidebarInset } from '@deepcrawl/ui/components/ui/sidebar';
import { cn } from '@deepcrawl/ui/lib/utils';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get session first to check authentication
  const [currentSession, listDeviceSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      headers: await headers(),
    }),
    // auth.api.getFullOrganization({
    // 	headers: await headers(),
    // }),
  ]).catch(() => {
    // Auth failed - redirect to login
    throw redirect('/login');
  });

  // Redirect to login if no session
  if (!currentSession || !currentSession.user) {
    redirect('/login');
  }

  const session = JSON.parse(JSON.stringify(currentSession));
  const deviceSessions = JSON.parse(JSON.stringify(listDeviceSessions));

  // Get navigation mode from cookies
  const cookieStore = await cookies();
  const navigationMode =
    (cookieStore.get('navigation:mode')?.value as NavigationMode) || 'sidebar';

  const defaultInsetClassname = cn(
    '!overflow-hidden !shadow-none border-none !max-h-svh',
    /* desktop */
    'peer-data-[variant=inset]:max-h-[calc(100svh-theme(spacing.4))] peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]',
    /* mobile */
    'max-md:max-h-svh',
  );

  const mainContentContainerClassName = cn('container mx-auto p-4 px-6 pt-0');

  if (navigationMode === 'sidebar') {
    return (
      <>
        <AppSidebar />
        <SidebarInset className={defaultInsetClassname}>
          <SiteHeader user={session.user} deviceSessions={deviceSessions} />
          <ScrollArea className="relative flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
            <div
              className={cn(
                mainContentContainerClassName,
                '2xl:group-has-data-[collapsible=icon]/sidebar-wrapper:px-[8rem]',
              )}
            >
              {children}
            </div>
          </ScrollArea>
        </SidebarInset>
      </>
    );
  }

  // Header navigation mode
  return (
    <div className="min-h-svh w-full">
      <SiteHeader
        user={session.user}
        deviceSessions={deviceSessions}
        className="h-16"
      />
      <AppNavTabs />
      <main className={cn(mainContentContainerClassName, '2xl:px-[8rem]')}>
        <div>{children}</div>
      </main>
    </div>
  );
}
