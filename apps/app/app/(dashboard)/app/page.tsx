import { cookies } from 'next/headers';

import { PGResponseArea } from '@/components/playground/pg-response-area';
import { PlaygroundOperationClientContent } from '@/components/playground/playground-operation-client';
import type { NavigationMode } from '@/components/providers';
import { PlaygroundProvider } from '@/hooks/playground/playground-context';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const navigationMode =
    (cookieStore.get('navigation:mode')?.value as NavigationMode) || 'header';

  const isSidebar = navigationMode === 'sidebar';

  // todo: redesign the response area to be the component out side of playground operation client and make it anchored to scroll to smoothly after there is a new response

  return (
    <PlaygroundProvider>
      <PlaygroundOperationClientContent />
      {/* Results Section */}
      <PGResponseArea />
    </PlaygroundProvider>
  );
}
