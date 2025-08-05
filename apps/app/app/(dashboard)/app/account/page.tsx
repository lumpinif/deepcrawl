import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { PageContainer, PageHeader } from '@/components/page-elements';
import { authGetSession } from '@/query/auth-query.server';
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
  // Don't prefetch current session or organization as they can return null
  const [currentSession] = await Promise.all([
    authGetSession(),
    // auth.api.getFullOrganization({
    // 	headers: requestHeaders,
    // }),
  ]);

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(authPasskeysQueryOptions());
  void queryClient.prefetchQuery(listSessionsQueryOptions());
  void queryClient.prefetchQuery(deviceSessionsQueryOptions());
  void queryClient.prefetchQuery(authListUserAccountsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader title="Account Settings" />
      <PageContainer>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <UserAvatarCard currentSession={currentSession} />
          <UserNameCard currentSession={currentSession} />
        </div>
        <ProvidersManagementCard currentSession={currentSession} />
        <MultipleAccountsManagementCard currentSession={currentSession} />
        <PasswordChangeCard currentSession={currentSession} />
        <SessionsManagementCard currentSession={currentSession} />
      </PageContainer>
    </HydrationBoundary>
  );
}
