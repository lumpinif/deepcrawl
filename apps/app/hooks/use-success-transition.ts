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
    console.log('[useOnSuccessTransition] Effect triggered', {
      success,
      isPending,
      hasExecuted: hasExecuted.current,
      timestamp: new Date().toISOString(),
    });

    if (!success || isPending || hasExecuted.current) {
      console.log('[useOnSuccessTransition] Effect early return', {
        success,
        isPending,
        hasExecuted: hasExecuted.current,
      });
      return;
    }

    console.log('[useOnSuccessTransition] Starting redirect transition');
    hasExecuted.current = true;

    startTransition(() => {
      const redirectPath = getRedirectTo();

      console.log('[useOnSuccessTransition] Redirect details', {
        redirectPath,
        redirectTo,
        currentPathname: window.location.pathname,
        currentOrigin: window.location.origin,
        baseAppPath: BASE_APP_PATH,
        timestamp: new Date().toISOString(),
      });

      // Validate redirectPath before URL construction
      if (!redirectPath || typeof redirectPath !== 'string') {
        const fallbackPath = getAppRoute(BASE_APP_PATH);
        console.log(
          '[useOnSuccessTransition] Invalid redirect path, using fallback',
          {
            redirectPath,
            fallbackPath,
          },
        );
        
        // Production fix: Add delay for invalid path fallback too
        setTimeout(() => {
          console.log('[useOnSuccessTransition] Navigating to fallback after cookie delay');
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

        console.log('[useOnSuccessTransition] Target URL constructed', {
          originalRedirectPath: redirectPath,
          targetUrl: targetUrl.toString(),
          pathname: targetUrl.pathname,
          search: targetUrl.search,
        });

        // Remove OAuth flow parameters
        targetUrl.searchParams.delete('linking');
        targetUrl.searchParams.delete('code');
        targetUrl.searchParams.delete('state');

        // Construct clean path for navigation
        const cleanPath = targetUrl.pathname + (targetUrl.search || '');

        console.log('[useOnSuccessTransition] Navigating to clean path', {
          cleanPath,
          isProduction: process.env.NODE_ENV === 'production',
          timestamp: new Date().toISOString(),
        });

        // Production fix: Add delay to allow cookies to propagate before navigation
        // Middleware can intercept navigation before cookies are available
        console.log('[useOnSuccessTransition] Adding delay for cookie propagation...');
        
        setTimeout(() => {
          console.log('[useOnSuccessTransition] Navigating after cookie delay');
          if (typeof window !== 'undefined') {
            window.location.href = cleanPath;
          } else {
            router.push(cleanPath);
          }
        }, 100); // 100ms delay to allow cookie propagation

        console.log('[useOnSuccessTransition] Navigation scheduled');
      } catch (error) {
        console.error(
          '[useOnSuccessTransition] URL construction failed, using fallback',
          {
            error,
            redirectPath,
            timestamp: new Date().toISOString(),
          },
        );

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

        console.log('[useOnSuccessTransition] Using fallback clean path', {
          fallbackCleanPath: cleanPath,
        });

        // Production fix: Add delay for fallback navigation too
        setTimeout(() => {
          console.log('[useOnSuccessTransition] Navigating to fallback after cookie delay');
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
    console.log('[useOnSuccessTransition] onSuccess called', {
      timestamp: new Date().toISOString(),
      hasExecuted: hasExecuted.current,
    });

    // Reset execution flag for fresh authentication attempts
    hasExecuted.current = false;

    console.log('[useOnSuccessTransition] Refetching session...');
    await refetchSession();
    console.log('[useOnSuccessTransition] Session refetch completed');

    // Check if this was a social provider linking flow
    const isLinking = getSearchParam('linking') === 'true';
    console.log('[useOnSuccessTransition] Checking if linking flow', {
      isLinking,
    });

    if (isLinking) {
      toast.success('Social provider linked successfully');

      // Invalidate linked accounts to refresh the UI
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.listUserAccounts,
      });
    }

    console.log('[useOnSuccessTransition] Setting success to true');
    setSuccess(true);
    console.log('[useOnSuccessTransition] onSuccess completed');
  }, [queryClient]); // Removed refetchSession from dependencies to prevent infinite loops

  return { onSuccess, isPending };
}
