import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { docsOptions } from '@/lib/layout.config';
import { authGetSession } from '@/query/auth-query.server';

export default async function Layout({ children }: { children: ReactNode }) {
  const currentSession = await authGetSession();

  return (
    <DocsLayout {...docsOptions}>
      <SiteHeader
        className="sticky top-0 z-50 w-full bg-background max-sm:hidden"
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
