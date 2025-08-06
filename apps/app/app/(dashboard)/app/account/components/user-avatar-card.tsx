'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@deepcrawl/ui/components/ui/avatar';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { cn } from '@deepcrawl/ui/lib/utils';
import {
  IconShieldLockFilled,
  IconShieldOff,
  IconUser,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Mail } from 'lucide-react';
import { sessionQueryOptionsClient } from '@/query/query-options.client';
import { UserAvatarCardSkeleton } from './account-skeletons';

export function UserAvatarCard() {
  const { data: currentSession, isPending } = useQuery(
    sessionQueryOptionsClient(),
  );

  if (isPending) {
    return (
      // <Card>
      //   <CardHeader>
      //     <CardTitle className="flex items-center gap-2">
      //       <IconUser className="h-5 w-5" />
      //       User Profile
      //     </CardTitle>
      //     <CardDescription>Your account information and status</CardDescription>
      //   </CardHeader>
      //   <CardContent className="space-y-4">
      //     <div className="flex items-center justify-center py-8">
      //       <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      //     </div>
      //   </CardContent>
      // </Card>
      <UserAvatarCardSkeleton />
    );
  }

  const user = currentSession?.user;

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-muted-foreground">
            Unable to load user information
          </div>
        </CardContent>
      </Card>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || '?';

  return (
    <Card className="group/user-avatar-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUser className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>Your account information and status</CardDescription>
        <CardAction>
          <span
            title={user.emailVerified ? 'Verified' : 'Unverified'}
            className={cn(
              'flex select-none items-center gap-1 border-none text-muted-foreground/10 text-xs shadow-none transition-colors duration-200 ease-out group-hover/user-avatar-card:text-muted-foreground/20',
              user.emailVerified &&
                'group-hover/user-avatar-card:text-green-600',
            )}
          >
            {user.emailVerified ? (
              <IconShieldLockFilled className="size-4 md:size-5" />
            ) : (
              <IconShieldOff className="size-4 md:size-5" />
            )}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <Avatar className="size-20 border shadow-sm max-sm:size-16 dark:border-none">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || 'User'}
            />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {user.name || 'No name set'}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {/* Join Date */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <CalendarDays className="h-4 w-4" />
          <span>
            Joined{' '}
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
