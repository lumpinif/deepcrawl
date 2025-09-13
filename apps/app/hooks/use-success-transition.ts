import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { BASE_APP_PATH } from '@/config';
import { useAuthRedirect, useAuthSession } from '@/hooks/auth.hooks';
import { getAppRoute } from '@/lib/navigation-config';
import { userQueryKeys } from '@/query/query-keys';
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
  const hasExecuted = useRef(false);

  const { refetch: refetchSession } = useAuthSession();

  useEffect(() => {
    if (!success || isPending || hasExecuted.current) {
      return;
    }

    hasExecuted.current = true;

    startTransition(() => {
      const redirectPath = getRedirectTo();

      // Validate redirectPath before URL construction
      if (!redirectPath || typeof redirectPath !== 'string') {
        const fallbackPath = getAppRoute(BASE_APP_PATH);
        
        // Production fix: Add delay for cookie propagation
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = fallbackPath;
          } else {
            router.push(fallbackPath);
          }
        }, 100);
        return;
      }

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

        // Production fix: Add delay to allow cookies to propagate before navigation
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = cleanPath;
          } else {
            router.push(cleanPath);
          }
        }, 100);
      } catch (error) {
        // Fallback: simple string replacement for parameter cleanup
        let cleanPath = String(redirectPath).replace(/[?&]linking=true/g, '');
        cleanPath = cleanPath.replace(/[?&]code=[^&]*/g, '');
        cleanPath = cleanPath.replace(/[?&]state=[^&]*/g, '');
        // Clean up any trailing ? or & characters
        cleanPath = cleanPath.replace(/[?&]$/, '');

        // Ensure the path starts with a slash and is not empty
        if (!(cleanPath?.startsWith('/') && cleanPath)) {
          cleanPath = getAppRoute(BASE_APP_PATH);
        }

        // Production fix: Add delay for fallback navigation
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = cleanPath;
          } else {
            router.push(cleanPath);
          }
        }, 100);
      }
    });
  }, [success, isPending, router, getRedirectTo]);

  const onSuccess = useCallback(async () => {
    // Reset execution flag for fresh authentication attempts
    hasExecuted.current = false;

    await refetchSession();

    // Check if this was a social provider linking flow
    const isLinking = getSearchParam('linking') === 'true';
    
    if (isLinking) {
      toast.success('Social provider linked successfully');

      // Invalidate linked accounts to refresh the UI
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.listUserAccounts,
      });
    }

    setSuccess(true);
  }, [queryClient]); // Removed refetchSession from dependencies to prevent infinite loops

  return { onSuccess, isPending };
}
