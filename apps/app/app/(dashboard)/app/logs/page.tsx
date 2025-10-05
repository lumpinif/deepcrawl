import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ActivityLogsClient } from '@/components/logs/activity-logs.client';
import { getQueryClient } from '@/query/query.client';
import { activityLogsQueryOptions } from '@/query/query-options.server';

export default function LogsPage() {
  const queryClient = getQueryClient();

  // Prefetch activity logs data
  void queryClient.prefetchQuery(activityLogsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={'...loading'}>
        <ActivityLogsClient />
      </Suspense>
    </HydrationBoundary>
  );
}
