import { NAVGATION_ITEMS } from './navigation-config';

export const siteConfig = {
  name: 'Deepcrawl',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://deepcrawl.dev',
  // ogImage: "https://deepcrawl.dev/og.jpg",
  description:
    'Deepcrawl is a 100% free, no-pricing, and fully open-source toolkit for agents to make any website data AI ready.',
  links: {
    twitter: 'https://twitter.com/felixlu1018',
    github: 'https://github.com/lumpinif/deepcrawl',
  },
  navItems: NAVGATION_ITEMS,
};

export const META_THEME_COLORS = {
  light: '#fafafa',
  dark: '#000000',
};
