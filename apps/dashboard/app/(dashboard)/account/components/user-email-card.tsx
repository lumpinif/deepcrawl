'use client';

import type { Session } from '@deepcrawl/auth/types';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { AlertCircle, CheckCircle, Mail, Send } from 'lucide-react';

export interface UserEmailCardProps {
  session: Session;
}

export function UserEmailCard({ session }: UserEmailCardProps) {
  const user = session?.user;

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleResendVerification = async () => {
    // TODO: Implement email verification resend
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
            <div className="font-medium">{user.email}</div>
            <div className="flex items-center gap-2">
              {user.emailVerified ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Primary email
              </span>
            </div>
          </div>

          {!user.emailVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
            >
              <Send className="mr-1 h-3 w-3" />
              Resend Verification
            </Button>
          )}
        </div>

        {/* Email Status Info */}
        {!user.emailVerified && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-orange-600 dark:text-orange-400" />
              <div className="space-y-1">
                <div className="font-medium text-sm text-orange-800 dark:text-orange-200">
                  Email verification required
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  Please check your inbox and click the verification link to
                  secure your account.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
