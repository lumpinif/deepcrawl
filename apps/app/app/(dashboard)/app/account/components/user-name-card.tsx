'use client';

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
import { Edit3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { SpinnerButton } from '@/components/spinner-button';
import { useUpdateUserName } from '@/hooks/auth.hooks';
import { sessionQueryOptionsClient } from '@/query/query-options.client';
import { UserNameCardSkeleton } from './account-skeletons';

// Validation schema for display name
const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(32, 'Display name must be 32 characters or less')
  .trim();

export function UserNameCard() {
  const { data: currentSession, isPending: queryPending } = useQuery(
    sessionQueryOptionsClient(),
  );
  const user = currentSession?.user;

  const { mutate: updateUserName, isPending } = useUpdateUserName();

  const [name, setName] = useState(user?.name || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update local state when user data changes
  useEffect(() => {
    setName(user?.name || '');
    setValidationError(null);
  }, [user?.name]);

  // Validate name on change
  useEffect(() => {
    if (!name) {
      setValidationError(null);
      return;
    }

    const result = displayNameSchema.safeParse(name);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message || 'Invalid name');
    } else {
      setValidationError(null);
    }
  }, [name]);

  if (queryPending) {
    return (
      // <Card>
      //   <CardHeader>
      //     <CardTitle className="flex items-center gap-2">
      //       <Edit3 className="h-5 w-5" />
      //       Display Name
      //     </CardTitle>
      //     <CardDescription>
      //       Your display name is visible to other users
      //     </CardDescription>
      //   </CardHeader>
      //   <CardContent className="space-y-4">
      //     <div className="flex items-center justify-center py-8">
      //       <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      //     </div>
      //   </CardContent>
      // </Card>
      <UserNameCardSkeleton />
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Display Name
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

  const handleSave = async () => {
    // Validate before saving
    const result = displayNameSchema.safeParse(name);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message || 'Invalid display name');
      return;
    }

    const trimmedName = result.data;
    if (trimmedName === user.name) {
      return;
    }

    updateUserName(trimmedName);
  };

  const isValid = !validationError && name.trim().length > 0;
  const hasChanges = name.trim() !== user.name;
  const canSave = isValid && hasChanges && !isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Display Name
        </CardTitle>
        <CardDescription>
          Please enter your full name, or a display name you are comfortable
          with.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Display Name</Label>
              <span className="text-muted-foreground text-xs">
                {name.length}/32
              </span>
            </div>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              disabled={isPending}
              placeholder="Enter your display name"
              className={cn(
                '!bg-background',
                validationError && 'border-destructive',
              )}
            />
            {validationError && (
              <p className="text-destructive text-sm">{validationError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <SpinnerButton
              size="sm"
              className="w-16"
              onClick={handleSave}
              isLoading={isPending}
              disabled={!canSave}
            >
              Save
            </SpinnerButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
