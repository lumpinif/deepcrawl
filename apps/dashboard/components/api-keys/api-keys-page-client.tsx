'use client';

import { useApiKeys } from '@/hooks/auth.hooks';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Card, CardContent } from '@deepcrawl/ui/components/ui/card';
import { Skeleton } from '@deepcrawl/ui/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ApiKeysTable } from './api-keys-table';
import { CreateApiKeyDialog } from './create-api-key-dialog';

export function ApiKeysPageClient() {
  const { data: apiKeys, isLoading, error } = useApiKeys();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
        <div className="max-sm:w-full">
          <h1 className="font-bold text-3xl">Your API Keys</h1>
          <p className="text-muted-foreground text-sm max-sm:mt-2">
            Manage your API keys for accessing DeepCrawl services.
          </p>
        </div>
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
        <ApiKeysTable apiKeys={apiKeys || []} />
      </div>

      <Card className="hidden bg-background sm:block">
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <ApiKeysTable apiKeys={apiKeys || []} />
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
