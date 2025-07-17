'use client';

import type { ApiKeyResponse } from '@deepcrawl/auth/types';
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
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { SpinnerButton } from '@/components/spinner-button';
import { useDeleteApiKey, useUpdateApiKey } from '@/hooks/auth.hooks';
import { EditApiKeyDialog } from './edit-api-key-dialog';

interface ApiKeysTableProps {
  apiKeys: ApiKeyResponse[];
}

export function ApiKeysTable({ apiKeys }: ApiKeysTableProps) {
  const deleteApiKey = useDeleteApiKey();
  const updateApiKey = useUpdateApiKey();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = (keyId: string) => {
    setSelectedKeyId(keyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedKeyId) {
      deleteApiKey.mutate(selectedKeyId, {
        onSuccess: () => {
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
    if (!lastRequest) return 'Never';
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
      <Table className="hidden bg-background md:table">
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
              <TableCell className="font-medium">
                {apiKey.name || 'Unnamed Key'}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                    {apiKey.start ? `${apiKey.start || ''}...` : '•••••••••'}
                  </code>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={apiKey.enabled ? 'default' : 'secondary'}>
                  {apiKey.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </TableCell>
              <TableCell>{formatExpirationDate(apiKey.expiresAt)}</TableCell>
              <TableCell>{formatLastUsed(apiKey.lastRequest)}</TableCell>
              <TableCell>
                {apiKey.remaining !== null ? (
                  <span className="text-sm">{apiKey.remaining} remaining</span>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Unlimited
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(apiKey.id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toggleEnabled(apiKey.id, apiKey.enabled)}
                    >
                      {apiKey.enabled ? 'Disable' : 'Enable'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(apiKey.id)}
                      className="text-red-500"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id} className="bg-background">
            <CardContent>
              <div className="space-y-3">
                {/* Header with name and actions */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">
                    {apiKey.name || 'Unnamed Key'}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(apiKey.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleEnabled(apiKey.id, apiKey.enabled)}
                      >
                        {apiKey.enabled ? 'Disable' : 'Enable'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(apiKey.id)}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* API Key */}
                <div className="flex items-center justify-between">
                  <p className="font-medium text-muted-foreground text-xs">
                    API Key
                  </p>
                  <code className="block w-fit overflow-hidden rounded bg-muted px-2 py-1 font-mono text-xs">
                    {apiKey.start ? `${apiKey.start || ''}...` : '•••••••••'}
                  </code>
                </div>

                {/* Status and Expiration */}
                <div className="flex w-full items-center justify-between">
                  <p className="font-medium text-muted-foreground text-xs">
                    Status
                  </p>
                  <Badge
                    variant={apiKey.enabled ? 'default' : 'secondary'}
                    className="text-xs"
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
                      <span className="text-muted-foreground">Unlimited</span>
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
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={deleteDialogOpen}
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
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedKeyId(null);
              }}
              disabled={deleteApiKey.isPending}
              className="max-sm:w-full"
            >
              Cancel
            </Button>
            <SpinnerButton
              variant="destructive"
              className="w-full sm:w-32"
              onClick={confirmDelete}
              isLoading={deleteApiKey.isPending}
            >
              Delete API Key
            </SpinnerButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedKey && (
        <EditApiKeyDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          apiKey={selectedKey}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedKeyId(null);
          }}
        />
      )}
    </>
  );
}
