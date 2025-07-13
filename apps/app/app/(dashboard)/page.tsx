import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import { PageHeader } from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';

export default async function DashboardPage() {
  const currentTime = new Date().toLocaleDateString();

  // const response = await fetch('http://localhost:8080/check-auth', {
  //   headers: await headers(),
  //   credentials: 'include',
  // });

  // const result = await response.json();

  return (
    <>
      <PageHeader
        title="Deepcrawl Dashboard"
        description={`Welcome back - ${currentTime}`}
      />

      {/* <div className="mb-8 rounded-lg border p-4">
        <h3 className="mb-2 font-semibold text-lg">Auth Check Result:</h3>
        <pre className="overflow-auto text-pretty rounded p-2 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div> */}

      <ChartAreaInteractive />
      <PageHeader
        title="Playground"
        description="Test the deepcrawl API endpoints with our SDK. Enter a URL and try different operations."
      />
      <PlaygroundClient />
    </>
  );
}
