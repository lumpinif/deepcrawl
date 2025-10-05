'use client';

// import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import {
  PageContainer,
  PageHeader,
  PageTitle,
} from '@/components/page-elements';
import { useSuspenseActivityLogs } from '@/hooks/auth.hooks';

export function ActivityLogsClient() {
  const { data: activityLogs, error } = useSuspenseActivityLogs();
  return (
    <>
      <PageHeader title="Activity Logs" />
      <PageContainer>
        <PageTitle title="Overview" titleSize="2xl" />
        {/* <ChartAreaInteractive /> */}
        <pre className="max-h-[50svh] overflow-y-auto text-xs">
          {JSON.stringify(activityLogs, null, 2)}
        </pre>
      </PageContainer>
    </>
  );
}
