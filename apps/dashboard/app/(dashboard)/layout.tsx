import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { userQueryKeys } from '@/hooks/auth.hooks';
import { makeQueryClient } from '@/lib/query.client';
import { auth } from '@deepcrawl/auth/lib/auth';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { SidebarInset } from '@deepcrawl/ui/components/ui/sidebar';
import { cn } from '@deepcrawl/ui/lib/utils';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = makeQueryClient();

  // Fetch session server-side
  const [session, activeSessions, deviceSessions] = await Promise.all([
    // Prefetch current session
    queryClient.fetchQuery({
      queryKey: userQueryKeys.session,
      queryFn: async () => {
        const result = await auth.api.getSession({
          headers: await headers(),
        });
        // Use JSON serialization pattern from Better Auth demo
        return JSON.parse(JSON.stringify(result));
      },
    }),

    // Prefetch user's active sessions -The listSessions function returns a list of sessions that are active for the user.
    queryClient.fetchQuery({
      queryKey: userQueryKeys.listSessions,
      queryFn: async () => {
        const result = await auth.api.listSessions({
          headers: await headers(),
        });
        // Use JSON serialization pattern from Better Auth demo
        return JSON.parse(JSON.stringify(result));
      },
    }),

    // Prefetch device sessions for account switching
    queryClient.fetchQuery({
      queryKey: userQueryKeys.deviceSessions,
      queryFn: async () => {
        const result = await auth.api.listDeviceSessions({
          headers: await headers(),
        });
        // Use JSON serialization pattern from Better Auth demo
        return JSON.parse(JSON.stringify(result));
      },
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

  const defaultInsetClassname = cn(
    '!overflow-hidden !shadow-none border-none !max-h-svh',
    /* desktop */
    'peer-data-[variant=inset]:max-h-[calc(100svh-theme(spacing.4))] peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]',
    /* mobile */
    'max-md:max-h-svh',
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppSidebar
        session={session}
        deviceSessions={JSON.parse(JSON.stringify(deviceSessions))}
      />
      <SidebarInset className={defaultInsetClassname}>
        <SiteHeader
          user={session.user}
          deviceSessions={JSON.parse(JSON.stringify(deviceSessions))}
        />
        <div className="relative z-50 flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <ScrollArea className="relative flex min-h-0 flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6">
            {children}
          </ScrollArea>
        </div>
      </SidebarInset>
    </HydrationBoundary>
  );
}
