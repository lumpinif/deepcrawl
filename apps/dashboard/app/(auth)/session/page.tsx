'use client';

import { authClient } from '@deepcrawl/auth/lib/auth.client';

export default function SessionPage() {


    const {
        data: session,
        error, 
        isPending,
    } = authClient.useSession()

    if(isPending) return <div>Loading session...</div>

  return (
    <div>
      <h1>Session Info</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
          <div>User: {session?.user?.email || session?.user?.id}</div>
          <div>Error: {error?.message}</div>
    </div>
  );
}