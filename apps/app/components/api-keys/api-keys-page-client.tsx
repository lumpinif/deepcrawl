'use client';

import { useSuspenseApiKeys } from '@/hooks/auth.hooks';
import type { ApiKeyResponse } from '@deepcrawl/auth/types';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Card, CardContent } from '@deepcrawl/ui/components/ui/card';
import { Skeleton } from '@deepcrawl/ui/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../page-elements';
import { ApiKeysTable } from './api-keys-table';
import { CreateApiKeyDialog } from './create-api-key-dialog';

export function ApiKeysPageSkeleton() {
  return (
    <div className="space-y-6 max-sm:space-y-4">
      <div className="flex items-center justify-between max-sm:flex-col max-sm:gap-y-4">
        <PageHeader
          className="max-sm:w-full"
          title="Your API Keys"
          description="Manage your API keys for accessing DeepCrawl services."
        />
        <Button disabled className="max-sm:w-full">
          <Plus className="size-4" />
          New API Key
        </Button>
      </div>

      <p className="text-muted-foreground text-xs md:text-sm">
        API keys are used to authenticate your applications with DeepCrawl
        services. Keep your keys secure and never share them publicly.
      </p>

      {/* Mobile skeleton */}
      <div className="block sm:hidden">
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      {/* Desktop skeleton */}
      <Card className="hidden bg-background sm:block">
        <CardContent className="overflow-x-auto">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ApiKeysPageClient() {
  const { data: apiKeys, isLoading, error } = useSuspenseApiKeys();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter out system-managed playground keys from the UI
  const userApiKeys: ApiKeyResponse[] = (apiKeys || []).filter((key) => {
    // Parse metadata if it's stored as JSON string
    let metadata = key.metadata;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = null;
      }
    }

    // Hide PLAYGROUND_API_KEY from UI (system-managed keys)
    if (
      key.name === 'PLAYGROUND_API_KEY' &&
      metadata &&
      typeof metadata === 'object' &&
      (metadata as Record<string, unknown>).type === 'auto-generated' &&
      (metadata as Record<string, unknown>).purpose === 'playground'
    ) {
      return false;
    }

    return true;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="py-8 text-center">
              <p className="text-destructive">
                Failed to load API keys. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-sm:space-y-4">
      <div className="flex items-center justify-between max-sm:flex-col max-sm:gap-y-4">
        <PageHeader
          title="Your API Keys"
          className="mb-4 max-sm:w-full"
          description="Manage your API keys for accessing DeepCrawl services."
        />
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="max-sm:w-full"
        >
          <Plus className="size-4" />
          New API Key
        </Button>
      </div>

      <p className="text-muted-foreground text-xs md:text-sm">
        API keys are used to authenticate your applications with DeepCrawl
        services. Keep your keys secure and never share them publicly.
      </p>

      <div className="block sm:hidden">
        <ApiKeysTable apiKeys={userApiKeys} />
      </div>

      <Card className="hidden bg-background sm:block">
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <ApiKeysTable apiKeys={userApiKeys} />
          )}
        </CardContent>
      </Card>

      <CreateApiKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
