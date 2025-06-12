import { useSession } from '@/lib/auth.client';
import { getSearchParam } from '@/utils';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

export function useOnSuccessTransition({
  redirectTo: redirectToProp = '/',
}: { redirectTo?: string }) {
  const getRedirectTo = useCallback(
    () => redirectToProp || getSearchParam('redirectTo') || '/',
    [redirectToProp],
  );

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const { refetch: refetchSession } = useSession();

  useEffect(() => {
    if (!success || isPending) return;

    startTransition(() => {
      router.push(getRedirectTo());
    });
  }, [success, isPending, router, getRedirectTo]);

  const onSuccess = useCallback(async () => {
    refetchSession();
    setSuccess(true);
  }, [refetchSession]);

  return { onSuccess, isPending };
}
