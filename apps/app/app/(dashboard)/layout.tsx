import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import {
  SidebarInset,
  SidebarProvider,
} from '@deepcrawl/ui/components/ui/sidebar';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';
import { HeaderNavigationLayout } from '@/components/layout/header-navigation-layout';
import { DashboardLayoutSkeleton } from '@/components/playground/playground-skeleton';
import type { NavigationMode } from '@/components/providers';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { authGetSession } from '@/query/auth-query.server';

const title = 'Dashboard';
const description = 'Dashboard and Playground for Deepcrawl';

export const metadata: Metadata = {
  title,
  description,
  // openGraph: {
  //   images: [
  //     {
  //       url: `/og?title=${encodeURIComponent(
  //         title
  //       )}&description=${encodeURIComponent(description)}`,
  //     },
  //   ],
  // },
  twitter: {
    card: 'summary_large_image',
    // images: [
    //   {
    //     url: `/og?title=${encodeURIComponent(
    //       title
    //     )}&description=${encodeURIComponent(description)}`,
    //   },
    // ],
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

async function DashboardLayoutContent({ children }: { children: ReactNode }) {
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

  // Get sidebar state from cookies
  const sidebarState = cookieStore.get('sidebar:state')?.value;
  const sidebarWidth = cookieStore.get('sidebar:width')?.value;

  let defaultSidebarOpen = false;
  if (sidebarState) {
    defaultSidebarOpen = sidebarState === 'true';
  }

  const defaultInsetClassname = cn(
    '!overflow-hidden !shadow-none !max-h-svh border-none',
    /* desktop */
    'peer-data-[variant=inset]:max-h-[calc(100svh-theme(spacing.4))] peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]',
  );

  if (navigationMode === 'sidebar') {
    return (
      <SidebarProvider
        defaultOpen={defaultSidebarOpen}
        defaultWidth={sidebarWidth}
      >
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
      </SidebarProvider>
    );
  }

  // Header navigation mode
  return (
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      defaultWidth={sidebarWidth}
    >
      <HeaderNavigationLayout
        navigationMode={navigationMode}
        SiteHeaderSlot={
          <SiteHeader
            enableThemeToggle={false}
            navigationMode={navigationMode}
            session={currentSession}
          />
        }
      >
        {children}
      </HeaderNavigationLayout>
    </SidebarProvider>
  );
}
