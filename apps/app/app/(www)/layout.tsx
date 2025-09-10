import { Button } from '@deepcrawl/ui/components/ui/button';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { UserDropdown } from '@/components/user/user-dropdown';
import { baseOptions } from '@/lib/layout.config';
import {
  authGetSession,
  authListDeviceSessions,
} from '@/query/auth-query.server';

export default async function Layout({ children }: { children: ReactNode }) {
  const [currentSession, listDeviceSessions] = await Promise.all([
    authGetSession(),
    authListDeviceSessions(),
  ]);

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
            <div className="ml-2 flex items-center">
              <UserDropdown
                deviceSessions={listDeviceSessions}
                enableLayoutViewToggle={false}
                redirectLogout="/"
                session={currentSession}
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
      themeSwitch={{
        enabled: false,
      }}
    >
      {children}
    </HomeLayout>
  );
}
