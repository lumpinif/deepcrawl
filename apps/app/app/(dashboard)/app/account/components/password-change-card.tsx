'use client';

import type { Session } from '@deepcrawl/auth/types';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Key } from 'lucide-react';
import { useState } from 'react';
import { SpinnerButton } from '@/components/spinner-button';
import {
  useChangePassword,
  useHasPassword,
  useSetPassword,
} from '@/hooks/auth.hooks';
import { sessionQueryOptionsClient } from '@/query/query-options.client';
import { PasswordChangeCardSkeleton } from './account-skeletons';

export function PasswordChangeCard(props: { currentSession?: Session | null }) {
  const { data: currentSession, isPending: isPendingSession } = useQuery(
    sessionQueryOptionsClient({ init: props.currentSession }),
  );
  const hasPassword = useHasPassword();
  const { mutate: changePassword, isPending: isChangingPending } =
    useChangePassword(() => {
      setIsChangingPassword(false);
    });
  const { mutate: setPassword, isPending: isSettingPending } = useSetPassword(
    () => {
      setIsSettingPassword(false);
    },
  );
  const user = currentSession?.user;

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const isPending = isChangingPending || isSettingPending;

  if (isPendingSession) {
    return (
      // <Card>
      //   <CardHeader>
      //     <CardTitle className="flex items-center gap-2">
      //       <Key className="h-5 w-5" />
      //       Password Security
      //     </CardTitle>
      //     <CardDescription>
      //       Manage your password and security settings
      //     </CardDescription>
      //   </CardHeader>
      //   <CardContent className="space-y-6">
      //     <div className="flex items-center justify-center py-8">
      //       <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      //     </div>
      //   </CardContent>
      // </Card>
      <PasswordChangeCardSkeleton />
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Security
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

  const passwordsMatch = passwords.new === passwords.confirm;
  const isFormValid =
    passwords.current && passwords.new && passwords.confirm && passwordsMatch;
  const isSetPasswordFormValid =
    passwords.new && passwords.confirm && passwordsMatch;

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      return;
    }

    changePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
      revokeOtherSessions: false,
    });

    // Reset form after submission
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleSetPassword = async () => {
    if (passwords.new !== passwords.confirm) {
      return;
    }

    setPassword(passwords.new);

    // Reset form after submission
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleCancel = () => {
    setPasswords({ current: '', new: '', confirm: '' });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChangingPassword(false);
    setIsSettingPassword(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Password Security
        </CardTitle>
        <CardDescription>
          Manage your password and security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Password Management */}
        <div
          className={cn(
            'flex items-center justify-between rounded-lg p-3 max-sm:flex-col max-sm:gap-y-2',
            (isChangingPassword || isSettingPassword) && 'max-sm:hidden',
          )}
        >
          <div className="flex items-center gap-3 max-sm:hidden">
            <div>
              <div className="font-medium text-sm">
                {isChangingPassword
                  ? 'Changing Password'
                  : isSettingPassword
                    ? 'Setting Password'
                    : 'Password Management'}
              </div>
              <div className="text-muted-foreground text-xs">
                {hasPassword
                  ? 'Update your account password'
                  : 'Set a password for your account'}
              </div>
            </div>
          </div>
          {!isChangingPassword && !isSettingPassword && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              className="max-sm:w-full"
              onClick={() => {
                if (hasPassword) {
                  setIsChangingPassword(true);
                } else {
                  setIsSettingPassword(true);
                }
              }}
            >
              {hasPassword ? 'Change Password' : 'Set Password'}
            </Button>
          )}
        </div>

        {/* Password Change Form */}
        {isChangingPassword && (
          <div className="space-y-6 rounded-lg p-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      current: e.target.value,
                    }))
                  }
                  placeholder="Enter your current password"
                  disabled={isPending}
                  className="!bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isPending}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, new: e.target.value }))
                  }
                  placeholder="Enter your new password"
                  disabled={isPending}
                  className="!bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isPending}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  placeholder="Confirm your new password"
                  disabled={isPending}
                  className="!bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwords.confirm && !passwordsMatch && (
                <div className="text-destructive text-sm">
                  Passwords do not match
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 max-sm:w-full">
              <SpinnerButton
                size="sm"
                className="min-w-32 max-sm:flex-1"
                isLoading={isPending}
                onClick={handlePasswordChange}
                disabled={!isFormValid || isPending}
              >
                Change Password
              </SpinnerButton>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Set Password Form */}
        {isSettingPassword && (
          <div className="space-y-6 rounded-lg p-3">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">
                You signed up using a social account. Set a password to enable
                email/password login.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="set-new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="set-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, new: e.target.value }))
                  }
                  placeholder="Enter your new password"
                  disabled={isPending}
                  className="!bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isPending}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="set-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="set-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  placeholder="Confirm your new password"
                  disabled={isPending}
                  className="!bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwords.confirm && !passwordsMatch && (
                <div className="text-destructive text-sm">
                  Passwords do not match
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 max-sm:w-full">
              <SpinnerButton
                size="sm"
                className="min-w-32 max-sm:flex-1"
                isLoading={isPending}
                onClick={handleSetPassword}
                disabled={!isSetPasswordFormValid || isPending}
              >
                Set Password
              </SpinnerButton>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Password Requirements */}
        {(isChangingPassword || isSettingPassword) && (
          <div className="flex justify-end space-y-1 text-muted-foreground text-xs max-sm:justify-center">
            <div className="font-medium">Password Requirements:</div>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>At least 8 characters long</li>
              {/* <li>Include uppercase and lowercase letters</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li> */}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
