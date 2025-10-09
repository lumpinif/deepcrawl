'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { startTransition } from 'react';
import { PageHeader } from '@/components/page-elements';
import { userQueryKeys } from '@/query/query-keys';

export function LogsPageHeader() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    startTransition(() => {
      queryClient.resetQueries({
        queryKey: userQueryKeys.activityLogs,
      });
    });
  };

  return (
    <PageHeader
      containerClassName="flex items-center justify-between max-sm:flex-col max-sm:gap-y-4"
      description="Check out your recent request activity logs"
      title="Activity Logs"
    >
      <Button className="max-sm:w-full" onClick={() => handleRefresh()}>
        Refresh
      </Button>
    </PageHeader>
  );
}
