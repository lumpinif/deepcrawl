import { fetchAuthSession } from '@/app/actions/auth';
import { ApiKeysPageClient } from '@/components/api-keys/api-keys-page-client';
import { PageContainer } from '@/components/page-container';
import { apiKeysQueryOptions } from '@/lib/query-options';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

/**
 * TODO:
 * investigate the loading spinner when refreshing the account page
 * add a header navigation variant for custom app layout for user to choose
 */
export default async function ApiKeysPage() {
  const session = await fetchAuthSession();

  if (!session) {
    redirect('/login');
  }

  const queryClient = new QueryClient();

  // Prefetch API keys data
  await queryClient.prefetchQuery(apiKeysQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer>
        <ApiKeysPageClient />
      </PageContainer>
    </HydrationBoundary>
  );
}
