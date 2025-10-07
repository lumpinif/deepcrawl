'use client';

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
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SpinnerButton } from '@/components/spinner-button';
import {
  useChangePassword,
  useHasPassword,
  useSetPassword,
} from '@/hooks/auth.hooks';
import { sessionQueryOptionsClient } from '@/query/query-options.client';
import { PasswordChangeCardSkeleton } from './account-skeletons';

export function PasswordChangeCard() {
  const { data: currentSession, isPending: isPendingSession } = useQuery(
    sessionQueryOptionsClient(),
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
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const isPending = isChangingPending || isSettingPending;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Set mounted state to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-cleanup hash after highlighting effect
  useEffect(() => {
    if (window.location.hash === '#password-card') {
      setIsHighlighted(true);
      const timeoutId = setTimeout(() => {
        const url = new URL(window.location.href);
        url.hash = '';
        window.history.replaceState({}, '', url.pathname + url.search);
        setIsHighlighted(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, searchParams]);

  if (isPendingSession) {
    return <PasswordChangeCardSkeleton />;
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
    <Card
      className={cn(
        'transition-all duration-300',
        'target:shadow-lg target:ring-2 target:ring-primary',
        isHighlighted && 'animate-pulse shadow-lg ring-2 ring-primary',
      )}
      id="password-card"
    >
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
                {isMounted
                  ? hasPassword
                    ? 'Update your account password'
                    : 'Set a password for your account'
                  : 'Manage your account password'}
              </div>
            </div>
          </div>
          {!(isChangingPassword || isSettingPassword) && (
            <Button
              className="max-sm:w-full"
              disabled={isPending || !isMounted}
              onClick={() => {
                if (hasPassword) {
                  setIsChangingPassword(true);
                } else {
                  setIsSettingPassword(true);
                }
              }}
              size="sm"
              variant="outline"
            >
              {isMounted
                ? hasPassword
                  ? 'Change Password'
                  : 'Set Password'
                : 'Loading...'}
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
                  className="!bg-background"
                  disabled={isPending}
                  id="current-password"
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      current: e.target.value,
                    }))
                  }
                  placeholder="Enter your current password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.current}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled={isPending}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  size="sm"
                  type="button"
                  variant="ghost"
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
                  className="!bg-background"
                  disabled={isPending}
                  id="new-password"
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, new: e.target.value }))
                  }
                  placeholder="Enter your new password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled={isPending}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  size="sm"
                  type="button"
                  variant="ghost"
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
                  className="!bg-background"
                  disabled={isPending}
                  id="confirm-password"
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled={isPending}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  size="sm"
                  type="button"
                  variant="ghost"
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
                className="min-w-32 max-sm:flex-1"
                disabled={!isFormValid || isPending}
                isLoading={isPending}
                onClick={handlePasswordChange}
                size="sm"
              >
                Change Password
              </SpinnerButton>
              <Button
                disabled={isPending}
                onClick={handleCancel}
                size="sm"
                variant="outline"
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
                  className="!bg-background"
                  disabled={isPending}
                  id="set-new-password"
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, new: e.target.value }))
                  }
                  placeholder="Enter your new password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled={isPending}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  size="sm"
                  type="button"
                  variant="ghost"
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
                  className="!bg-background"
                  disabled={isPending}
                  id="set-confirm-password"
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                />
                <Button
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  disabled={isPending}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  size="sm"
                  type="button"
                  variant="ghost"
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
                className="min-w-32 max-sm:flex-1"
                disabled={!isSetPasswordFormValid || isPending}
                isLoading={isPending}
                onClick={handleSetPassword}
                size="sm"
              >
                Set Password
              </SpinnerButton>
              <Button
                disabled={isPending}
                onClick={handleCancel}
                size="sm"
                variant="outline"
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
