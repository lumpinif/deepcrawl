import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import {
  PageContainer,
  PageHeader,
  PageTitle,
} from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';

export default async function DashboardPage() {
  return (
    <>
      <PageHeader title="Deepcrawl Dashboard" />
      <PageContainer>
        <PageTitle title="Overview" />
        <ChartAreaInteractive />
        <PageTitle
          title="Playground"
          description="Test the deepcrawl API endpoints with our SDK. Enter a URL and try different operations."
        />
        <PlaygroundClient />
      </PageContainer>
    </>
  );
}
