import { ChartAreaInteractive } from '@/components/home/chart-area-interactive';
import { PageHeader } from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const currentTime = new Date().toLocaleDateString();

  // TODO: CONSIDER ADDING AN API_URL INTO ENV VARS
  const API_URL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'
      : 'https://api.deepcrawl.dev';

  const originalHeaders = await headers();

  // Convert read-only Headers object to plain object for fetch
  const headersObj = Object.fromEntries(originalHeaders.entries());

  let result = null;
  let error = null;

  try {
    const response = await fetch(`${API_URL}/check-auth`, {
      headers: headersObj,
    });

    if (response.ok) {
      const responseText = await response.text();

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        error = `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`;
        console.error(`❌ [Dashboard] JSON parse failed:`, parseError);
      }
    } else {
      error = `API responded with status: ${response.status}`;
      console.error(`❌ [Dashboard] Error response status: ${response.status}`);
    }
  } catch (fetchError) {
    error =
      fetchError instanceof Error
        ? fetchError.message
        : 'Failed to connect to API';
    console.error(`❌ [Dashboard] Fetch error:`, fetchError);
  }

  return (
    <>
      <PageHeader
        title="Deepcrawl Dashboard"
        description={`Welcome back - ${currentTime}`}
      />

      <div className="mb-8 rounded-lg border p-4">
        <h3 className="mb-2 font-semibold text-lg">Auth Check Result:</h3>
        {error ? (
          <div className="rounded border border-red-200 p-2 text-red-800 text-sm">
            <strong>Error:</strong> {error}
            <br />
            <em>
              This is expected if the API service is not running or accessible.
            </em>
          </div>
        ) : (
          <pre className="overflow-auto text-pretty rounded p-2 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <ChartAreaInteractive />
      <PageHeader
        title="Playground"
        description="Test the deepcrawl API endpoints with our SDK. Enter a URL and try different operations."
      />
      <PlaygroundClient />
    </>
  );
}
