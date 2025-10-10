// @DEPRECATED

import type { Session } from '@deepcrawl/auth/types';
import { UserDropdown } from '@/components/user/user-dropdown';
// import { authListDeviceSessions } from '@/query/auth-query.server';
import type { NavigationMode } from '../providers';

export async function UserDropdownServer({
  redirectLogout,
  enableLayoutViewToggle = false,
  navigationMode,
  currentSession,
}: {
  redirectLogout?: string;
  enableLayoutViewToggle?: boolean;
  navigationMode?: NavigationMode;
  currentSession?: Session | null;
}) {
  // const listDeviceSessions = await authListDeviceSessions(); // DISABLE SESSIONS SWITCHING FROM LANDING PAGE FOR NOW

  if (!currentSession) {
    return null;
  }

  return (
    <UserDropdown
      enableLayoutViewToggle={enableLayoutViewToggle}
      // listDeviceSessions={listDeviceSessions}
      navigationMode={navigationMode}
      redirectLogout={redirectLogout}
      session={currentSession}
    />
  );
}
