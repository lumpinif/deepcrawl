'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

// import { useIsRestoring } from '@tanstack/react-query';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';

export function AuthCallback({ redirectTo }: { redirectTo?: string }) {
  // const isRestoring = useIsRestoring();
  const isRedirecting = useRef(false);

  const { onSuccess } = useOnSuccessTransition({ redirectTo });

  useEffect(() => {
    if (isRedirecting.current) return;

    isRedirecting.current = true;
    onSuccess();
    return;

    // if (isRestoring) return;

    // isRedirecting.current = true;
    // onSuccess();
  }, [onSuccess]);

  return <Loader2 className="animate-spin" />;
}
