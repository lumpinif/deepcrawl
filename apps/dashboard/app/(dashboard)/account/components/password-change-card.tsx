'use client';

import { SpinnerButton } from '@/components/spinner-button';
import { useAuthSession, useChangePassword } from '@/hooks/auth.hooks';
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
import { Eye, EyeOff, Key, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function PasswordChangeCard() {
  const { data: session, isLoading } = useAuthSession();
  const { mutate: changePassword, isPending } = useChangePassword(() => {
    setIsChangingPassword(false);
  });
  const user = session?.user;

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  if (isLoading) {
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
        <CardContent className="space-y-6">
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

  const handleCancel = () => {
    setPasswords({ current: '', new: '', confirm: '' });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsChangingPassword(false);
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
        <div className="flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">Password Management</div>
              <div className="text-muted-foreground text-xs">
                Update your account password
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            disabled={isPending}
          >
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </Button>
        </div>

        {/* Password Change Form */}
        {isChangingPassword && (
          <div className="space-y-6 rounded-lg p-4">
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

            <div className="flex justify-end gap-2">
              <SpinnerButton
                size="sm"
                className="min-w-32"
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

        {/* Password Requirements */}
        {isChangingPassword && (
          <div className="flex justify-end space-y-1 text-muted-foreground text-xs">
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
