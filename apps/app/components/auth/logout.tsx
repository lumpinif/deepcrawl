'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { authClient } from '@/lib/auth.client';
import { userQueryKeys } from '@/lib/query-keys';
import { authViewRoutes } from '@/routes/auth';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';

export function Logout() {
  const signingOut = useRef(false);
  const queryClient = useQueryClient();

  const { onSuccess, isPending } = useOnSuccessTransition({
    redirectTo: `/${authViewRoutes.login}`,
  });

  useEffect(() => {
    if (signingOut.current) return;
    signingOut.current = true;

    authClient.signOut().finally(() => {
      // Only clear the current session, keep multi-session data cached
      queryClient.removeQueries({ queryKey: userQueryKeys.session });

      // Keep these cached so user can see other sessions if they log back in:
      // - listSessions (other active sessions)
      // - deviceSessions (device-specific sessions)
      // - organization (org data)

      onSuccess();
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
