import { fetchAuthSession } from '@/app/actions/auth';
import { PageHeader } from '@/components/page-elements';
import {
  deviceSessionsQueryOptions,
  linkedAccountsQueryOptions,
  listSessionsQueryOptions,
  organizationQueryOptions,
  sessionQueryOptions,
  userPasskeysQueryOptions,
} from '@/lib/query-options';
import { getQueryClient } from '@/lib/query.client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
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

export default async function AccountPage() {
  const session = await fetchAuthSession();

  if (!session) {
    redirect('/login');
  }

  const queryClient = getQueryClient();

  // Prefetch all user-related data including OAuth accounts
  queryClient.prefetchQuery(sessionQueryOptions());
  queryClient.prefetchQuery(listSessionsQueryOptions());
  queryClient.prefetchQuery(deviceSessionsQueryOptions());
  queryClient.prefetchQuery(organizationQueryOptions());
  queryClient.prefetchQuery(userPasskeysQueryOptions());
  queryClient.prefetchQuery(linkedAccountsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader title="Account Settings" />
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
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
      </div>
    </HydrationBoundary>
  );
}
