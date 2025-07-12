import { fetchAuthSession } from '@/app/actions/auth';
import { PageHeader } from '@/components/page-elements';
import { PlaygroundClient } from '@/components/playground/playground-client';
import { redirect } from 'next/navigation';

export default async function PlaygroundPage() {
  // Ensure user is authenticated
  const session = await fetchAuthSession();
  if (!session) {
    redirect('/login');
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
