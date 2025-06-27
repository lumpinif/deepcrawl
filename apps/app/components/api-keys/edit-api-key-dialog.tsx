'use client';

import { SpinnerButton } from '@/components/spinner-button';
import { useUpdateApiKey } from '@/hooks/auth.hooks';
import type { ApiKeyResponse } from '@deepcrawl/auth/types';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@deepcrawl/ui/components/ui/dialog';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import { useEffect, useState } from 'react';

interface EditApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKeyResponse;
  onClose: () => void;
}

export function EditApiKeyDialog({
  open,
  onOpenChange,
  apiKey,
  onClose,
}: EditApiKeyDialogProps) {
  const updateApiKey = useUpdateApiKey();
  const [name, setName] = useState(apiKey.name || '');
  const [enabled, setEnabled] = useState(apiKey.enabled);

  // Reset form when apiKey changes
  useEffect(() => {
    setName(apiKey.name || '');
    setEnabled(apiKey.enabled);
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateApiKey.mutate(
      {
        keyId: apiKey.id,
        name: name.trim() || undefined,
        enabled,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const hasChanges =
    name.trim() !== (apiKey.name || '') || enabled !== apiKey.enabled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Update the name and status of your API key.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter API key name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enabled" className="text-right">
                Enabled
              </Label>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SpinnerButton
              type="submit"
              className="w-full sm:w-32"
              disabled={!hasChanges || updateApiKey.isPending}
              isLoading={updateApiKey.isPending}
            >
              Update API Key
            </SpinnerButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
