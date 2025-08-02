import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { BASE_APP_PATH } from '@/config';
import { useAuthRedirect, useAuthSession } from '@/hooks/auth.hooks';
import { getAppRoute } from '@/lib/navigation-config';
import { userQueryKeys } from '@/lib/query-keys';
import { getSearchParam } from '@/utils';

export function useOnSuccessTransition({
  redirectTo,
}: {
  redirectTo?: string;
}) {
  const { getRedirectTo } = useAuthRedirect(redirectTo);

  const router = useRouter();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const { refetch: refetchSession } = useAuthSession();

  useEffect(() => {
    if (!success || isPending) return;

    startTransition(() => {
      const redirectPath = getRedirectTo();

      // Clean up OAuth-specific parameters when redirecting
      // This ensures clean URLs after OAuth flows complete
      try {
        // Always construct URL relative to current frontend origin
        const targetUrl = new URL(redirectPath, window.location.origin);

        // Remove OAuth flow parameters
        targetUrl.searchParams.delete('linking');
        targetUrl.searchParams.delete('code');
        targetUrl.searchParams.delete('state');

        // Construct clean path for navigation
        const cleanPath = targetUrl.pathname + (targetUrl.search || '');
        router.push(cleanPath);
      } catch (error) {
        console.warn('URL construction failed, using fallback:', error);
        // Fallback: simple string replacement for parameter cleanup
        let cleanPath = redirectPath.replace(/[?&]linking=true/g, '');
        cleanPath = cleanPath.replace(/[?&]code=[^&]*/g, '');
        cleanPath = cleanPath.replace(/[?&]state=[^&]*/g, '');
        // Clean up any trailing ? or & characters
        cleanPath = cleanPath.replace(/[?&]$/, '');
        router.push(cleanPath || getAppRoute(BASE_APP_PATH));
      }
    });
  }, [success, isPending, router, getRedirectTo]);

  const onSuccess = useCallback(async () => {
    await refetchSession();

    // Check if this was a social provider linking flow
    const isLinking = getSearchParam('linking') === 'true';
    if (isLinking) {
      toast.success('Social provider linked successfully');

      // Invalidate linked accounts to refresh the UI
      queryClient.invalidateQueries({ queryKey: userQueryKeys.linkedAccounts });
    }

    setSuccess(true);
  }, [refetchSession, queryClient]);

  return { onSuccess, isPending };
}
