import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import ActivityLogsDataGrid from '@/components/logs/logs-data-grid';
import { ActivityLogsSkeleton } from '@/components/logs/logs-data-grid-skeleton';
import { PageContainer, PageHeader } from '@/components/page-elements';
import { LogsProvider } from '@/contexts/logs-provider';
import { getQueryClient } from '@/query/query.client';
import { getManyLogsQueryOptions } from '@/query/query-options.server';

/* Marked the logs page as dynamic so Next.js doesn't try to prerender it and can safely call headers() at request time - this won't break the React Query SSR prefetching */
export const dynamic = 'force-dynamic';

export default function LogsPage() {
  const queryClient = getQueryClient();

  // Prefetch activity logs data
  void queryClient.prefetchQuery(getManyLogsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader
        description="Check out your recent request activity logs"
        title="Activity Logs"
      />
      <PageContainer>
        <LogsProvider>
          <Suspense fallback={<ActivityLogsSkeleton />}>
            <ActivityLogsDataGrid />
          </Suspense>
        </LogsProvider>
      </PageContainer>
    </HydrationBoundary>
  );
}
