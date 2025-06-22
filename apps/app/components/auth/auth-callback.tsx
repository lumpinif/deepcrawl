'use client';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';

export function AuthCallback({ redirectTo }: { redirectTo?: string }) {
  const { onSuccess, isPending } = useOnSuccessTransition({ redirectTo });

  useEffect(() => {
    // Immediately trigger the success transition when this component mounts
    // This happens when users return from OAuth providers
    onSuccess();
  }, [onSuccess]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          {isPending ? 'Completing authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
