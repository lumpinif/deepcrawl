'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { authClient } from '@/lib/auth.client';
import { authViewRoutes } from '@/routes/auth';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';

export function SignOut() {
  const signingOut = useRef(false);

  const { onSuccess } = useOnSuccessTransition({
    redirectTo: `/${authViewRoutes.login}`,
  });

  useEffect(() => {
    if (signingOut.current) return;
    signingOut.current = true;

    authClient.signOut().finally(onSuccess);
  }, [authClient, onSuccess]);

  return <Loader2 className="animate-spin" />;
}
