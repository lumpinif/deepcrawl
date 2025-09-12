'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth.client';
import { authViewRoutes } from '@/routes/auth';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';

function cleanupMultiSessionCookies() {
  if (typeof document === 'undefined') {
    return; // Server-side guard
  }

  // Get all cookies
  const cookies = document.cookie.split(';');

  // Find and delete multi-session cookies
  for (const cookie of cookies) {
    const [name] = cookie.trim().split('=');
    if (name?.includes('_multi-')) {
      // Delete the cookie by setting it to expire
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      // Also try with leading dot for subdomain cookies
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    }
  }
}

export function Logout() {
  const signingOut = useRef(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const { onSuccess, isPending } = useOnSuccessTransition({
    redirectTo: redirectTo 
      ? redirectTo.startsWith('/') 
        ? redirectTo 
        : `/${redirectTo}`
      : `/${authViewRoutes.login}`,
  });

  useEffect(() => {
    if (signingOut.current) {
      return;
    }
    signingOut.current = true;

    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Remove all queries
          queryClient.removeQueries();

          // This may not be needed if using the multi-session plugin
          cleanupMultiSessionCookies();

          // Force refresh server-rendered components to clear stale session data
          router.refresh();

          onSuccess();
        },
      },
    });
  }, [onSuccess, queryClient]);

  return (
    <div className="flex items-center justify-center max-sm:h-[calc(100svh-(--spacing(32)))] sm:min-h-svh">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin" />
        <p className="animate-pulse text-muted-foreground text-sm">
          {isPending ? 'Goodbye' : 'Logging out'}
        </p>
      </div>
    </div>
  );
}
