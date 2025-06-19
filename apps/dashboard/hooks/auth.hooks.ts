'use client';

import {
  createApiKey,
  deleteApiKey,
  removeUserPasskey,
  updateApiKey,
  updateMostRecentPasskeyName,
} from '@/app/actions/auth';
import {
  getAuthErrorMessage,
  isWebAuthnCancellationError,
} from '@/lib/auth-errors';
import { authClient } from '@/lib/auth.client';
import { generatePasskeyName } from '@/lib/passkey-utils';
import { userQueryKeys } from '@/lib/query-keys';
import {
  apiKeysQueryOptions,
  deviceSessionsQueryOptions,
  linkedAccountsQueryOptions,
  listSessionsQueryOptions,
  organizationQueryOptions,
  sessionQueryOptions,
  userPasskeysQueryOptions,
} from '@/lib/query-options';
import { getSearchParam } from '@/utils';
import type { ApiKey, Session } from '@deepcrawl/auth/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

// Type definitions for session data
type SessionData = Session['session'];
type SessionsList = SessionData[];

// Type definition for passkey data (from fetchUserPasskeys)
// Note: createdAt comes as string from server action due to JSON serialization
type PasskeyData = {
  id: string;
  name: string | null;
  deviceType: string;
  createdAt: Date | string | null;
  backedUp: boolean;
  transports: string | null;
};

// Validation schemas
const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(32, 'Display name must be 32 characters or less')
  .trim();

// Hooks with query options
export const useAuthSession = () => useQuery(sessionQueryOptions());

/**
 * Hook for getting active sessions with proper error handling and full type inference
 */
export const useListSessions = () => {
  return useQuery(listSessionsQueryOptions());
};

/**
 * Hook for getting device sessions with proper error handling and full type inference
 */
export const useDeviceSessions = () => {
  const result = useQuery(deviceSessionsQueryOptions());

  return result;
};

/**
 * Hook for getting organization data with proper error handling and full type inference
 */
export const useOrganization = () => {
  return useQuery(organizationQueryOptions());
};

/**
 * Hook for fetching user's passkeys with proper error handling and caching
 */
export const useUserPasskeys = () => {
  return useQuery(userPasskeysQueryOptions());
};

/**
 * Hook for fetching user's linked OAuth accounts with proper error handling and caching
 */
export const useLinkedAccounts = () => {
  return useQuery(linkedAccountsQueryOptions());
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
    onSuccess: async () => {
      // Invalidate and refetch all session-related queries immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.session }),
        queryClient.invalidateQueries({
          queryKey: userQueryKeys.deviceSessions,
        }),
        queryClient.invalidateQueries({ queryKey: userQueryKeys.listSessions }),
      ]);

      // Force immediate refetch to ensure data is fresh
      await Promise.all([
        queryClient.refetchQueries({ queryKey: userQueryKeys.session }),
        queryClient.refetchQueries({ queryKey: userQueryKeys.deviceSessions }),
      ]);

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
    onMutate: async (sessionToken: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: userQueryKeys.deviceSessions,
      });

      // Snapshot previous value
      const previousDeviceSessions = queryClient.getQueryData<Session[]>(
        userQueryKeys.deviceSessions,
      );

      // Optimistically update to remove the session
      queryClient.setQueryData<Session[]>(
        userQueryKeys.deviceSessions,
        (old) => {
          if (!old) return old;
          return old.filter(
            (sessionData) => sessionData.session.token !== sessionToken,
          );
        },
      );

      return { previousDeviceSessions, sessionToken };
    },
    onError: (err, sessionToken, context) => {
      // Rollback on error
      if (context?.previousDeviceSessions) {
        queryClient.setQueryData(
          userQueryKeys.deviceSessions,
          context.previousDeviceSessions,
        );
      }
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
        if (window.location.pathname !== '/logout') {
          router.push('/logout');
        }
        return;
      }

      toast.success('Account removed successfully');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.deviceSessions });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.listSessions });
    },
  });
};

/**
 * Hook to check if a user can safely unlink a specific provider without getting locked out
 */
export const useCanUnlinkProvider = (providerId: string) => {
  const { data: session } = useAuthSession();
  const { data: linkedAccounts = [] } = useLinkedAccounts();
  const { data: passkeys = [] } = useUserPasskeys();

  // Check available authentication methods
  const hasPassword = !!session?.user?.emailVerified; // Users with verified email can use email auth
  const hasPasskeys = passkeys.length > 0;
  const otherOAuthAccounts = linkedAccounts.filter(
    (account) => account.providerId !== providerId,
  );
  const hasOtherOAuth = otherOAuthAccounts.length > 0;

  // User can unlink if they have at least one other authentication method
  const canUnlink = hasPassword || hasPasskeys || hasOtherOAuth;

  // Provide detailed information about why they can't unlink
  const reasons = [];
  if (!hasPassword) reasons.push('set up a password');
  if (!hasPasskeys) reasons.push('add a passkey');
  if (!hasOtherOAuth) reasons.push('link another social account');

  return {
    canUnlink,
    hasPassword,
    hasPasskeys,
    hasOtherOAuth,
    totalAuthMethods:
      (hasPassword ? 1 : 0) + passkeys.length + linkedAccounts.length,
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
        if (!old?.user) return old;
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
        toast.error(err.errors[0]?.message || 'Invalid display name');
      } else {
        toast.error(err.message || 'Failed to update display name');
      }
    },
    onSuccess: async () => {
      toast.success('Display name updated successfully');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
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

      // Invalidate session queries if other sessions were revoked
      queryClient.invalidateQueries({ queryKey: userQueryKeys.listSessions });
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.deviceSessions,
      });

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
 * Hook for revoking a specific session with optimistic updates
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const result = await authClient.revokeSession({
        token: sessionToken,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    onMutate: async (sessionToken: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.listSessions });

      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<SessionsList>(
        userQueryKeys.listSessions,
      );

      // Optimistically update to remove the session
      queryClient.setQueryData<SessionsList>(
        userQueryKeys.listSessions,
        (old) => {
          if (!old) return old;
          return old.filter((session) => session.token !== sessionToken);
        },
      );

      return { previousSessions, sessionToken };
    },
    onError: (err, sessionToken, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(
          userQueryKeys.listSessions,
          context.previousSessions,
        );
      }
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
        if (window.location.pathname !== '/logout') {
          router.push('/logout');
        }
        return;
      }

      toast.success('Session terminated successfully');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.listSessions });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.deviceSessions });
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
    onSuccess: async () => {
      toast.success('All other sessions terminated successfully');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.listSessions });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.deviceSessions });
    },
  });
};

/**
 * Hook for linking a social provider to current account
 */
export const useLinkSocialProvider = () => {
  const { getFrontendCallbackURL } = useAuthRedirect('account');

  return useMutation({
    mutationFn: async ({
      provider,
      redirectTo = 'account',
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
    // Remove onSuccess - OAuth redirects mean we won't be here when linking completes
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

      // Invalidate both session and linked accounts to refresh data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.linkedAccounts });
    },
  });
};

/**
 * Hook for adding a new passkey to current account
 */
export const useAddPasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      authenticatorAttachment,
    }: {
      authenticatorAttachment?: 'platform' | 'cross-platform';
    } = {}) => {
      // First, create the passkey with Better Auth
      const result = await authClient.passkey.addPasskey({
        authenticatorAttachment,
      });

      if (result?.error) {
        throw new Error(getAuthErrorMessage(result.error));
      }

      // Generate a meaningful name based on the device and browser
      const passkeyName = generatePasskeyName(authenticatorAttachment);

      // Update the most recent passkey name (the one we just created)
      try {
        await updateMostRecentPasskeyName(passkeyName);
      } catch (error) {
        // Log error but don't fail the entire operation
        console.warn('Failed to update passkey name:', error);
      }

      return result;
    },
    onSuccess: async () => {
      toast.success('Passkey added successfully');

      // Invalidate client-side caches - server actions always return fresh data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.passkeys });

      // Force refetch to ensure immediate update
      await queryClient.refetchQueries({ queryKey: userQueryKeys.passkeys });
    },
    onError: (error) => {
      // Only show error toast for actual errors, not cancellations
      if (!isWebAuthnCancellationError(error)) {
        toast.error('Failed to add passkey. Please try again.');
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
        (old: PasskeyData[] | undefined) => {
          if (!old) return old;
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
    onSuccess: async () => {
      toast.success('Passkey removed successfully', {
        description:
          "To prevent confusion, also remove it from your machine's password manager.",
        duration: 8000, // Show longer for important info
      });

      // Invalidate related caches to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.passkeys });
    },
  });
};

/**
 * Hook for fetching user's API keys
 */
export const useApiKeys = () => {
  return useQuery(apiKeysQueryOptions());
};

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
    onSuccess: () => {
      // Invalidate and refetch API keys
      queryClient.invalidateQueries({ queryKey: userQueryKeys.apiKeys });
      toast.success('API key created successfully');
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
      const previousApiKeys = queryClient.getQueryData<ApiKey[]>(
        userQueryKeys.apiKeys,
      );

      // Optimistically update the API key
      queryClient.setQueryData<ApiKey[]>(userQueryKeys.apiKeys, (old) => {
        if (!old) return old;
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
    onSuccess: () => {
      toast.success('API key updated successfully');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.apiKeys });
    },
  });
};

/**
 * Hook for deleting an API key with optimistic updates
 */
export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      return await deleteApiKey(keyId);
    },
    onMutate: async (keyId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.apiKeys });

      // Snapshot previous value
      const previousApiKeys = queryClient.getQueryData<ApiKey[]>(
        userQueryKeys.apiKeys,
      );

      // Optimistically remove the API key
      queryClient.setQueryData<ApiKey[]>(userQueryKeys.apiKeys, (old) => {
        if (!old) return old;
        return old.filter((apiKey) => apiKey.id !== keyId);
      });

      return { previousApiKeys, keyId };
    },
    onError: (error, keyId, context) => {
      // Rollback on error
      if (context?.previousApiKeys) {
        queryClient.setQueryData(
          userQueryKeys.apiKeys,
          context.previousApiKeys,
        );
      }

      console.error('Failed to delete API key:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete API key',
      );
    },
    onSuccess: () => {
      toast.success('API key deleted successfully');
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.apiKeys });
    },
  });
};

/**
 * Custom hook for handling auth redirect URLs
 */
export function useAuthRedirect(redirectTo?: string) {
  const getRedirectTo = useCallback(
    () => redirectTo || getSearchParam('redirectTo') || '', // Default to home page
    [redirectTo],
  );

  const getFrontendCallbackURL = useCallback(
    (redirectToParam?: string) => {
      const redirectPath = redirectToParam || getRedirectTo();

      // Get the current frontend origin (where the Next.js app is running)
      // Callback URLs should ALWAYS point to the frontend app, never to the auth service
      const frontendOrigin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_APP_URL || 'https://app.deepcrawl.dev' // Always use frontend app URL
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

        return url.toString();
      } catch (error) {
        console.warn(
          'URL construction failed in getFrontendCallbackURL:',
          error,
        );
        // Fallback to simple string concatenation
        const normalizedPath = redirectPath?.startsWith('/')
          ? redirectPath
          : `/${redirectPath || ''}`;
        return `${frontendOrigin}${normalizedPath}`;
      }
    },
    [getRedirectTo],
  );

  return {
    getRedirectTo,
    getFrontendCallbackURL,
  };
}
