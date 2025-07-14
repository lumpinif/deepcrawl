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
  const requestHeaders = new Headers(originalHeaders);

  // Log original headers in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Original request headers from browser:');
    for (const [key, value] of originalHeaders.entries()) {
      if (
        key.toLowerCase().includes('encoding') ||
        key.toLowerCase().includes('accept')
      ) {
        console.log(`  ${key}: ${value}`);
      }
    }
  }

  // Remove compression headers to avoid issues with Cloudflare Worker responses
  // The browser automatically handles compression, but server-side fetch might not
  const hadAcceptEncoding =
    requestHeaders.has('accept-encoding') ||
    requestHeaders.has('Accept-Encoding');
  requestHeaders.delete('accept-encoding');
  requestHeaders.delete('Accept-Encoding');

  console.log(`🚀 [Dashboard] Making request to ${API_URL}/check-auth`);
  console.log(`🚀 [Dashboard] Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🚀 [Dashboard] Removed Accept-Encoding headers: ${hadAcceptEncoding}`,
  );

  let result = null;
  let error = null;

  try {
    const response = await fetch(`${API_URL}/check-auth`, {
      headers: requestHeaders,
    });

    console.log(
      `🚀 [Dashboard] Response status: ${response.status} ${response.statusText}`,
    );
    console.log(
      `🚀 [Dashboard] Response Content-Type: ${response.headers.get('content-type')}`,
    );
    console.log(
      `🚀 [Dashboard] Response Content-Encoding: ${response.headers.get('content-encoding')}`,
    );
    console.log(
      `🚀 [Dashboard] Response size: ${response.headers.get('content-length') || 'unknown'}`,
    );

    if (response.ok) {
      const responseText = await response.text();
      console.log(
        `🚀 [Dashboard] Raw response preview: ${responseText.substring(0, 100)}...`,
      );

      try {
        result = JSON.parse(responseText);
        console.log(`✅ [Dashboard] Successfully parsed JSON response`);
      } catch (parseError) {
        error = `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`;
        console.error(`❌ [Dashboard] JSON parse failed:`, parseError);
        console.error(
          `❌ [Dashboard] Response text (first 200 chars): ${responseText.substring(0, 200)}`,
        );
      }
    } else {
      error = `API responded with status: ${response.status}`;
      const errorText = await response.text();
      console.error(
        `❌ [Dashboard] Error response: ${errorText.substring(0, 200)}`,
      );
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
