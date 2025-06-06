'use client';

import { authClient } from '@deepcrawl/auth/lib/auth.client';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { useEffect, useState } from 'react';

export default function SessionPage() {
  const { data: session, isPending, error } = authClient.useSession();
  const [rawResponse, setRawResponse] = useState<unknown>(null);

  // Fetch raw session data to see the full response structure
  useEffect(() => {
    const fetchRawSession = async () => {
      try {
        const response = await fetch('/api/auth/get-session', {
          credentials: 'include',
        });
        const data = await response.json();
        setRawResponse(data);
        console.log('Raw session response:', data);
      } catch (err) {
        console.error('Failed to fetch raw session:', err);
      }
    };

    fetchRawSession();
  }, []);

  if (isPending) return <div className="p-6">Loading session...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 font-bold text-2xl">Session Information</h1>
      
      {/* Session Status */}
      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-2 font-semibold text-lg">Session Status</h2>
        <p className="text-sm">
          Status: {session ? '✅ Authenticated' : '❌ Not authenticated'}
        </p>
      </div>

      {/* Better Auth Hook Data */}
      {session && (
        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-2 font-semibold text-lg">Better Auth Hook Data</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-3 text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}

      {/* Raw API Response */}
      {rawResponse && (
        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-2 font-semibold text-lg">Raw API Response</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-3 text-sm">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* User Information */}
      {session?.user && (
        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-2 font-semibold text-lg">User Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {session.user.id}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Name:</strong> {session.user.name || 'Not set'}</p>
            <p><strong>Email Verified:</strong> {session.user.emailVerified ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Created At:</strong> {session.user.createdAt}</p>
            <p><strong>Updated At:</strong> {session.user.updatedAt}</p>
          </div>
        </div>
      )}

      {/* Session Information */}
      {session?.session && (
        <div className="mb-6 rounded-lg border p-4">
          <h2 className="mb-2 font-semibold text-lg">Session Details</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Session ID:</strong> {session.session.id}</p>
            <p><strong>User ID:</strong> {session.session.userId}</p>
            <p><strong>Expires At:</strong> {session.session.expiresAt}</p>
            <p><strong>Created At:</strong> {session.session.createdAt}</p>
            <p><strong>Updated At:</strong> {session.session.updatedAt}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-x-4">
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Refresh Session
        </Button>
        
        <Button 
          onClick={async () => {
            await authClient.signOut();
            window.location.href = '/login';
          }}
          variant="destructive"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
} 