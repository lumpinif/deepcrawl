'use client';

import { revalidateSessionCaches } from '@/app/actions/auth';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { authClient } from '@/lib/auth.client';
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

      // Invalidate server-side caches
      await revalidateSessionCaches();
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

      // Invalidate server-side caches
      await revalidateSessionCaches();
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

      // Invalidate server-side caches
      await revalidateSessionCaches();
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
