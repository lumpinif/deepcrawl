'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { Card, CardContent } from '@deepcrawl/ui/components/ui/card';
import { Skeleton } from '@deepcrawl/ui/components/ui/skeleton';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useState } from 'react';
import { useSuspenseApiKeys } from '@/hooks/auth.hooks';
import { PageContainer, PageHeader } from '../page-elements';
import { ApiKeysTable } from './api-keys-table';
import { CreateApiKeyDialog } from './create-api-key-dialog';

function ApiKeysPageDescription({ className }: { className?: string }) {
  return (
    <p className={cn('text-muted-foreground text-xs md:text-sm', className)}>
      API keys are used to authenticate your applications with DeepCrawl
      services. Keep your keys secure and never share them publicly.
    </p>
  );
}

export function ApiKeysPageSkeleton() {
  return (
    <>
      <PageHeader
        title="Your API Keys"
        description="Manage your API keys for accessing DeepCrawl services."
      />
      <PageContainer>
        {/* <div className="flex items-center justify-between max-sm:flex-col max-sm:gap-y-4">
        <PageHeader
          className="mb-4 max-sm:w-full"
          title="Your API Keys"
          description="Manage your API keys for accessing DeepCrawl services."
        />
        <Button disabled className="max-sm:w-full">
          <Plus className="size-4" />
          New API Key
        </Button>
      </div> */}

        <ApiKeysPageDescription />

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
      </PageContainer>
    </>
  );
}

export function ApiKeysPageClient() {
  const { data: apiKeys, error } = useSuspenseApiKeys();

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
    <>
      <PageHeader
        title="Your API Keys"
        description="Manage your API keys for accessing DeepCrawl services."
        containerClassName="flex items-center justify-between max-sm:flex-col max-sm:gap-y-4"
      >
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="max-sm:w-full"
        >
          New API Key
        </Button>
      </PageHeader>

      <PageContainer>
        <ApiKeysPageDescription />

        <div className="block sm:hidden">
          <ApiKeysTable apiKeys={apiKeys || []} />
        </div>

        <Card className="hidden bg-background sm:block">
          <CardContent className="overflow-x-auto">
            <ApiKeysTable apiKeys={apiKeys || []} />
          </CardContent>
        </Card>

        <CreateApiKeyDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </PageContainer>
    </>
  );
}
