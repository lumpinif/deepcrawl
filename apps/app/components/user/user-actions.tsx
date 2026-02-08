import { Button } from '@deepcrawl/ui/components/ui/button';
import Link from 'next/link';
import { UserDropdown } from '@/components/user/user-dropdown';
import { isBetterAuthMode } from '@/lib/auth-mode';
import { authGetSession } from '@/query/auth-query.server';

export default async function UserActions() {
  if (!isBetterAuthMode()) {
    return (
      <Button asChild className="ml-1" size="sm" variant="outline">
        <Link href="/app">Go to Playground</Link>
      </Button>
    );
  }

  const session = await authGetSession();
  const user = session?.user;

  return user ? (
    <UserDropdown
      enableLayoutViewToggle={false}
      redirectLogout="/"
      session={session}
    />
  ) : (
    <Button asChild className="ml-1" size="sm" variant="outline">
      <Link href="/login">Login</Link>
    </Button>
  );
}
