'use client';

import { userQueryKeys } from '@/hooks/auth.hooks';
import type { ClientSession } from '@/lib/auth.client-types';
import { useQuery } from '@tanstack/react-query';
import { PasswordChangeCard } from './password-change-card';
import { ProvidersManagementCard } from './providers-management-card';
import { SessionsManagementCard } from './sessions-management-card';
import { UserAvatarCard } from './user-avatar-card';
import { UserEmailCard } from './user-email-card';
import { UserNameCard } from './user-name-card';

// Define types for the different session API responses
type ActiveSession = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
};

type DeviceSession =
  | {
      session: ActiveSession;
      user?: {
        id: string;
        name?: string;
        email: string;
      };
    }
  | ActiveSession; // Can be either format based on Better Auth API

interface AccountClientProps {
  initialSession: ClientSession;
  initialListSessions: ActiveSession[];
  initialDeviceSessions: DeviceSession[];
}

export function AccountClient({
  initialSession,
  initialListSessions,
  initialDeviceSessions,
}: AccountClientProps) {
  // Use TanStack Query to get the prefetched data
  const { data: session } = useQuery({
    queryKey: userQueryKeys.session,
    initialData: initialSession,
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: listSessions } = useQuery({
    queryKey: userQueryKeys.listSessions,
    initialData: initialListSessions,
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: deviceSessions } = useQuery({
    queryKey: userQueryKeys.deviceSessions,
    initialData: initialDeviceSessions,
    staleTime: 60 * 1000, // 1 minute
  });

  if (!session?.user) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="text-center">
          <h2 className="font-semibold text-lg">No session found</h2>
          <p className="text-muted-foreground">
            Please sign in to access your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Account Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and security preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Profile Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <UserAvatarCard session={session} />
          <UserNameCard session={session} />
        </div>

        {/* Account Information */}
        <UserEmailCard session={session} />

        {/* Security & Sessions */}
        <SessionsManagementCard
          activeSessions={listSessions || []}
          deviceSessions={deviceSessions || []}
        />

        {/* Authentication Methods */}
        <ProvidersManagementCard session={session} />

        {/* Password Management */}
        <PasswordChangeCard session={session} />
      </div>
    </div>
  );
}
