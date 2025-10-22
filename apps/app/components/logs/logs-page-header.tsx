'use client';

import { useQueryClient } from '@tanstack/react-query';
import { startTransition, useState } from 'react';
import { PageHeader } from '@/components/page-elements';
import { userQueryKeys } from '@/query/query-keys';
import { SpinnerButton } from '../spinner-button';

const REFRESH_COOLDOWN_MS = 5_000; // 5 seconds cooldown

export function LogsPageHeader() {
  const queryClient = useQueryClient();
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [_, setCooldownRemaining] = useState(0);

  // Check if any queries with our key are currently fetching
  const isFetching = queryClient.isFetching({
    queryKey: userQueryKeys.activityLogs,
  });

  const handleRefresh = () => {
    if (isOnCooldown || isFetching > 0) {
      return;
    }

    startTransition(() => {
      queryClient.resetQueries({
        queryKey: userQueryKeys.activityLogs,
      });
    });

    // Start cooldown
    setIsOnCooldown(true);
    setCooldownRemaining(REFRESH_COOLDOWN_MS / 1000);

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clear cooldown after timeout
    const cooldownTimeout = setTimeout(() => {
      setIsOnCooldown(false);
      setCooldownRemaining(0);
      clearInterval(countdownInterval);
    }, REFRESH_COOLDOWN_MS);

    // Cleanup
    return () => {
      clearTimeout(cooldownTimeout);
      clearInterval(countdownInterval);
    };
  };

  const isDisabled = isOnCooldown || isFetching > 0;

  // function getButtonText() {
  //   if (isFetching > 0) {
  //     return 'Refreshing';
  //   }
  //   if (isOnCooldown && cooldownRemaining > 0) {
  //     return `Wait ${cooldownRemaining}s`;
  //   }
  //   return 'Refresh';
  // }

  return (
    <PageHeader
      description="Check out your recent request activity logs"
      title="Activity Logs"
    >
      <SpinnerButton
        className="w-28 max-sm:w-full"
        disabled={isDisabled}
        isLoading={isFetching > 0}
        onClick={() => handleRefresh()}
        successElement={<span className="text-background">Synced</span>}
      >
        Refresh
      </SpinnerButton>
    </PageHeader>
  );
}
