import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import { PageHeader } from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';

export default async function DashboardPage() {
  const currentTime = new Date().toLocaleDateString();
  return (
    <>
      <PageHeader
        title="Deepcrawl Dashboard"
        description={`Welcome back - ${currentTime}`}
      />
      <ChartAreaInteractive />
      <PageHeader
        title="Playground"
        description="Test the deepcrawl API endpoints with our SDK. Enter a URL and try different operations."
      />
      <PlaygroundClient />
    </>
  );
}
