'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth.client';

interface DebugInfo {
  timestamp?: string;
  currentUrl?: string;
  pathname?: string;
  search?: string;
  session?: {
    hasData: boolean;
    hasUser: boolean;
    sessionId?: string;
    error?: string;
  };
  cookies?: {
    hasCookies: boolean;
    deepcrawlCookies: string[];
  };
  userAgent?: string;
  error?: string;
}

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const router = useRouter();

  useEffect(() => {
    // Only show in production and when there are URL parameters suggesting debugging
    const hasDebugParam = new URLSearchParams(window.location.search).has(
      'debug',
    );

    if (hasDebugParam) {
      setIsVisible(true);

      // Collect debug information
      const collectDebugInfo = async () => {
        try {
          const session = await authClient.getSession();
          const cookies = document.cookie;

          setDebugInfo({
            timestamp: new Date().toISOString(),
            currentUrl: window.location.href,
            pathname: window.location.pathname,
            search: window.location.search,
            session: {
              hasData: !!session.data,
              hasUser: !!session.data?.user,
              sessionId: session.data?.session?.id,
              error: session.error?.message,
            },
            cookies: {
              hasCookies: !!cookies,
              deepcrawlCookies: cookies
                .split(';')
                .filter((c) => c.includes('deepcrawl')),
            },
            userAgent: navigator.userAgent.slice(0, 50),
          });
        } catch (error) {
          setDebugInfo({
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          });
        }
      };

      collectDebugInfo();
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-md rounded-lg bg-gray-900 p-4 text-sm text-white shadow-lg">
      <div className="mb-2 font-bold">Debug Panel (Production)</div>
      <div className="space-y-1 text-xs">
        <div>
          <strong>URL:</strong> {debugInfo.currentUrl}
        </div>
        <div>
          <strong>Session:</strong> {JSON.stringify(debugInfo.session, null, 2)}
        </div>
        <div>
          <strong>Cookies:</strong>{' '}
          {debugInfo.cookies?.deepcrawlCookies?.length || 0} deepcrawl cookies
        </div>
        <div>
          <strong>Timestamp:</strong> {debugInfo.timestamp}
        </div>
      </div>
      <div className="mt-2 space-x-2">
        <button
          className="rounded bg-blue-600 px-2 py-1 text-xs"
          onClick={() => router.push('/app')}
          type="button"
        >
          Go to /app
        </button>
        <button
          className="rounded bg-green-600 px-2 py-1 text-xs"
          onClick={() => router.refresh()}
          type="button"
        >
          Refresh
        </button>
        <button
          className="rounded bg-red-600 px-2 py-1 text-xs"
          onClick={() => setIsVisible(false)}
          type="button"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
