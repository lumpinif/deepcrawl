import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { docsOptions } from '@/lib/layout.config';
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
