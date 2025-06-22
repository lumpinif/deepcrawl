import type { Icon } from '@tabler/icons-react';
import {
  IconBook,
  IconDashboard,
  IconKey,
  IconPlayerPlay,
  IconUser,
} from '@tabler/icons-react';

export interface NavigationItem {
  label?: string;
  title: string;
  url: string;
  icon?: Icon;
  isExternal?: boolean;
}

export const navigationItems: NavigationItem[] = [
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
    url: '/playground',
    icon: IconPlayerPlay,
  },
  {
    label: 'Resources',
    title: 'Documentation',
    url: 'https://deepcrawl.com/docs',
    icon: IconBook,
    isExternal: true,
  },
];
