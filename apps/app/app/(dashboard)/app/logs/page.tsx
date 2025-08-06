import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import {
  PageContainer,
  PageHeader,
  PageTitle,
} from '@/components/page-elements';

export default function HistoryPage() {
  return (
    <>
      <PageHeader title="Activity Logs" />
      <PageContainer>
        <PageTitle titleSize="2xl" title="Overview" />
        <ChartAreaInteractive />
      </PageContainer>
    </>
  );
}
