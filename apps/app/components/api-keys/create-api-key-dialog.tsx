'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';

import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@deepcrawl/ui/components/ui/responsive-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@deepcrawl/ui/components/ui/select';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import CopyButton from '@/components/copy-button';
import { SpinnerButton } from '@/components/spinner-button';
import { useCreateApiKey } from '@/hooks/auth.hooks';

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateApiKeyDialog({
  open,
  onOpenChange,
}: CreateApiKeyDialogProps) {
  const createApiKey = useCreateApiKey();
  const [name, setName] = useState('');
  const [expirationDays, setExpirationDays] = useState<string>('never');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Reset state when dialog closes (including when clicking outside or pressing Escape)
  useEffect(() => {
    if (!open) {
      // Add a small delay to prevent UI flickering when showing createdKey
      const timeoutId = setTimeout(() => {
        setName('');
        setCreatedKey(null);
        setExpirationDays('never');
      }, 150); // Delay reset until after dialog close animation

      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let expiresIn: number | undefined;
    if (expirationDays !== 'never') {
      const days = Number.parseInt(expirationDays, 10);
      expiresIn = days * 24 * 60 * 60; // Convert days to seconds
    }

    createApiKey.mutate(
      {
        name: name.trim() || undefined,
        expiresIn,
        prefix: 'dc_',
      },
      {
        onSuccess: (data) => {
          if (data?.key) {
            setCreatedKey(data.key);
          }
        },
      },
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    // State will be reset via useEffect with delay to prevent flickering
  };

  return (
    <ResponsiveDialog
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        // State will be reset via useEffect with delay to prevent flickering
      }}
      open={open}
    >
      {createdKey ? (
        <ResponsiveDialogContent className="space-y-4 outline-none ring-0 sm:max-w-xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              API Key Created Successfully
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="flex w-full items-center gap-2">
            <span className="flex-1 shrink-0 break-all rounded-lg border bg-muted p-2 px-4 font-mono text-sm tracking-wide">
              {createdKey}
            </span>
            <CopyButton textToCopy={createdKey || ''} />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Separator className="h-full" orientation="vertical" />
            <div>
              <h4 className="font-semibold text-sm">
                Important Security Notice
              </h4>
              <p className="mt-1 text-sm">
                This is only shown once. Make sure to copy it to a safe
                location. If you lose it, you&apos;ll need to create a new one.
              </p>
            </div>
          </div>
        </ResponsiveDialogContent>
      ) : (
        <ResponsiveDialogContent className="sm:max-w-xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Create API Key</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Create a new API key to access Deepcrawl services.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="expiration">
                  Expires
                </Label>
                <Select
                  onValueChange={setExpirationDays}
                  value={expirationDays}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="name">
                  Name
                </Label>
                <Input
                  className="col-span-3"
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My API Key"
                  value={name}
                />
              </div>
            </div>
            <ResponsiveDialogFooter>
              <SpinnerButton
                className="w-full sm:w-32"
                disabled={createApiKey.isPending}
                isLoading={createApiKey.isPending}
                type="submit"
              >
                Create API Key
              </SpinnerButton>
              <ResponsiveDialogClose>
                <Button onClick={handleClose} type="button" variant="outline">
                  Cancel
                </Button>
              </ResponsiveDialogClose>
            </ResponsiveDialogFooter>
          </form>
        </ResponsiveDialogContent>
      )}
    </ResponsiveDialog>
  );
}
