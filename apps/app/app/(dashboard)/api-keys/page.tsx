import {
  ApiKeysPageClient,
  ApiKeysPageSkeleton,
} from '@/components/api-keys/api-keys-page-client';
import { apiKeysQueryOptions } from '@/lib/query-options';
import { getQueryClient } from '@/lib/query.client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export default async function ApiKeysPage() {
  const queryClient = getQueryClient();

  // Prefetch API keys data
  queryClient.prefetchQuery(apiKeysQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ApiKeysPageSkeleton />}>
        <ApiKeysPageClient />
      </Suspense>
    </HydrationBoundary>
  );
}
