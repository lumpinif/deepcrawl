import { UserDropdown } from '@/components/user/user-dropdown';
import {
  authGetSession,
  authListDeviceSessions,
} from '@/query/auth-query.server';

export async function UserDropdownServer({
  redirectLogout,
  enableLayoutViewToggle = false,
}: {
  redirectLogout?: string;
  enableLayoutViewToggle?: boolean;
}) {
  const [currentSession, listDeviceSessions] = await Promise.all([
    authGetSession(),
    authListDeviceSessions(),
  ]);

  if (!currentSession) {
    return null;
  }

  return (
    <UserDropdown
      deviceSessions={listDeviceSessions}
      enableLayoutViewToggle={enableLayoutViewToggle}
      redirectLogout={redirectLogout}
      session={currentSession}
    />
  );
}
