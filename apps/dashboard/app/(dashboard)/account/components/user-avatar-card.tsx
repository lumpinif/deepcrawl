'use client';

import type { Session } from '@deepcrawl/auth/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@deepcrawl/ui/components/ui/avatar';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { CalendarDays, Mail, Shield, User } from 'lucide-react';

export interface UserAvatarCardProps {
  session: Session;
}

export function UserAvatarCard({ session }: UserAvatarCardProps) {
  const user = session?.user;

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>Your account information and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || 'User'}
            />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              {user.name || 'No name set'}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
            <Shield className="mr-1 h-3 w-3" />
            {user.emailVerified ? 'Email Verified' : 'Email Unverified'}
          </Badge>
          {user.role && <Badge variant="outline">Role: {user.role}</Badge>}
          {user.banned && <Badge variant="destructive">Banned</Badge>}
        </div>

        {/* Join Date */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
      </CardContent>
    </Card>
  );
}
