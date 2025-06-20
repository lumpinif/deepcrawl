import { fetchAuthSession } from '@/app/actions/auth';
import { ApiKeysPageClient } from '@/components/api-keys/api-keys-page-client';
import { apiKeysQueryOptions } from '@/lib/query-options';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

/**
 * TODO:
 * 1. MOVE COMPONENTS TO COMPONENTS FOLDER
 * 2. investigate the loading spinner when refreshing the account page
 * 3. add a header navigation variant for custom app layout for user to choose
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
      <div className="container mx-auto max-w-4xl py-8">
        <div className="grid gap-6">
          <ApiKeysPageClient />
        </div>
      </div>
    </HydrationBoundary>
  );
}
