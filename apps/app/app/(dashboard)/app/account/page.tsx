import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { PageContainer, PageHeader } from '@/components/page-elements';
import { getQueryClient } from '@/query/query.client';
import {
  deviceSessionsQueryOptions,
  linkedAccountsQueryOptions,
  listSessionsQueryOptions,
  sessionQueryOptions,
  userPasskeysQueryOptions,
} from '@/query/query-options';
import {
  MultipleAccountsManagementCardSkeleton,
  PasswordChangeCardSkeleton,
  ProvidersManagementCardSkeleton,
  SessionsManagementCardSkeleton,
  UserAvatarCardSkeleton,
  UserNameCardSkeleton,
} from './components/account-skeletons';
import { MultipleAccountsManagementCard } from './components/multiple-accounts-management-card';
import { PasswordChangeCard } from './components/password-change-card';
import { ProvidersManagementCard } from './components/providers-management-card';
import { SessionsManagementCard } from './components/sessions-management-card';
import { UserAvatarCard } from './components/user-avatar-card';
import { UserNameCard } from './components/user-name-card';

// export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const queryClient = getQueryClient();

  // Prefetch all user-related data including OAuth accounts
  void queryClient.prefetchQuery(sessionQueryOptions());
  void queryClient.prefetchQuery(linkedAccountsQueryOptions());
  void queryClient.prefetchQuery(userPasskeysQueryOptions());
  void queryClient.prefetchQuery(deviceSessionsQueryOptions());
  void queryClient.prefetchQuery(listSessionsQueryOptions());
  // void queryClient.prefetchQuery(organizationQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader title="Account Settings" />
      <PageContainer>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Suspense fallback={<UserAvatarCardSkeleton />}>
            <UserAvatarCard />
          </Suspense>
          <Suspense fallback={<UserNameCardSkeleton />}>
            <UserNameCard />
          </Suspense>
        </div>

        <Suspense fallback={<ProvidersManagementCardSkeleton />}>
          <ProvidersManagementCard />
        </Suspense>

        <Suspense fallback={<MultipleAccountsManagementCardSkeleton />}>
          <MultipleAccountsManagementCard />
        </Suspense>

        <Suspense fallback={<PasswordChangeCardSkeleton />}>
          <PasswordChangeCard />
        </Suspense>

        <Suspense fallback={<SessionsManagementCardSkeleton />}>
          <SessionsManagementCard />
        </Suspense>
      </PageContainer>
    </HydrationBoundary>
  );
}
