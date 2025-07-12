import type { Icon } from '@tabler/icons-react';
import {
  IconBook,
  IconDashboard,
  IconKey,
  IconUser,
} from '@tabler/icons-react';

export interface NavigationItem {
  label?: string;
  title: string;
  url: string;
  icon?: Icon;
  isExternal?: boolean;
}

export const NAVGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    title: 'Home',
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
    label: 'Resources',
    title: 'Documentation',
    url: '/',
    icon: IconBook,
    isExternal: true,
  },
];
