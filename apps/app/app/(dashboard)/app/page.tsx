import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import {
  PageContainer,
  PageHeader,
  PageTitle,
} from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';
import { getQueryClient } from '@/query/query.client';
import { sessionQueryOptions } from '@/query/query-options';

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch session data
  void queryClient.prefetchQuery(sessionQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader title="Dashboard" />
      <PageContainer>
        <PageTitle titleSize="2xl" title="Overview" />
        <ChartAreaInteractive />
        <PageTitle titleSize="2xl" title="Playground" />
        <PlaygroundClient />
      </PageContainer>
    </HydrationBoundary>
  );
}
