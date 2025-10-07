import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import ActivityLogsDataGrid from '@/components/logs/logs-data-grid';
import { ActivityLogsSkeletonFallback } from '@/components/logs/logs-skeleton-fallback';
import { PageContainer, PageHeader } from '@/components/page-elements';
import { getQueryClient } from '@/query/query.client';
import { getManyLogsQueryOptions } from '@/query/query-options.server';

/* Marked the logs page as dynamic and disabled fetch caching so Next.js doesn't try to prerender it and can safely call headers() at request time */
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

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
        <Suspense fallback={<ActivityLogsSkeletonFallback />}>
          <ActivityLogsDataGrid />
        </Suspense>
      </PageContainer>
    </HydrationBoundary>
  );
}
