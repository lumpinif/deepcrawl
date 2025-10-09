'use client';

import type { ListApiKeys, Session } from '@deepcrawl/auth/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { Passkey } from 'better-auth/plugins/passkey';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import {
  createApiKey,
  deleteApiKey,
  removeUserPasskey,
  setPassword,
  updateApiKey,
} from '@/app/actions/auth';
import { BASE_APP_PATH } from '@/config';
import { authClient } from '@/lib/auth.client';
import {
  getAuthErrorMessage,
  isWebAuthnCancellationError,
} from '@/lib/auth-errors';
import { getAppRoute } from '@/lib/navigation-config';
import { generatePasskeyName } from '@/lib/passkey-utils';
import { userQueryKeys } from '@/query/query-keys';
import {
  apiKeysQueryOptionsClient,
  deviceSessionsQueryOptionsClient,
  listUserAccountsQueryOptionsClient,
  organizationQueryOptionsClient,
  sessionQueryOptionsClient,
  userPasskeysQueryOptionsClient,
} from '@/query/query-options.client';
import { authViewSegments } from '@/routes/auth';
import { getSearchParam } from '@/utils';
import { copyToClipboard } from '@/utils/clipboard';

// Validation schemas
const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(32, 'Display name must be 32 characters or less')
  .trim();

// Hooks with query options
export const useAuthSession = () => useQuery(sessionQueryOptionsClient());

/**
 * Hook for getting device sessions with proper error handling and full type inference
 */
export const useDeviceSessions = () => {
  const result = useQuery(deviceSessionsQueryOptionsClient());

  return result;
};

/**
 * Hook for getting organization data with proper error handling and full type inference
 */
export const useOrganization = () => {
  return useQuery(organizationQueryOptionsClient());
};

/**
 * Hook for fetching user's passkeys with proper error handling and caching
 */
export const useUserPasskeys = () => {
  return useQuery(userPasskeysQueryOptionsClient());
};

/**
 * Hook for fetching user's linked OAuth accounts with proper error handling and caching
 */
export const useListUserAccounts = () => {
  return useQuery(listUserAccountsQueryOptionsClient());
};

/**
 * Hook to check if the current user has a password set
 * Returns true if user has a credential account (email/password)
 */
export const useHasPassword = () => {
  const { data: linkedAccounts = [] } = useListUserAccounts();

  // Check if user has credential provider (email/password) account
  const hasCredentialAccount =
    Array.isArray(linkedAccounts) &&
    linkedAccounts.some((account) => account.providerId === 'credential');

  return hasCredentialAccount;
};

/**
 * Hook for setting the active session in multi-session environment
 */
export const useSetActiveSession = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const result = await authClient.multiSession.setActive({
        sessionToken,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Force refresh the session to ensure client-side cache is updated
      // await authClient.getSession();

      return result;
    },
    onSuccess: () => {
      // Invalidate all queries
      queryClient.invalidateQueries();

      // Refresh the page to ensure all components reflect the new active session
      router.refresh();

      toast.success('Account switched successfully');
    },
    onError: (error) => {
      console.error('Failed to switch account:', error);
      toast.error('Failed to switch account. Please try again.');
    },
  });
};

/**
 * Hook for revoking a device session in multi-session environment
 */
export const useRevokeDeviceSession = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const result = await authClient.multiSession.revoke({
        sessionToken,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    // Removed optimistic updates for security-critical session termination
    // Users should see loading states to confirm the operation is in progress
    onError: (err) => {
      toast.error(err.message || 'Failed to remove account');
    },
    onSuccess: async (data, sessionToken) => {
      // Get current session to check if user revoked their own session
      const currentSession = queryClient.getQueryData<Session>(
        userQueryKeys.session,
      );

      if (currentSession?.session?.token === sessionToken) {
        // User revoked their own session, redirect to logout for centralized handling
        toast.success(
          'Current account signed out successfully. Please log in again.',
        );

        // Check if we're already on the logout page to prevent double navigation
        if (window.location.pathname !== `/${authViewSegments.logout}`) {
          router.push(`/${authViewSegments.logout}`);
        }
        return;
      }

      // Only invalidate session-related queries when revoking device sessions
      queryClient.invalidateQueries({ queryKey: userQueryKeys.deviceSessions });

      toast.success('Account removed successfully');
    },
  });
};

/**
 * Hook to check if a user can safely unlink a specific provider without getting locked out
 */
export const useCanUnlinkProvider = (providerId: string) => {
  const { data: linkedAccounts = [] } = useListUserAccounts();
  const { data: passkeys = [] } = useUserPasskeys();

  // Check available authentication methods
  // Check if user has credential provider (email/password) account
  const hasCredentialAccount =
    Array.isArray(linkedAccounts) &&
    linkedAccounts.some((account) => account.providerId === 'credential');
  const hasPassword = hasCredentialAccount;

  const otherOAuthAccounts =
    Array.isArray(linkedAccounts) &&
    linkedAccounts.filter((account) => account.providerId !== providerId);

  const hasOtherOAuth =
    Array.isArray(otherOAuthAccounts) && otherOAuthAccounts.length > 0;

  const hasPasskeys = Array.isArray(passkeys) && passkeys.length > 0;

  // User can unlink if they have at least one other authentication method
  const canUnlink = hasPassword || hasPasskeys || hasOtherOAuth;

  // Provide detailed information about why they can't unlink
  const reasons = [];
  if (!hasPassword) {
    reasons.push('set up a password');
  }
  if (!hasPasskeys) {
    reasons.push('add a passkey');
  }
  if (!hasOtherOAuth) {
    reasons.push('link another social account');
  }

  return {
    canUnlink,
    hasPassword,
    hasPasskeys,
    hasOtherOAuth,
    totalAuthMethods:
      (hasPassword ? 1 : 0) +
      (passkeys?.length || 0) +
      (linkedAccounts?.length || 0),
    suggestedActions: reasons,
    warningMessage: canUnlink
      ? null
      : `To unlink this account, please ${reasons.slice(0, -1).join(', ')}${reasons.length > 1 ? ' or ' : ''}${reasons[reasons.length - 1]} first.`,
  };
};

/**
 * Hook for updating user display name with optimistic updates
 */
export const useUpdateUserName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      // Validate input
      const validatedName = displayNameSchema.parse(name);

      const result = await authClient.updateUser({
        name: validatedName,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    onMutate: async (name: string) => {
      // Validate before optimistic update
      const validatedName = displayNameSchema.parse(name);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.session });

      // Snapshot previous value
      const previousSession = queryClient.getQueryData<Session>(
        userQueryKeys.session,
      );

      // Optimistically update the user name
      queryClient.setQueryData<Session>(userQueryKeys.session, (old) => {
        if (!old?.user) {
          return old;
        }
        return {
          ...old,
          user: {
            ...old.user,
            name: validatedName,
            updatedAt: new Date(),
          },
        };
      });

      return { previousSession };
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(
          userQueryKeys.session,
          context.previousSession,
        );
      }

      // Handle validation errors specifically
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0]?.message || 'Invalid display name');
      } else {
        toast.error(err.message || 'Failed to update display name');
      }
    },
    onSuccess: () => {
      // Invalidate session to refresh updated user data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
      toast.success('Display name updated successfully');
    },
  });
};

/**
 * Hook for changing user password
 */
export const useChangePassword = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    }: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions: boolean;
    }) => {
      const { data, error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions,
      });
      if (error) {
        throw new Error(getAuthErrorMessage(error));
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully.');

      // Call the custom callback if provided
      onSuccessCallback?.();
    },
    onError: (error) => {
      console.error('Password change failed:', error);
      toast.error('Failed to update password. Please try again.');
    },
  });
};

/**
 * Hook for setting a new password for OAuth users who don't have one
 */
export const useSetPassword = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPassword: string) => {
      return setPassword(newPassword);
    },
    onSuccess: () => {
      toast.success('Password set successfully!');

      // Invalidate linked accounts to update hasPassword state
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.listUserAccounts,
      });

      // Call the custom callback if provided
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      console.error('Set password failed:', error);
      if (error.message.includes('already has a password')) {
        toast.error(
          'You already have a password. Please use change password instead.',
        );
      } else {
        toast.error('Failed to set password. Please try again.');
      }
    },
  });
};

/**
 * Hook for revoking a specific session
 * Uses multiSession API for consistency with the Better Auth multiSession plugin
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      // Use multiSession.revoke instead of revokeSession for consistency
      const result = await authClient.multiSession.revoke({
        sessionToken,
      });

      if (result.error) {
        // Better error handling with fallback message
        const errorMessage =
          result.error.message ||
          result.error.statusText ||
          'Failed to revoke session';
        throw new Error(errorMessage);
      }

      return result;
    },
    onError: (err) => {
      console.error('❌ [useRevokeSession] Error:', err);
      toast.error(err.message || 'Failed to revoke session');
    },
    onSuccess: async (data, sessionToken) => {
      // Get current session to check if user revoked their own session
      const currentSession = queryClient.getQueryData<Session>(
        userQueryKeys.session,
      );

      if (currentSession?.session?.token === sessionToken) {
        // User revoked their own session, redirect to logout for centralized handling
        toast.success(
          'Current session signed out successfully. Please log in again.',
        );

        // Check if we're already on the logout page to prevent double navigation
        if (window.location.pathname !== `/${authViewSegments.logout}`) {
          router.push(`/${authViewSegments.logout}`);
        }
        return;
      }

      toast.success('Session terminated successfully');
    },
    onSettled: async () => {
      // Force refetch sessions list to update UI after termination
      await queryClient.refetchQueries({
        queryKey: userQueryKeys.listSessions,
        type: 'active',
      });
    },
  });
};

/**
 * Hook for revoking all other sessions (keeping current one)
 * Note: Optimistic updates disabled to prevent UI flickering and maintain loading state
 */
export const useRevokeAllOtherSessions = () => {
  const queryClient = useQueryClient();
  // const { data: currentSession } = useAuthSession();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.revokeOtherSessions();

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    // onMutate: async () => {
    //   // Cancel outgoing refetches
    //   await queryClient.cancelQueries({ queryKey: userQueryKeys.listSessions });

    //   // Snapshot previous value
    //   const previousSessions = queryClient.getQueryData<SessionsList>(
    //     userQueryKeys.listSessions,
    //   );

    //   // Optimistically update to keep only current session
    //   queryClient.setQueryData<SessionsList>(
    //     userQueryKeys.listSessions,
    //     (old) => {
    //       if (!old || !currentSession?.session) return old;
    //       return old.filter(
    //         (session) => session.id === currentSession.session.id,
    //       );
    //     },
    //   );

    //   return { previousSessions };
    // },
    onError: (err) => {
      toast.error(err.message || 'Failed to revoke sessions');
    },
    onSuccess: () => {
      toast.success('All other sessions terminated successfully');
    },
    onSettled: async () => {
      // Invalidate sessions list to update UI after termination
      await queryClient.refetchQueries({
        queryKey: userQueryKeys.listSessions,
        type: 'active',
      });
    },
  });
};

/**
 * Hook for linking a social provider to current account
 */
export const useLinkSocialProvider = () => {
  const queryClient = useQueryClient();
  const { getFrontendCallbackURL } = useAuthRedirect('account');

  return useMutation({
    mutationFn: async ({
      provider,
      redirectTo = '/app/account',
    }: {
      provider: 'google' | 'github';
      redirectTo?: string;
    }) => {
      // Add a parameter to indicate this is a linking flow
      const callbackURL = getFrontendCallbackURL(redirectTo);
      const linkingURL = new URL(callbackURL);
      linkingURL.searchParams.set('linking', 'true');
      const linkingCallbackURL = linkingURL.toString();

      const result = await authClient.linkSocial({
        provider,
        callbackURL: linkingCallbackURL,
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.listUserAccounts,
      });
    },
    // Note: OAuth redirects mean we typically won't be here when linking completes
    // The success state will be handled after the user returns from OAuth provider
    onError: (error) => {
      console.error('Social provider linking failed:', error);
      toast.error('Failed to link social provider. Please try again.');
    },
  });
};

/**
 * Hook for unlinking a social provider from current account
 * Includes safety checks to prevent account lockout
 */
export const useUnlinkSocialProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerId: string) => {
      // Use Better Auth's built-in unlinkAccount method
      const result = await authClient.unlinkAccount({
        providerId,
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    onError: (error) => {
      toast.error(
        error.message || 'Failed to unlink social provider. Please try again.',
      );
    },
    onSuccess: () => {
      toast.success('Social provider unlinked successfully');

      queryClient.invalidateQueries({
        queryKey: userQueryKeys.listUserAccounts,
      });
    },
  });
};

/**
 * Hook for adding a new passkey to current account
 */
export const useAddPasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Generate a meaningful name based on the device and browser
      const passkeyName = generatePasskeyName();

      // First, create the passkey with Better Auth
      const result = await authClient.passkey.addPasskey({
        name: passkeyName,
        authenticatorAttachment: 'platform',
      });

      if (result?.error) {
        throw new Error(getAuthErrorMessage(result.error));
      }

      return result;
    },
    onSuccess: async () => {
      // Invalidate passkeys list to show the new passkey
      await queryClient.refetchQueries({
        queryKey: userQueryKeys.passkeys,
        type: 'active',
      });

      toast.success('Passkey added successfully');
    },
    onError: (error) => {
      console.error('❌ [useAddPasskey] ~ error:', error.message);
      // Only show error toast for actual errors, not cancellations
      if (!isWebAuthnCancellationError(error)) {
        toast.error(
          'Failed to add passkey. Please try again or report an issue.',
        );
      }
      // Silently handle cancellations - user intentionally cancelled
    },
  });
};

/**
 * Hook for removing a passkey from current account
 */
export const useRemovePasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (passkeyId: string) => {
      const result = await removeUserPasskey(passkeyId);
      return result;
    },
    onMutate: async (passkeyId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.passkeys });

      // Snapshot previous value for rollback
      const previousPasskeys = queryClient.getQueryData(userQueryKeys.passkeys);

      // Optimistically remove the passkey from the cache
      queryClient.setQueryData(
        userQueryKeys.passkeys,
        (old: Passkey[] | undefined) => {
          if (!old) {
            return old;
          }
          return old.filter((passkey) => passkey.id !== passkeyId);
        },
      );

      return { previousPasskeys, passkeyId };
    },
    onError: (error, passkeyId, context) => {
      // Rollback on error
      if (context?.previousPasskeys) {
        queryClient.setQueryData(
          userQueryKeys.passkeys,
          context.previousPasskeys,
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove passkey';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      // Invalidate passkeys list to confirm removal
      queryClient.invalidateQueries({ queryKey: userQueryKeys.passkeys });

      toast.success('Passkey removed successfully', {
        description:
          "To prevent confusion, also remove it from your machine's password manager.",
        duration: 8000, // Show longer for important info
      });
    },
  });
};

/**
 * Suspense-friendly
 */
export const useSuspenseApiKeys = () =>
  useSuspenseQuery(apiKeysQueryOptionsClient());

/**
 * Hook for creating a new API key
 */
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      expiresIn,
      prefix,
      metadata,
    }: {
      name?: string;
      expiresIn?: number;
      prefix?: string;
      metadata?: Record<string, unknown>;
    }) => {
      return await createApiKey({ name, expiresIn, prefix, metadata });
    },
    onSuccess: async (data) => {
      // Invalidate API keys to show the new key
      await queryClient.refetchQueries({
        queryKey: userQueryKeys.apiKeys,
        type: 'active',
      });

      // Auto-copy the API key to clipboard if available
      if (data?.key) {
        const copySuccess = await copyToClipboard(data.key);
        if (copySuccess) {
          toast.success('API key created and copied to clipboard!');
        } else {
          toast.success('API key created successfully');
        }
      } else {
        toast.success('API key created successfully');
      }
    },
    onError: (error) => {
      console.error('Failed to create API key:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create API key',
      );
    },
  });
};

/**
 * Hook for updating an API key with optimistic updates
 */
export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      keyId,
      name,
      enabled,
      expiresIn,
      metadata,
    }: {
      keyId: string;
      name?: string;
      enabled?: boolean;
      expiresIn?: number;
      metadata?: Record<string, unknown>;
    }) => {
      return await updateApiKey({ keyId, name, enabled, expiresIn, metadata });
    },
    onMutate: async ({ keyId, name, enabled, expiresIn, metadata }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.apiKeys });

      // Snapshot previous value
      const previousApiKeys = queryClient.getQueryData<ListApiKeys>(
        userQueryKeys.apiKeys,
      );

      // Optimistically update the API key
      queryClient.setQueryData<ListApiKeys>(userQueryKeys.apiKeys, (old) => {
        if (!old) {
          return old;
        }
        return old.map((apiKey) =>
          apiKey.id === keyId
            ? {
                ...apiKey,
                ...(name !== undefined && { name }),
                ...(enabled !== undefined && { enabled }),
                ...(expiresIn !== undefined && {
                  expiresAt: expiresIn
                    ? new Date(Date.now() + expiresIn * 1000)
                    : null,
                }),
                ...(metadata !== undefined && { metadata }),
              }
            : apiKey,
        );
      });

      return { previousApiKeys, keyId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousApiKeys) {
        queryClient.setQueryData(
          userQueryKeys.apiKeys,
          context.previousApiKeys,
        );
      }

      console.error('Failed to update API key:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update API key',
      );
    },
    onSuccess: async () => {
      // Invalidate API keys to show the updated key
      await queryClient.refetchQueries({
        queryKey: userQueryKeys.apiKeys,
        type: 'active',
      });
      toast.success('API key updated successfully');
    },
  });
};

/**
 * Hook for deleting an API key without optimistic updates
 * Waits for server confirmation before updating the UI
 */
export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      // DISABLED: WE ARE NOT CREATING USING PLAYGROUND API KEYS FOR USERS FOR NOW
      // Get current API keys to check if this is a protected playground key
      // const currentApiKeys = queryClient.getQueryData<ListApiKeys>(
      //   userQueryKeys.apiKeys,
      // );

      // const keyToDelete = currentApiKeys?.find((key) => key.id === keyId);

      // if (keyToDelete) {
      //   // Check if this is a protected PLAYGROUND_API_KEY
      //   let metadata = keyToDelete.metadata;
      //   if (typeof metadata === 'string') {
      //     try {
      //       metadata = JSON.parse(metadata);
      //     } catch (e) {
      //       metadata = null;
      //     }
      //   }

      //   if (
      //     keyToDelete.name === 'PLAYGROUND_API_KEY' &&
      //     metadata &&
      //     typeof metadata === 'object' &&
      //     (metadata as Record<string, unknown>).type === 'auto-generated' &&
      //     (metadata as Record<string, unknown>).purpose === 'playground'
      //   ) {
      //     throw new Error(
      //       'This key is managed by the system and cannot be deleted',
      //     );
      //   }
      // }

      return await deleteApiKey(keyId);
    },
    // Removed onMutate to disable optimistic updates
    // UI will only update after successful deletion is confirmed
    onError: (error) => {
      console.error('Failed to delete API key:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete API key',
      );
    },
    onSuccess: async () => {
      toast.success('API key deleted successfully');
      // Invalidate to remove the deleted key from UI
      await queryClient.refetchQueries({
        queryKey: userQueryKeys.apiKeys,
        type: 'active',
      });
    },
  });
};

/**
 * Custom hook for handling auth redirect URLs
 */
export function useAuthRedirect(redirectTo?: string) {
  const getRedirectTo = useCallback(() => {
    // Priority order for determining redirect destination:
    // 1. Explicit prop passed to the hook
    // 2. URL parameter from current page (for client-server separated architecture)
    // 3. Default to app index page

    if (redirectTo && redirectTo !== getAppRoute(BASE_APP_PATH)) {
      return redirectTo;
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

    return getAppRoute(BASE_APP_PATH);
  }, [redirectTo]);

  const getFrontendCallbackURL = useCallback(
    (redirectToParam?: string) => {
      const redirectPath = redirectToParam || getRedirectTo();

      // Get the current frontend origin (where the Next.js app is running)
      // Callback URLs should ALWAYS point to the frontend app, never to the auth service
      const frontendOrigin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NODE_ENV === 'production'
            ? (process.env.NEXT_PUBLIC_APP_URL as string) // Always use frontend app URL
            : 'http://localhost:3000'; // Development frontend URL

      // Use URL constructor for robust URL construction
      try {
        const url = new URL(frontendOrigin);

        if (redirectPath) {
          // Handle both absolute and relative paths
          if (redirectPath.startsWith('http')) {
            // If it's a full URL, extract just the pathname and search
            const redirectUrl = new URL(redirectPath);
            url.pathname = redirectUrl.pathname;
            url.search = redirectUrl.search;
          } else {
            // Ensure the path starts with a slash and doesn't have double slashes
            const normalizedPath = redirectPath.startsWith('/')
              ? redirectPath
              : `/${redirectPath}`;
            url.pathname = normalizedPath;
          }
        }

        return url.toString().replace(/\/$/, ''); // Remove trailing slash
      } catch (error) {
        console.warn(
          'URL construction failed in getFrontendCallbackURL:',
          error,
        );
        // Fallback to simple string concatenation
        const normalizedPath = redirectPath?.startsWith('/')
          ? redirectPath
          : `/${redirectPath || ''}`;
        return `${frontendOrigin}${normalizedPath}`.replace(/\/$/, ''); // Remove trailing slash
      }
    },
    [getRedirectTo],
  );

  return {
    getRedirectTo,
    getFrontendCallbackURL,
  };
}
