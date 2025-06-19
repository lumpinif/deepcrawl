'use client';

import { useApiKeys } from '@/hooks/auth.hooks';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for accessing DeepCrawl services.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 size-4" />
          Create API Key
        </Button>
      </div>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys are used to authenticate your applications with DeepCrawl
            services. Keep your keys secure and never share them publicly.
          </CardDescription>
        </CardHeader>
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
