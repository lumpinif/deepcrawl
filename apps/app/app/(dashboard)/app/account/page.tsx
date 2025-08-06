import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '@/components/page-elements';
import { getQueryClient } from '@/query/query.client';
import {
  authListUserAccountsQueryOptions,
  authPasskeysQueryOptions,
  deviceSessionsQueryOptions,
  listSessionsQueryOptions,
} from '@/query/query-options.server';
import { MultipleAccountsManagementCard } from './components/multiple-accounts-management-card';
import { PasswordChangeCard } from './components/password-change-card';
import { ProvidersManagementCard } from './components/providers-management-card';
import { SessionsManagementCard } from './components/sessions-management-card';
import { UserAvatarCard } from './components/user-avatar-card';
import { UserNameCard } from './components/user-name-card';

export default async function AccountPage() {
  const queryClient = getQueryClient();

  // Don't prefetch current session or organization as they can return null
  void queryClient.prefetchQuery(authPasskeysQueryOptions());
  void queryClient.prefetchQuery(listSessionsQueryOptions());
  void queryClient.prefetchQuery(deviceSessionsQueryOptions()); // it should be populated by layout.tsx already but it doesn't hurt to prefetch it here
  void queryClient.prefetchQuery(authListUserAccountsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader title="Account Settings" />
      <PageContainer>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <UserAvatarCard />
          <UserNameCard />
        </div>
        <ProvidersManagementCard />
        <MultipleAccountsManagementCard />
        <PasswordChangeCard />
        <SessionsManagementCard />
      </PageContainer>
    </HydrationBoundary>
  );
}
