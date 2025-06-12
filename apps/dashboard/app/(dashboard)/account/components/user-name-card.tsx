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
import { Edit3, Save, X } from 'lucide-react';
import { useState } from 'react';

export interface UserNameCardProps {
  session: Session;
}

export function UserNameCard({ session }: UserNameCardProps) {
  const user = session?.user;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSave = async () => {
    // TODO: Implement name update with Better Auth
    console.log('Updating name to:', name);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user.name || '');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Display Name
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Your display name is visible to other users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-medium">
              {user.name || (
                <span className="text-muted-foreground italic">
                  No display name set
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(user.updatedAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
