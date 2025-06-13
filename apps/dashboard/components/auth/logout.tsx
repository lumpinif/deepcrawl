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

  const { onSuccess } = useOnSuccessTransition({
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

  return <Loader2 className="animate-spin" />;
}
