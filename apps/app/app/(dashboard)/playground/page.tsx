import { ensurePlaygroundApiKey, fetchAuthSession } from '@/app/actions/auth';
import { PageHeader } from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';
import { redirect } from 'next/navigation';

export default async function PlaygroundPage() {
  // Ensure user is authenticated
  const session = await fetchAuthSession();
  if (!session) {
    redirect('/login');
  }

  // Ensure user has a PLAYGROUND_API_KEY
  try {
    await ensurePlaygroundApiKey();
  } catch (error) {
    console.error('⚠️ Failed to ensure playground API key:', error);
    // Continue anyway - the playground can handle missing API keys gracefully
  }

  return (
    <>
      <PageHeader
        title="API Playground"
        description="Test the deepcrawl API endpoints with our SDK. Enter a URL and try different operations."
      />
      <PlaygroundClient />
    </>
  );
}
