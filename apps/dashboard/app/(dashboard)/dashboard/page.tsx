// import { typedAuth } from '@/lib/auth.types';
import AccountSwitcher from '@/components/auth/account-switch';
import { auth } from '@deepcrawl/auth/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const [
    session,
    activeSessions,
    deviceSessions,
    organization,
    // subscriptions
  ] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      headers: await headers(),
    }),
    auth.api.getFullOrganization({
      headers: await headers(),
    }),
    // auth.api.listActiveSubscriptions({
    // 	headers: await headers(),
    // }),
  ]).catch((e) => {
    console.log(e);
    throw redirect('/sign-in');
  });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        dashboard
        <AccountSwitcher
          sessions={JSON.parse(JSON.stringify(deviceSessions))}
        />
        {/* <UserCard
					session={JSON.parse(JSON.stringify(session))}
					activeSessions={JSON.parse(JSON.stringify(activeSessions))}
					subscription={subscriptions.find(
						(sub) => sub.status === "active" || sub.status === "trialing",
					)}
				/> */}
        {/* <OrganizationCard
					session={JSON.parse(JSON.stringify(session))}
					activeOrganization={JSON.parse(JSON.stringify(organization))}
				/> */}
      </div>
    </div>
  );
}
