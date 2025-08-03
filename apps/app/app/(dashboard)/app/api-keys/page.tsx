import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import {
  ApiKeysPageClient,
  ApiKeysPageSkeleton,
} from '@/components/api-keys/api-keys-page-client';

import { getQueryClient } from '@/query/query.client';
import { apiKeysQueryOptions } from '@/query/query-options';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
  const queryClient = getQueryClient();

  // Prefetch API keys data
  void queryClient.prefetchQuery(apiKeysQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ApiKeysPageSkeleton />}>
        <ApiKeysPageClient />
      </Suspense>
    </HydrationBoundary>
  );
}
