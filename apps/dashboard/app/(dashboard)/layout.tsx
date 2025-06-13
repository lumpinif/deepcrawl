import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { auth } from '@deepcrawl/auth/lib/auth';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { SidebarInset } from '@deepcrawl/ui/components/ui/sidebar';
import { cn } from '@deepcrawl/ui/lib/utils';
import { headers } from 'next/headers';
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
  ]).catch((e) => {
    console.log(e);
    throw redirect('/login');
  });

  // Redirect to login if no session
  if (!currentSession || !currentSession.user) {
    redirect('/login');
  }

  const session = JSON.parse(JSON.stringify(currentSession));

  const defaultInsetClassname = cn(
    '!overflow-hidden !shadow-none border-none !max-h-svh',
    /* desktop */
    'peer-data-[variant=inset]:max-h-[calc(100svh-theme(spacing.4))] peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]',
    /* mobile */
    'max-md:max-h-svh',
  );

  return (
    <>
      <AppSidebar
        session={session}
        deviceSessions={JSON.parse(JSON.stringify(listDeviceSessions))}
      />
      <SidebarInset className={defaultInsetClassname}>
        <SiteHeader
          user={session.user}
          deviceSessions={JSON.parse(JSON.stringify(listDeviceSessions))}
        />
        <div className="relative z-50 flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <ScrollArea className="relative flex min-h-0 flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6">
            {children}
          </ScrollArea>
        </div>
      </SidebarInset>
    </>
  );
}
