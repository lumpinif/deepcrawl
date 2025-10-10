import { resolveGetManyLogsOptions } from '@deepcrawl/contracts/logs/utils';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PlaygroundOperationClientContent } from '@/components/playground/playground-operation-client';
import { PGResponseArea } from '@/components/playground/response-area/pg-response-area';
import { PlaygroundProvider } from '@/contexts/playground-context';
import { getQueryClient } from '@/query/query.client';
import {
  apiKeysQueryOptions,
  authListUserAccountsQueryOptions,
  authPasskeysQueryOptions,
  deviceSessionsQueryOptions,
  getManyLogsQueryOptions,
  listSessionsQueryOptions,
} from '@/query/query-options.server';

export default function DashboardPage() {
  const queryClient = getQueryClient();

  /* Prefetching Logs page data */
  const resolvedOptions = resolveGetManyLogsOptions(); // Resolve once on server
  // Prefetch activity logs data from the home page
  void queryClient.prefetchQuery(getManyLogsQueryOptions(resolvedOptions));

  /* Prefetching Account page data */
  // Don't prefetch current session or organization as they can return null
  void queryClient.prefetchQuery(authPasskeysQueryOptions());
  void queryClient.prefetchQuery(listSessionsQueryOptions());
  void queryClient.prefetchQuery(deviceSessionsQueryOptions());
  void queryClient.prefetchQuery(authListUserAccountsQueryOptions());

  /* Prefetching API Keys page data */
  void queryClient.prefetchQuery(apiKeysQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlaygroundProvider>
        <PlaygroundOperationClientContent />
        <PGResponseArea />
      </PlaygroundProvider>
    </HydrationBoundary>
  );
}
