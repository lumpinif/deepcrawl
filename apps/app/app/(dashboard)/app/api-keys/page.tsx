import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import {
  ApiKeysPageClient,
  ApiKeysPageSkeleton,
} from '@/components/api-keys/api-keys-page-client';
import { isBetterAuthMode } from '@/lib/auth-mode';
import { getQueryClient } from '@/query/query.client';
import { apiKeysQueryOptions } from '@/query/query-options.server';

export default function ApiKeysPage() {
  if (!isBetterAuthMode()) {
    redirect('/app');
  }

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
