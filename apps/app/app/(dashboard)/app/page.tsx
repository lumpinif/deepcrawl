import { LazyPlayground } from '@/components/playground/lazy-playground';
import { PlaygroundProvider } from '@/contexts/playground-context';

/* Marked the logs page as dynamic so Next.js doesn't try to prerender it and can safely call headers() at request time */
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // Removed prefetching to improve FCP - data will be fetched on demand when users navigate to respective pages
  return (
    <PlaygroundProvider>
      <LazyPlayground />
    </PlaygroundProvider>
  );
}
