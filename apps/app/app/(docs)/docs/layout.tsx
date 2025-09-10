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

  return (
    <DocsLayout {...docsOptions}>
      <SiteHeader
        className="sticky top-0 z-50 w-full bg-background max-sm:hidden"
        deviceSessions={listDeviceSessions}
        enableDocsLink={false}
        enableLayoutViewToggle={false}
        enableTitle={false}
        navigationMode="header"
        session={currentSession}
      />
      {children}
    </DocsLayout>
  );
}
