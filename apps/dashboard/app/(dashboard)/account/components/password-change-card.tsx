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
import { Eye, EyeOff, Key, Save, Shield } from 'lucide-react';
import { useState } from 'react';

export interface PasswordChangeCardProps {
  session: Session;
}

export function PasswordChangeCard({ session }: PasswordChangeCardProps) {
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

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password Security</CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      console.error('Passwords do not match');
      return;
    }

    // TODO: Implement password change with Better Auth
    console.log('Changing password for user:', user.id);

    // Reset form
    setPasswords({ current: '', new: '', confirm: '' });
    setIsChangingPassword(false);
  };

  const handleCancel = () => {
    setPasswords({ current: '', new: '', confirm: '' });
    setIsChangingPassword(false);
  };

  const passwordsMatch = passwords.new === passwords.confirm;
  const isFormValid =
    passwords.current && passwords.new && passwords.confirm && passwordsMatch;

  // Mock password security info - in a real app, this might come from the session
  const lastPasswordChange = user.updatedAt;
  const passwordAge = Math.floor(
    (Date.now() - new Date(lastPasswordChange).getTime()) /
      (1000 * 60 * 60 * 24),
  );

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
        {/* Password Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">Password Status</div>
              <div className="text-xs text-muted-foreground">
                Last changed {passwordAge} days ago
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
          >
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </Button>
        </div>

        {/* Password Change Form */}
        {isChangingPassword && (
          <div className="space-y-4 p-4 border rounded-lg">
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwords.confirm && !passwordsMatch && (
                <div className="text-sm text-destructive">
                  Passwords do not match
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handlePasswordChange}
                disabled={!isFormValid}
                size="sm"
              >
                <Save className="mr-1 h-3 w-3" />
                Update Password
              </Button>
              <Button variant="outline" onClick={handleCancel} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Security Recommendations */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="font-medium">Security recommendations:</div>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Use a strong, unique password</li>
              <li>Include numbers, symbols, and mixed case letters</li>
              <li>Consider using a password manager</li>
              <li>Change your password if you suspect it's been compromised</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
