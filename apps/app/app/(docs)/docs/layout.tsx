import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { fetchAuthSession, fetchDeviceSessions } from '@/app/actions/auth';
import { SiteHeader } from '@/components/site-header';
import { docsOptions } from '@/lib/layout.config';

export default async function Layout({ children }: { children: ReactNode }) {
  const [currentSession, listDeviceSessions] = await Promise.all([
    fetchAuthSession(),
    fetchDeviceSessions(),
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
