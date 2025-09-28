import { cn } from '@deepcrawl/ui/lib/utils';
import { cookies } from 'next/headers';
import {
  PageContainer,
  // PageHeader,
  PageTitle,
} from '@/components/page-elements';
import { PlaygroundOperationClient } from '@/components/playground/playground-operation-client';
import type { NavigationMode } from '@/components/providers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const navigationMode =
    (cookieStore.get('navigation:mode')?.value as NavigationMode) || 'header';

  const isSidebar = navigationMode === 'sidebar';

  return (
    <>
      {/* <PageHeader title="Dashboard" /> */}
      <PageContainer
        className={cn(
          isSidebar
            ? '[calc(100svh-theme(spacing.16))]'
            : '[calc(100svh-theme(spacing.28))]',
        )}
      >
        <div className="mt-28 md:mt-[20svh]">
          <PageTitle
            className="m-4 mx-auto mb-10 w-full text-center"
            description="API Playground for Deepcrawl"
            title="What would you like to see?"
            titleSize="3xl"
          />
          <PlaygroundOperationClient />
        </div>
      </PageContainer>
    </>
  );
}
