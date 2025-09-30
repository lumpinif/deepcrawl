import { cookies } from 'next/headers';

import { PlaygroundOperationClientContent } from '@/components/playground/playground-operation-client';
import { PGResponseArea } from '@/components/playground/response-area/pg-response-area';
import type { NavigationMode } from '@/components/providers';
import { PlaygroundProvider } from '@/hooks/playground/playground-context';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const navigationMode =
    (cookieStore.get('navigation:mode')?.value as NavigationMode) || 'header';

  const isSidebar = navigationMode === 'sidebar';

  return (
    <PlaygroundProvider>
      <PlaygroundOperationClientContent />
      {/* Results Section */}
      <PGResponseArea />
    </PlaygroundProvider>
  );
}
