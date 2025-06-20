import { fetchAuthSession } from '@/app/actions/auth';
import {
  deviceSessionsQueryOptions,
  linkedAccountsQueryOptions,
  listSessionsQueryOptions,
  organizationQueryOptions,
  sessionQueryOptions,
  userPasskeysQueryOptions,
} from '@/lib/query-options';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';
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

  const queryClient = new QueryClient();

  // Prefetch all user-related data including OAuth accounts
  await Promise.all([
    queryClient.prefetchQuery(sessionQueryOptions()),
    queryClient.prefetchQuery(listSessionsQueryOptions()),
    queryClient.prefetchQuery(deviceSessionsQueryOptions()),
    queryClient.prefetchQuery(organizationQueryOptions()),
    queryClient.prefetchQuery(userPasskeysQueryOptions()),
    queryClient.prefetchQuery(linkedAccountsQueryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="mb-8 font-bold text-3xl">Account Settings</h1>

        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <UserAvatarCard />
            <UserNameCard />
          </div>

          <ProvidersManagementCard />
          <MultipleAccountsManagementCard />

          <PasswordChangeCard />
          <SessionsManagementCard />
        </div>
      </div>
    </HydrationBoundary>
  );
}
