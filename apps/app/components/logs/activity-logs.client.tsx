'use client';

import { PageContainer, PageHeader } from '@/components/page-elements';
import { useSuspenseActivityLogs } from '@/hooks/auth.hooks';
import ActivityLogsDataGrid from './logs-data-grid';

export function ActivityLogsClient() {
  const { data: activityLogs } = useSuspenseActivityLogs();
  return (
    <>
      <PageHeader title="Activity Logs" />
      <PageContainer>
        {/* <PageTitle title="Overview" titleSize="2xl" /> */}
        <ActivityLogsDataGrid logs={activityLogs.logs} />
      </PageContainer>
    </>
  );
}
