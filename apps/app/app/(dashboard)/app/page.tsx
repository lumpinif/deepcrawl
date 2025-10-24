import { LazyPlayground } from '@/components/playground/lazy-playground';
import { PlaygroundProvider } from '@/contexts/playground-context';

export default function DashboardPage() {
  // Removed prefetching to improve FCP - data will be fetched on demand when users navigate to respective pages
  return (
    <PlaygroundProvider>
      <LazyPlayground />
    </PlaygroundProvider>
  );
}
