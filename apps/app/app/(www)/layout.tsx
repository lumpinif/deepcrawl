import { auth } from '@deepcrawl/auth/lib/auth';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { headers } from 'next/headers';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { UserDropdown } from '@/components/user/user-dropdown';
import { baseOptions } from '@/lib/layout.config';

export default async function Layout({ children }: { children: ReactNode }) {
  const requestHeaders = new Headers(await headers());
  const [currentSession, listDeviceSessions] = await Promise.all([
    auth.api.getSession({
      headers: requestHeaders,
    }),
    auth.api.listDeviceSessions({
      headers: requestHeaders,
    }),
  ]);

  const user = currentSession?.user;

  return (
    <HomeLayout
      {...baseOptions}
      themeSwitch={{
        enabled: false,
      }}
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
            <div className="ml-2 flex items-center">
              <UserDropdown
                user={user}
                redirectLogout="/"
                enableLayoutViewToggle={false}
                deviceSessions={listDeviceSessions}
              />
            </div>
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
    >
      {children}
    </HomeLayout>
  );
}
