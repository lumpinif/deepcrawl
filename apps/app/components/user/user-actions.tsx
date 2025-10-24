import { Button } from '@deepcrawl/ui/components/ui/button';
import Link from 'next/link';
import { UserDropdown } from '@/components/user/user-dropdown';
import { authGetSession } from '@/query/auth-query.server';

export default async function UserActions() {
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
