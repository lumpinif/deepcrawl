'use client';

import {
  fetchUserPasskeys,
  removeUserPasskey,
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
  deviceSessionsQueryOptions,
  listSessionsQueryOptions,
  organizationQueryOptions,
  sessionQueryOptions,
} from '@/lib/query-options';
import type { Session } from '@deepcrawl/auth/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

// Type definitions for session data
type SessionData = Session['session'];
type SessionsList = SessionData[];

// Type definition for passkey data (from fetchUserPasskeys)
type PasskeyData = {
  id: string;
  name: string | null;
  deviceType: string;
  createdAt: Date | null;
  backedUp: boolean;
  transports: string | null;
};

// Validation schemas
const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(32, 'Display name must be 32 characters or less')
  .trim();

// Use Better Auth's built-in useSession hook instead of custom implementation
export const useAuthSession = () => useQuery(sessionQueryOptions());

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
 */
export const useRevokeAllOtherSessions = () => {
  const queryClient = useQueryClient();
  const { data: currentSession } = useAuthSession();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.revokeOtherSessions();

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.listSessions });

      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<SessionsList>(
        userQueryKeys.listSessions,
      );

      // Optimistically update to keep only current session
      queryClient.setQueryData<SessionsList>(
        userQueryKeys.listSessions,
        (old) => {
          if (!old || !currentSession?.session) return old;
          return old.filter(
            (session) => session.id === currentSession.session.id,
          );
        },
      );

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(
          userQueryKeys.listSessions,
          context.previousSessions,
        );
      }
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
 * Hook for getting active sessions with proper error handling and full type inference
 */
export const useListSessions = () => {
  return useQuery(listSessionsQueryOptions());
};

/**
 * Hook for getting device sessions with proper error handling and full type inference
 */
export const useDeviceSessions = () => {
  return useQuery(deviceSessionsQueryOptions());
};

/**
 * Hook for getting organization data with proper error handling and full type inference
 */
export const useOrganization = () => {
  return useQuery(organizationQueryOptions());
};

/**
 * Hook for linking a social provider to current account
 */
export const useLinkSocialProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      provider,
      callbackURL,
    }: {
      provider: 'google' | 'github';
      callbackURL?: string;
    }) => {
      const result = await authClient.linkSocial({
        provider,
        callbackURL: callbackURL || '/account',
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }

      return result;
    },
    onSuccess: () => {
      toast.success('Social provider linked successfully');

      // Invalidate session to refresh account data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
    },
    onError: (error) => {
      console.error('Social provider linking failed:', error);
      toast.error('Failed to link social provider. Please try again.');
    },
  });
};

/**
 * Hook for unlinking a social provider from current account
 */
export const useUnlinkSocialProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerId: string) => {
      // Note: Better Auth doesn't have a direct unlink method in the client
      // This would need to be implemented via a custom API endpoint
      // For now, we'll throw an error
      throw new Error('Provider unlinking not yet implemented');
    },
    onSuccess: () => {
      toast.success('Social provider unlinked successfully');

      // Invalidate session to refresh account data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
    },
    onError: (error) => {
      console.error('Social provider unlinking failed:', error);
      toast.error('Failed to unlink social provider. Please try again.');
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
      await queryClient.invalidateQueries({ queryKey: ['user-passkeys'] });

      // Force refetch to ensure immediate update
      await queryClient.refetchQueries({ queryKey: ['user-passkeys'] });
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
      await queryClient.cancelQueries({ queryKey: ['user-passkeys'] });

      // Snapshot previous value for rollback
      const previousPasskeys = queryClient.getQueryData(['user-passkeys']);

      // Optimistically remove the passkey from the cache
      queryClient.setQueryData(
        ['user-passkeys'],
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
        queryClient.setQueryData(['user-passkeys'], context.previousPasskeys);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove passkey';
      toast.error(errorMessage);
    },
    onSuccess: async () => {
      toast.success('Passkey removed successfully', {
        description:
          "To prevent confusion, also remove it from your browser's password manager.",
        duration: 8000, // Show longer for important info
      });

      // Invalidate related caches to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['user-passkeys'] });
    },
  });
};

/**
 * Hook for fetching user's passkeys with proper error handling and caching
 */
export const useUserPasskeys = () => {
  return useQuery({
    queryKey: ['user-passkeys'],
    queryFn: () => fetchUserPasskeys(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
