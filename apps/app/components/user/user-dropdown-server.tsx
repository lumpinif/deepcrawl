import { UserDropdown } from '@/components/user/user-dropdown';
import {
  authGetSession,
  authListDeviceSessions,
} from '@/query/auth-query.server';
import type { NavigationMode } from '../providers';

export async function UserDropdownServer({
  redirectLogout,
  enableLayoutViewToggle = false,
  navigationMode,
}: {
  redirectLogout?: string;
  enableLayoutViewToggle?: boolean;
  navigationMode?: NavigationMode;
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
      enableLayoutViewToggle={enableLayoutViewToggle}
      listDeviceSessions={listDeviceSessions}
      navigationMode={navigationMode}
      redirectLogout={redirectLogout}
      session={currentSession}
    />
  );
}
