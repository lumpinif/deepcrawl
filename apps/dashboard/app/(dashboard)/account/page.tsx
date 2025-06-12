export default async function AccountPage() {
  // If no session, redirect to sign-in
  // if (!session) {
  //   redirect('/login');
  // }

  // Pass the prefetched data to the client component
  return (
    <>
      <h1 className="font-bold text-3xl">Account Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your account settings and security preferences
      </p>
    </>
  );
}
