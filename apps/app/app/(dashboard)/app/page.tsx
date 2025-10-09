import { PlaygroundOperationClientContent } from '@/components/playground/playground-operation-client';
import { PGResponseArea } from '@/components/playground/response-area/pg-response-area';
import { PlaygroundProvider } from '@/contexts/playground-context';
import { getQueryClient } from '@/query/query.client';
import { getManyLogsQueryOptions } from '@/query/query-options.server';

export default function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch activity logs data from the home page
  void queryClient.prefetchQuery(getManyLogsQueryOptions());

  return (
    <PlaygroundProvider>
      <PlaygroundOperationClientContent />
      <PGResponseArea />
    </PlaygroundProvider>
  );
}
