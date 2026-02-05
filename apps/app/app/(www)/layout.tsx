import GithubIcon from '@deepcrawl/ui/components/icons/github-icon';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';
import { type ReactNode, Suspense } from 'react';
import UserActions from '@/components/user/user-actions';
import { UserDropdownSkeleton } from '@/components/user/user-dropdown';
import { baseOptions } from '@/lib/layout.config';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HomeLayout
      {...baseOptions}
      links={[
        {
          text: 'Playground',
          url: '/app',
        },
        {
          text: 'Docs',
          url: '/docs',
        },
        {
          type: 'custom',
          secondary: true,
          children: (
            <Link
              aria-label="GitHub"
              className="mr-1 inline-flex items-center justify-center rounded-md p-2"
              href="https://github.com/lumpinif/deepcrawl"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GithubIcon />
            </Link>
          ),
        },
        {
          type: 'custom',
          secondary: true,
          children: (
            <Suspense fallback={<UserDropdownSkeleton />}>
              <UserActions />
            </Suspense>
          ),
        },
      ]}
      themeSwitch={{
        enabled: true,
      }}
    >
      {children}
    </HomeLayout>
  );
}
