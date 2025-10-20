import { resolveListLogsOptions } from '@deepcrawl/contracts/logs/utils';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import ActivityLogsDataGrid from '@/components/logs/logs-data-grid';
import { ActivityLogsSkeleton } from '@/components/logs/logs-data-grid-skeleton';
import { LogsPageHeader } from '@/components/logs/logs-page-header';
import { PageContainer } from '@/components/page-elements';
import { LogsProvider } from '@/contexts/logs-provider';
import { getQueryClient } from '@/query/query.client';
import { listLogsQueryOptions } from '@/query/query-options.server';

/* Marked the logs page as dynamic so Next.js doesn't try to prerender it and can safely call headers() at request time - this won't break the React Query SSR prefetching */
export const dynamic = 'force-dynamic';

export default function LogsPage() {
  const queryClient = getQueryClient();

  const resolvedOptions = resolveListLogsOptions();
  void queryClient.prefetchQuery(listLogsQueryOptions(resolvedOptions));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LogsPageHeader />
      <PageContainer>
        <LogsProvider
          initialDateRange={{
            startDate: resolvedOptions.startDate as string,
            endDate: resolvedOptions.endDate as string,
          }}
          key={`${resolvedOptions.startDate}-${resolvedOptions.endDate}`}
        >
          <Suspense fallback={<ActivityLogsSkeleton />}>
            <ActivityLogsDataGrid />
          </Suspense>
        </LogsProvider>
      </PageContainer>
    </HydrationBoundary>
  );
}
