import { PageContainer, PageHeader } from '@/components/page-elements';

import { MultipleAccountsManagementCard } from './components/multiple-accounts-management-card';
import { PasswordChangeCard } from './components/password-change-card';
import { ProvidersManagementCard } from './components/providers-management-card';
import { SessionsManagementCard } from './components/sessions-management-card';
import { UserAvatarCard } from './components/user-avatar-card';
import { UserNameCard } from './components/user-name-card';

export default async function AccountPage() {
  // Prefetch all user-related data including OAuth accounts
  // void queryClient.prefetchQuery(sessionQueryOptions());
  // void queryClient.prefetchQuery(linkedAccountsQueryOptions());
  // void queryClient.prefetchQuery(userPasskeysQueryOptions());
  // void queryClient.prefetchQuery(deviceSessionsQueryOptions());
  // void queryClient.prefetchQuery(listSessionsQueryOptions());
  // void queryClient.prefetchQuery(organizationQueryOptions());

  return (
    <>
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
    </>
  );
}
