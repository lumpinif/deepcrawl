'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-elements';

export function LogsPageHeader() {
  const router = useRouter();

  return (
    <PageHeader
      containerClassName="flex items-center justify-between max-sm:flex-col max-sm:gap-y-4"
      description="Check out your recent request activity logs"
      title="Activity Logs"
    >
      <Button className="max-sm:w-full" onClick={() => router.refresh()}>
        Refresh
      </Button>
    </PageHeader>
  );
}
