import { auth } from '@deepcrawl/auth/lib/auth';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { docsOptions } from '@/lib/layout.config';

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
    <DocsLayout {...docsOptions}>
      <SiteHeader
        user={user}
        enableTitle={false}
        navigationMode="header"
        enableDocsLink={false}
        enableLayoutViewToggle={false}
        deviceSessions={listDeviceSessions}
        className="sticky top-0 z-50 w-full bg-background max-sm:hidden"
      />
      {children}
    </DocsLayout>
  );
}
