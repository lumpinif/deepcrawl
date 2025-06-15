'use client';

import { useAuthSession } from '@/hooks/auth.hooks';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { cn } from '@deepcrawl/ui/lib/utils';
import { IconShieldLockFilled, IconShieldOff } from '@tabler/icons-react';
import { Loader2, Mail } from 'lucide-react';

export function UserEmailCard() {
  const { data: session, isLoading } = useAuthSession();
  const user = session?.user;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Address
          </CardTitle>
          <CardDescription>
            Your primary email address for account access and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Address
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

  const handleResendVerification = async () => {
    // TODO: Implement email verification resend with Better Auth
    console.log('Resending verification email to:', user.email);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Address
        </CardTitle>
        <CardDescription>
          Your primary email address for account access and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                Primary email
              </span>
            </div>
            <div className="font-medium">{user.email}</div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'select-none text-muted-foreground text-xs',
              user.emailVerified && 'text-green-600',
            )}
          >
            {user.emailVerified ? <IconShieldLockFilled /> : <IconShieldOff />}
            {user.emailVerified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
