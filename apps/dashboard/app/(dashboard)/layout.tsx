import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { auth } from '@deepcrawl/auth/lib/auth';
import { SidebarInset } from '@deepcrawl/ui/components/ui/sidebar';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Fetch session server-side
  const [session, activeSessions, deviceSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      headers: await headers(),
    }),
    // auth.api.getFullOrganization({
    //   headers: await headers(),
    // }),
    // auth.api.listActiveSubscriptions({
    //   headers: await headers(),
    // }),
  ]).catch((e) => {
    console.log(e);
    throw redirect('/login');
  });

  // Redirect to login if no session
  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <>
      <AppSidebar
        user={session.user}
        session={session}
        deviceSessions={JSON.parse(JSON.stringify(deviceSessions))}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader
            user={session.user}
            sessions={JSON.parse(JSON.stringify(deviceSessions))}
          />
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
