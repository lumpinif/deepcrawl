import { resolveListLogsOptions } from '@deepcrawl/contracts/logs/utils';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import ActivityLogsDataGrid from '@/components/logs/logs-data-grid';
import { ActivityLogsSkeleton } from '@/components/logs/logs-data-grid-skeleton';
import { LogsPageHeader } from '@/components/logs/logs-page-header';
import { PageContainer } from '@/components/page-elements';
import { LogsProvider } from '@/contexts/logs-provider';
import { getQueryClient } from '@/query/query.client';
import { listLogsQueryOptions } from '@/query/query-options.server';

// Force dynamic rendering so we can safely prefetch logs without tripping Next 16 cache heuristics.
export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';

export default async function LogsPage() {
  const queryClient = getQueryClient();

  let requestContextAvailable = false;
  try {
    headers();
    requestContextAvailable = true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[LogsPage] No request context detected during build. Skipping prefetch.',
        error,
      );
    }
  }

  const resolvedOptions = resolveListLogsOptions();

  if (requestContextAvailable) {
    try {
      await queryClient.prefetchQuery(listLogsQueryOptions(resolvedOptions));
    } catch (error) {
      console.error(
        '[LogsPage] Prefetch failed, falling back to client fetch:',
        error,
      );
    }
  }

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
