'use client';

import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from 'lucide-react';

import {
  IconBook,
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconKey,
  IconListDetails,
  IconPlayerPlay,
  IconSettings,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';

import * as React from 'react';

import { NavMain } from '@/components/sidebar/nav-main';
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
import Link from 'next/link';

// This is sample data.
const data = {
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      label: 'Dashboard',
      title: 'Overview',
      url: '/',
      icon: IconDashboard,
    },
    {
      label: 'User',
      title: 'Account',
      url: '/account',
      icon: IconUser,
    },
    {
      title: 'API Keys',
      url: '/api-keys',
      icon: IconKey,
    },
    {
      label: 'Playground',
      title: 'Playground',
      url: '/',
      icon: IconPlayerPlay,
    },
    {
      label: 'Resources',
      title: 'Documentation',
      url: 'https://deepcrawl.com/docs',
      icon: IconBook,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: Session['user'];
  session: Session;
  deviceSessions: Session[];
}

export function AppSidebar({
  user,
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
