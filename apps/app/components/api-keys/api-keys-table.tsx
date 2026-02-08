'use client';

import type { ListApiKeys } from '@deepcrawl/auth/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@deepcrawl/ui/components/ui/alert-dialog';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Card, CardContent } from '@deepcrawl/ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@deepcrawl/ui/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Eye, EyeOff, MoreHorizontal, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CopyButton from '@/components/copy-button';
import { SpinnerButton } from '@/components/spinner-button';
import { useDeleteApiKey, useUpdateApiKey } from '@/hooks/auth.hooks';
import { useIsHydrated } from '@/hooks/use-hydrated';
import {
  clearStoredPlaygroundApiKey,
  getStoredPlaygroundApiKey,
  isPlaygroundApiKeyName,
} from '@/lib/playground-api-key';
import { regeneratePlaygroundApiKey } from '@/lib/playground-api-key.client';
import { shouldUsePlaygroundApiKey } from '@/lib/playground-api-key-policy';
import { userQueryKeys } from '@/query/query-keys';
import { EditApiKeyDialog } from './edit-api-key-dialog';

interface ApiKeysTableProps {
  apiKeys: ListApiKeys;
}

export function ApiKeysTable({ apiKeys }: ApiKeysTableProps) {
  const queryClient = useQueryClient();
  const deleteApiKey = useDeleteApiKey();
  const updateApiKey = useUpdateApiKey();
  const isHydrated = useIsHydrated();
  const useSystemPlaygroundKey = shouldUsePlaygroundApiKey();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>(
    {},
  );
  const [isRegenerating, setIsRegenerating] = useState(false);

  const storedPlayground = isHydrated ? getStoredPlaygroundApiKey() : null;
  const storedPlaygroundKey = storedPlayground?.key ?? null;
  const storedPlaygroundKeyId = storedPlayground?.keyId ?? null;
  const hasSinglePlaygroundKey =
    apiKeys.filter((apiKey) => isPlaygroundApiKeyName(apiKey.name)).length ===
    1;

  const handleDelete = (keyId: string) => {
    setSelectedKeyId(keyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedKeyId) {
      const keyToDelete =
        apiKeys.find((apiKey) => apiKey.id === selectedKeyId) ?? null;

      deleteApiKey.mutate(selectedKeyId, {
        onSuccess: () => {
          if (keyToDelete && isPlaygroundApiKeyName(keyToDelete.name)) {
            const stored = getStoredPlaygroundApiKey();
            const matchesStored =
              !!stored &&
              (stored.keyId === keyToDelete.id ||
                (typeof keyToDelete.start === 'string' &&
                  stored.key.startsWith(keyToDelete.start)));

            if (matchesStored) {
              clearStoredPlaygroundApiKey();
            }
          }

          // Only close dialog after successful deletion
          setDeleteDialogOpen(false);
          setSelectedKeyId(null);
        },
        onError: () => {
          // Keep dialog open on error so user can retry
          // Error message will be shown via toast from the hook
        },
      });
    }
  };

  const handleEdit = (keyId: string) => {
    setSelectedKeyId(keyId);
    setEditDialogOpen(true);
  };

  const toggleEnabled = (keyId: string, enabled: boolean) => {
    updateApiKey.mutate({ keyId, enabled: !enabled });
  };

  const confirmRotate = async () => {
    if (isRegenerating) {
      return;
    }

    setIsRegenerating(true);

    try {
      const result = await regeneratePlaygroundApiKey();
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.apiKeys });
      setRevealedKeyIds({});
      setRegenerateDialogOpen(false);

      toast.success('Playground API key regenerated.', {
        description: result.revokedPrevious
          ? 'The previous key for this device was revoked.'
          : 'New key created, but we could not revoke the previous one.',
        duration: 8000,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to regenerate API key',
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatExpirationDate = (expiresAt: Date | null) => {
    if (!expiresAt) {
      return <Badge variant="secondary">Never</Badge>;
    }

    const now = new Date();
    const expiration = new Date(expiresAt);

    if (expiration < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return (
      <Badge variant="outline">
        Expires {formatDistanceToNow(expiration, { addSuffix: true })}
      </Badge>
    );
  };

  const formatLastUsed = (lastRequest: Date | null) => {
    if (!lastRequest) {
      return 'Never';
    }
    return formatDistanceToNow(new Date(lastRequest), { addSuffix: true });
  };

  const selectedKey = selectedKeyId
    ? apiKeys.find((key) => key.id === selectedKeyId)
    : null;

  if (apiKeys.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          No API keys found. Create your first API key to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <Table className="hidden bg-card md:table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Last Request</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <TableRow key={apiKey.id}>
              {(() => {
                const isPlaygroundKey = isPlaygroundApiKeyName(apiKey.name);
                const isSystemPlaygroundKey =
                  isPlaygroundKey && useSystemPlaygroundKey;
                const isThisDeviceKey =
                  isPlaygroundKey &&
                  !!storedPlaygroundKey &&
                  (storedPlaygroundKeyId
                    ? storedPlaygroundKeyId === apiKey.id
                    : typeof apiKey.start === 'string'
                      ? storedPlaygroundKey.startsWith(apiKey.start)
                      : hasSinglePlaygroundKey);
                const canReveal = isPlaygroundKey && isThisDeviceKey;
                const isRevealed = revealedKeyIds[apiKey.id] ?? false;
                const shouldShowFullKey = canReveal && isRevealed;

                const maskedValue = apiKey.start
                  ? `${apiKey.start}...`
                  : '•••••••••';

                const keyValue = shouldShowFullKey
                  ? storedPlaygroundKey
                  : maskedValue;

                // Prevent layout shifting when toggling reveal by fixing the
                // badge width to the masked value width (monospace `ch` units).
                const keyWidthCh = `${maskedValue.length + 2}ch`;

                const toggleReveal = () => {
                  setRevealedKeyIds((prev) => ({
                    ...prev,
                    [apiKey.id]: !isRevealed,
                  }));
                };

                return (
                  <>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{apiKey.name || 'Unnamed Key'}</span>
                        {isPlaygroundKey && isHydrated && (
                          <Badge
                            className="hidden md:inline-flex"
                            variant={isThisDeviceKey ? 'outline' : 'secondary'}
                          >
                            {isThisDeviceKey ? 'This device' : 'Other device'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code
                          className="overflow-x-auto overflow-y-hidden whitespace-nowrap rounded bg-muted px-2 py-1 font-mono text-sm"
                          style={
                            isPlaygroundKey ? { width: keyWidthCh } : undefined
                          }
                        >
                          {keyValue}
                        </code>

                        {isPlaygroundKey && (
                          <Button
                            aria-label={
                              shouldShowFullKey
                                ? 'Hide API key'
                                : 'Show API key'
                            }
                            className="h-8 w-8 p-0"
                            disabled={!canReveal}
                            onClick={toggleReveal}
                            size="icon"
                            variant="ghost"
                          >
                            {shouldShowFullKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        {shouldShowFullKey && storedPlaygroundKey && (
                          <CopyButton textToCopy={storedPlaygroundKey} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={apiKey.enabled ? 'default' : 'secondary'}>
                        {apiKey.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatExpirationDate(apiKey.expiresAt)}
                    </TableCell>
                    <TableCell>{formatLastUsed(apiKey.lastRequest)}</TableCell>
                    <TableCell>
                      {apiKey.remaining !== null ? (
                        <span className="text-sm">
                          {apiKey.remaining} remaining
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Unlimited
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSystemPlaygroundKey ? (
                        isThisDeviceKey ? (
                          <Button
                            className="gap-2"
                            onClick={() => setRegenerateDialogOpen(true)}
                            size="sm"
                            variant="outline"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Rotate
                          </Button>
                        ) : null
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0" variant="ghost">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(apiKey.id)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleEnabled(apiKey.id, apiKey.enabled)
                              }
                            >
                              {apiKey.enabled ? 'Disable' : 'Enable'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => handleDelete(apiKey.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </>
                );
              })()}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {apiKeys.map((apiKey) => (
          <Card className="bg-background" key={apiKey.id}>
            <CardContent>
              {(() => {
                const isPlaygroundKey = isPlaygroundApiKeyName(apiKey.name);
                const isSystemPlaygroundKey =
                  isPlaygroundKey && useSystemPlaygroundKey;
                const isThisDeviceKey =
                  isPlaygroundKey &&
                  !!storedPlaygroundKey &&
                  (storedPlaygroundKeyId
                    ? storedPlaygroundKeyId === apiKey.id
                    : typeof apiKey.start === 'string'
                      ? storedPlaygroundKey.startsWith(apiKey.start)
                      : hasSinglePlaygroundKey);
                const canReveal = isPlaygroundKey && isThisDeviceKey;
                const isRevealed = revealedKeyIds[apiKey.id] ?? false;
                const shouldShowFullKey = canReveal && isRevealed;

                const maskedValue = apiKey.start
                  ? `${apiKey.start}...`
                  : '•••••••••';

                const keyValue = shouldShowFullKey
                  ? storedPlaygroundKey
                  : maskedValue;

                const keyWidthCh = `${maskedValue.length + 1}ch`;

                const toggleReveal = () => {
                  setRevealedKeyIds((prev) => ({
                    ...prev,
                    [apiKey.id]: !isRevealed,
                  }));
                };

                return (
                  <div className="space-y-3">
                    {/* Header with name and actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate font-medium text-sm">
                          {apiKey.name || 'Unnamed Key'}
                        </h3>
                        {isPlaygroundKey && isHydrated && (
                          <Badge
                            className="shrink-0"
                            variant={isThisDeviceKey ? 'outline' : 'secondary'}
                          >
                            {isThisDeviceKey ? 'This device' : 'Other device'}
                          </Badge>
                        )}
                      </div>
                      {isSystemPlaygroundKey ? (
                        isThisDeviceKey ? (
                          <Button
                            className="gap-2"
                            onClick={() => setRegenerateDialogOpen(true)}
                            size="sm"
                            variant="outline"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Rotate
                          </Button>
                        ) : null
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0" variant="ghost">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(apiKey.id)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleEnabled(apiKey.id, apiKey.enabled)
                              }
                            >
                              {apiKey.enabled ? 'Disable' : 'Enable'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => handleDelete(apiKey.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* API Key */}
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-muted-foreground text-xs">
                        API Key
                      </p>
                      <div className="flex items-center">
                        <code
                          className="block overflow-x-auto overflow-y-hidden whitespace-nowrap rounded bg-muted px-2 py-1 font-mono text-xs"
                          style={
                            isPlaygroundKey ? { width: keyWidthCh } : undefined
                          }
                        >
                          {keyValue}
                        </code>
                        {isPlaygroundKey && (
                          <Button
                            aria-label={
                              shouldShowFullKey
                                ? 'Hide API key'
                                : 'Show API key'
                            }
                            className="h-8 w-8 p-0"
                            disabled={!canReveal}
                            onClick={toggleReveal}
                            size="icon"
                            variant="ghost"
                          >
                            {shouldShowFullKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {shouldShowFullKey && storedPlaygroundKey && (
                          <CopyButton textToCopy={storedPlaygroundKey} />
                        )}
                      </div>
                    </div>

                    {/* Status and Expiration */}
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium text-muted-foreground text-xs">
                        Status
                      </p>
                      <Badge
                        className="text-xs"
                        variant={apiKey.enabled ? 'default' : 'secondary'}
                      >
                        {apiKey.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium text-muted-foreground text-xs">
                        Expiration
                      </p>
                      <div className="text-xs">
                        {formatExpirationDate(apiKey.expiresAt)}
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium text-muted-foreground text-xs">
                        Usage
                      </p>
                      <p className="text-xs">
                        {apiKey.remaining !== null ? (
                          <span>{apiKey.remaining} remaining</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Unlimited
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium text-muted-foreground text-xs">
                        Last Request
                      </p>
                      <p className="text-xs">
                        {formatLastUsed(apiKey.lastRequest)}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          // Prevent closing dialog if deletion is in progress
          if (!open && deleteApiKey.isPending) {
            return;
          }
          setDeleteDialogOpen(open);
          if (!open) {
            setSelectedKeyId(null);
          }
        }}
        open={deleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the API
              key &quot;{selectedKey?.name || 'Unnamed Key'}&quot; and revoke
              access for any applications using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="max-sm:flex-col max-sm:gap-2">
            <Button
              className="max-sm:w-full"
              disabled={deleteApiKey.isPending}
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedKeyId(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <SpinnerButton
              className="w-full sm:w-32"
              isLoading={deleteApiKey.isPending}
              onClick={confirmDelete}
              variant="destructive"
            >
              Delete API Key
            </SpinnerButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && isRegenerating) {
            return;
          }
          setRegenerateDialogOpen(open);
        }}
        open={regenerateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate playground API key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new API key named
              &quot;PLAYGROUND_API_KEY&quot; and store it on this device. The
              previous key stored on this device will be revoked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="max-sm:flex-col max-sm:gap-2">
            <Button
              className="max-sm:w-full"
              disabled={isRegenerating}
              onClick={() => setRegenerateDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <SpinnerButton
              className="w-full sm:w-40"
              isLoading={isRegenerating}
              onClick={confirmRotate}
              variant="destructive"
            >
              Rotate
            </SpinnerButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedKey && (
        <EditApiKeyDialog
          apiKey={selectedKey}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedKeyId(null);
          }}
          onOpenChange={setEditDialogOpen}
          open={editDialogOpen}
        />
      )}
    </>
  );
}
