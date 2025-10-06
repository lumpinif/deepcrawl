'use client';

import { PageContainer, PageHeader } from '@/components/page-elements';
import ActivityLogsDataGrid from './logs-data-grid';

export function ActivityLogsClient() {
  return (
    <>
      <PageHeader
        description="Check out your recent request activity logs"
        title="Activity Logs"
      />
      <PageContainer>
        {/* <PageTitle title="Overview" titleSize="2xl" /> */}
        <ActivityLogsDataGrid />
      </PageContainer>
    </>
  );
}
