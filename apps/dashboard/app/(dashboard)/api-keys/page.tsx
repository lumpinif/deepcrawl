import { fetchAuthSession } from '@/app/actions/auth';
import {
  ApiKeysPageClient,
  ApiKeysPageSkeleton,
} from '@/components/api-keys/api-keys-page-client';
import { PageContainer } from '@/components/page-container';
import { apiKeysQueryOptions } from '@/lib/query-options';
import { getQueryClient } from '@/lib/query.client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function ApiKeysPage() {
  const session = await fetchAuthSession();

  if (!session) {
    redirect('/login');
  }

  const queryClient = getQueryClient();

  // Prefetch API keys data
  queryClient.prefetchQuery(apiKeysQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer>
        <Suspense fallback={<ApiKeysPageSkeleton />}>
          <ApiKeysPageClient />
        </Suspense>
      </PageContainer>
    </HydrationBoundary>
  );
}
