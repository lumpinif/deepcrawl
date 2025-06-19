import { fetchAuthSession } from '@/app/actions/auth';
import { apiKeysQueryOptions } from '@/lib/query-options';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { ApiKeysPageClient } from './components/api-keys-page-client';

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
