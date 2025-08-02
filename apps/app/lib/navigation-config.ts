import type { Icon } from '@tabler/icons-react';
import {
  IconBook,
  IconDashboard,
  IconKey,
  IconUser,
} from '@tabler/icons-react';
import { BASE_APP_PATH } from '@/config';

export const getAppRoute = (path: string) => {
  const root = BASE_APP_PATH.startsWith('/')
    ? BASE_APP_PATH
    : `/${BASE_APP_PATH}`;

  if (path === root) {
    return root;
  }

  const destination = path.startsWith('/') ? path : `/${path}`;

  return `${root}${destination}`.replace(/\/$/, '');
};

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
    title: 'Overview',
    url: getAppRoute(BASE_APP_PATH),
    icon: IconDashboard,
  },
  {
    label: 'User',
    title: 'Account',
    url: getAppRoute('/account'),
    icon: IconUser,
  },
  {
    title: 'API Keys',
    url: getAppRoute('/api-keys'),
    icon: IconKey,
  },
  {
    label: 'Resources',
    title: 'Documentation',
    url: '/docs',
    icon: IconBook,
    isExternal: true,
  },
];
