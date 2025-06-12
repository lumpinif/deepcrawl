export default async function DashboardPage() {
  return (
    <>
      <h1 className="font-bold text-3xl">Dashboard Overview</h1>
      <p className="mt-2 text-muted-foreground">Welcome back, John Doe!</p>
      {/* <AccountSwitcher
          sessions={JSON.parse(JSON.stringify(deviceSessions))}
        /> */}
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
    </>
  );
}
