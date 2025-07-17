'use client';

// import { NavUser } from '@/components/sidebar/nav-user';
// import { TeamSwitcher } from '@/components/sidebar/team-switcher';
import type { Session } from '@deepcrawl/auth/types';
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
} from '@deepcrawl/ui/components/ui/sidebar';
import { GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { NavMain } from '@/components/sidebar/nav-main';
import { NAVGATION_ITEMS } from '@/lib/navigation-config';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session?: Session;
  deviceSessions?: Session[];
}

export function AppSidebar({
  session,
  deviceSessions,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props} className="overflow-x-hidden">
      <SidebarHeader className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <SidebarMenu className="my-auto">
          <SidebarMenuButton
            asChild
            className="data-[slot=sidebar-menu-button]:!p-1.5 cursor-default hover:bg-transparent active:bg-transparent"
          >
            <Link href="/">
              <GalleryVerticalEnd className="!size-5 group-has-data-[collapsible=icon]/sidebar-wrapper:block md:hidden" />
              <span className="font-semibold text-base">Deepcrawl</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="md:pt-2">
        <NavMain items={NAVGATION_ITEMS} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
