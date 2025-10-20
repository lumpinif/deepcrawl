import GithubIcon from '@deepcrawl/ui/components/icons/github-icon';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { UserDropdown } from '@/components/user/user-dropdown';
import { baseOptions } from '@/lib/layout.config';
import { authGetSession } from '@/query/auth-query.server';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentSession = await authGetSession();
  const user = currentSession?.user;

  return (
    <HomeLayout
      {...baseOptions}
      links={[
        {
          text: 'Dashboard',
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
          children: user ? (
            <UserDropdown
              // className="md:mt-1.5"
              enableLayoutViewToggle={false}
              redirectLogout={'/'}
              session={currentSession}
            />
          ) : (
            <Button asChild className="ml-1" size={'sm'} variant="outline">
              <Link href="/login">Login</Link>
            </Button>
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
