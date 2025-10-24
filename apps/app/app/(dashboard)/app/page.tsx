// import { LazyPlayground } from '@/components/playground/lazy-playground';
import { PlaygroundOperationClientContent } from '@/components/playground/playground-operation-client';
import { PGResponseArea } from '@/components/playground/response-area/pg-response-area';
import { PlaygroundProvider } from '@/contexts/playground-context';

export default function DashboardPage() {
  // Removed prefetching to improve FCP - data will be fetched on demand when users navigate to respective pages
  return (
    <PlaygroundProvider>
      {/* <LazyPlayground /> */}
      <PlaygroundOperationClientContent />
      <PGResponseArea />
    </PlaygroundProvider>
  );
}
