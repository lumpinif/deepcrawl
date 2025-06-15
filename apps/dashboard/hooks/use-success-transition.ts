import { useAuthSession } from '@/hooks/auth.hooks';
import { userQueryKeys } from '@/lib/query-keys';
import { getSearchParam } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

export function useOnSuccessTransition({
  redirectTo: redirectToProp = '/',
}: { redirectTo?: string }) {
  const getRedirectTo = useCallback(() => {
    // Priority order for determining redirect destination:
    // 1. Explicit prop passed to the hook
    // 2. URL parameter from current page (for client-server separated architecture)
    // 3. Default to home page

    if (redirectToProp && redirectToProp !== '/') {
      return redirectToProp;
    }

    // In client-server separated architecture, we need to be careful about URL parameters
    // The redirectTo parameter should be a path relative to the frontend domain
    const redirectParam = getSearchParam('redirectTo');
    if (redirectParam) {
      // Ensure the redirect path is safe and relative to frontend
      try {
        // If it's a full URL, extract just the pathname and search
        if (redirectParam.startsWith('http')) {
          const url = new URL(redirectParam);
          return url.pathname + url.search;
        }
        // If it's already a path, use it as-is
        return redirectParam.startsWith('/')
          ? redirectParam
          : `/${redirectParam}`;
      } catch {
        // If URL parsing fails, treat as a simple path
        return redirectParam.startsWith('/')
          ? redirectParam
          : `/${redirectParam}`;
      }
    }

    return '/';
  }, [redirectToProp]);

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
        router.push(cleanPath || '/');
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
