'use client';

import { useAuthSession } from '@/hooks/auth.hooks';

export default function SessionPage() {
  const { data: session, error, isPending } = useAuthSession();

  if (isPending) return <div>Loading session...</div>;

  return (
    <div>
      <h1>Session Info</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <div>User: {session?.user?.email || session?.user?.id}</div>
      <div>Error: {error?.message}</div>
    </div>
  );
}
