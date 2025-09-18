import type { Icon } from '@tabler/icons-react';
import {
  IconDashboard,
  IconKey,
  // IconLocation,
  IconLogs,
  IconUser,
} from '@tabler/icons-react';
import { BASE_APP_PATH } from '@/config';

export const getAppRoute = (path?: string) => {
  const root = BASE_APP_PATH.startsWith('/')
    ? BASE_APP_PATH
    : `/${BASE_APP_PATH}`;

  if (!path) {
    return root;
  }

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
    title: 'Home',
    url: getAppRoute(BASE_APP_PATH),
    icon: IconDashboard,
  },
  // {
  //   title: 'Playground',
  //   url: getAppRoute('/playground'),
  //   icon: IconLocation,
  // },
  {
    title: 'Logs',
    url: getAppRoute('/logs'),
    icon: IconLogs,
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
];
