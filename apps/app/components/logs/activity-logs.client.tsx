'use client';

// import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import {
  PageContainer,
  PageHeader,
  PageTitle,
} from '@/components/page-elements';
import { useSuspenseActivityLogs } from '@/hooks/auth.hooks';
import DataGridDemo from './logs-data-grid';

export function ActivityLogsClient() {
  const { data: activityLogs } = useSuspenseActivityLogs();
  return (
    <>
      <PageHeader title="Activity Logs" />
      <PageContainer>
        <PageTitle title="Overview" titleSize="2xl" />
        {/* <ChartAreaInteractive /> */}
        <DataGridDemo logs={activityLogs.logs} />
      </PageContainer>
    </>
  );
}
