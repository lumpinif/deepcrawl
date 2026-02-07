import { OFFICIAL_APP_URL } from '@deepcrawl/runtime/urls';
import type { Icon } from '@tabler/icons-react';
import {
  IconBook,
  IconDashboard,
  IconKey,
  // IconLocation,
  IconLogs,
  IconUser,
} from '@tabler/icons-react';
import { BASE_APP_PATH } from '@/config';

export function absoluteUrl(path: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? OFFICIAL_APP_URL;
  return `${appUrl}${path}`;
}

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
    label: 'Playground',
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
    title: 'API Keys',
    url: getAppRoute('/api-keys'),
    icon: IconKey,
  },
  {
    label: 'User',
    title: 'Account',
    url: getAppRoute('/account'),
    icon: IconUser,
  },
  {
    label: 'Docs',
    title: 'Docs',
    url: '/docs',
    icon: IconBook,
  },
];

export const getNavigationItems = ({
  hideAuthEntries,
}: {
  hideAuthEntries?: boolean;
} = {}) => {
  if (!hideAuthEntries) {
    return NAVGATION_ITEMS;
  }

  const accountRoute = getAppRoute('/account');
  const apiKeysRoute = getAppRoute('/api-keys');

  return NAVGATION_ITEMS.filter(
    (item) => item.url !== accountRoute && item.url !== apiKeysRoute,
  );
};
