import { fetchAuthSession } from '@/app/actions/auth';
import {
  deviceSessionsQueryOptions,
  listSessionsQueryOptions,
  organizationQueryOptions,
  sessionQueryOptions,
} from '@/lib/query-options';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { PasswordChangeCard } from './components/password-change-card';
import { ProvidersManagementCard } from './components/providers-management-card';
import { SessionsManagementCard } from './components/sessions-management-card';
import { UserAvatarCard } from './components/user-avatar-card';
import { UserEmailCard } from './components/user-email-card';
import { UserNameCard } from './components/user-name-card';

export default async function AccountPage() {
  const queryClient = new QueryClient();

  const [session] = await Promise.all([
    fetchAuthSession(),

    // Prefetching data for React Query with optimized cache times using queryOptions
    queryClient.prefetchQuery(sessionQueryOptions()),
    queryClient.prefetchQuery(deviceSessionsQueryOptions()),
    queryClient.prefetchQuery(listSessionsQueryOptions()),
    queryClient.prefetchQuery(organizationQueryOptions()),
  ]).catch((e) => {
    console.log(e);
    throw redirect('/login');
  });

  // Redirect to login if no session
  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="mb-8 font-bold text-3xl">Account Settings</h1>

        <div className="grid gap-6">
          {/* User Profile Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <UserAvatarCard />
            <UserNameCard />
          </div>

          <UserEmailCard />

          {/* Security Section */}
          <PasswordChangeCard />
          <ProvidersManagementCard />
          <SessionsManagementCard />
        </div>
      </div>
    </HydrationBoundary>
  );
}
