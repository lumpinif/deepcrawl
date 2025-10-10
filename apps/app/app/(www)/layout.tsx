import { Button } from '@deepcrawl/ui/components/ui/button';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';
import { type ReactNode, Suspense } from 'react';
import { UserDropdownSkeleton } from '@/components/user/user-dropdown';
import { UserDropdownServer } from '@/components/user/user-dropdown-server';
import { baseOptions } from '@/lib/layout.config';
import { authGetSession } from '@/query/auth-query.server';

export default async function Layout({ children }: { children: ReactNode }) {
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
          children: user ? (
            <Suspense fallback={<UserDropdownSkeleton />}>
              <UserDropdownServer
                currentSession={currentSession}
                enableLayoutViewToggle={false}
                redirectLogout="/"
              />
            </Suspense>
          ) : (
            <>
              <Button asChild className="ml-2 max-md:hidden" variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Link className="ml-1 md:hidden" href="/login">
                Login
              </Link>
            </>
          ),
        },
      ]}
      themeSwitch={{
        enabled: false,
      }}
    >
      {children}
    </HomeLayout>
  );
}
