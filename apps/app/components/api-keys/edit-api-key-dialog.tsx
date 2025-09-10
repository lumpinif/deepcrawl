'use client';

import type { ApiKey } from '@deepcrawl/auth/types';
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
import { SpinnerButton } from '@/components/spinner-button';
import { useUpdateApiKey } from '@/hooks/auth.hooks';

interface EditApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey;
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
    <Dialog onOpenChange={onOpenChange} open={open}>
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
              <Label className="text-right" htmlFor="name">
                Name
              </Label>
              <Input
                className="col-span-3"
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter API key name"
                value={name}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="enabled">
                Enabled
              </Label>
              <Switch
                checked={enabled}
                id="enabled"
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <SpinnerButton
              className="w-full sm:w-32"
              disabled={!hasChanges || updateApiKey.isPending}
              isLoading={updateApiKey.isPending}
              type="submit"
            >
              Update API Key
            </SpinnerButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
