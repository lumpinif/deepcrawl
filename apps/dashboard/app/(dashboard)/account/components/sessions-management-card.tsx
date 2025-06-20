'use client';

import { SpinnerButton } from '@/components/spinner-button';
import {
  useAuthSession,
  useListSessions,
  useRevokeAllOtherSessions,
  useRevokeSession,
} from '@/hooks/auth.hooks';

import type { Session } from '@deepcrawl/auth/types';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Loader2, Monitor, Smartphone, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';

export function SessionsManagementCard() {
  const { data: currentSession } = useAuthSession();
  const { data: listSessions, isLoading } = useListSessions();
  const { mutate: revokeSession, isPending } = useRevokeSession();
  const { mutate: revokeAllOtherSessions, isPending: isRevokingOtherSessions } =
    useRevokeAllOtherSessions();
  const router = useRouter();
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );
  const [signingOutCurrentSession, setSigningOutCurrentSession] =
    useState(false);

  // Cleanup: Reset local state if mutation is no longer pending
  useEffect(() => {
    if (!isPending && revokingSessionId) {
      setRevokingSessionId(null);
    }
  }, [isPending, revokingSessionId]);

  // Early return if no current session
  if (!currentSession?.session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions and connected devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-muted-foreground">
            Unable to load session information
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRevokeSession = (session: Session['session']) => {
    const isCurrentSession = session.id === currentSession.session.id;

    if (isCurrentSession) {
      // For current session, immediately redirect to logout without calling mutation
      // The logout component will handle the actual sign out and cache clearing
      setSigningOutCurrentSession(true);

      // Check if we're already on the logout page to prevent double navigation
      if (window.location.pathname !== '/logout') {
        router.push('/logout');
      }
      return;
    }

    // For other sessions, use the mutation approach
    setRevokingSessionId(session.id);
    revokeSession(session.token, {
      onSettled: () => {
        // Clear the revoking state when mutation completes (success or error)
        setRevokingSessionId(null);
      },
    });
  };

  // Sort sessions to show current session first
  const sortedSessions = listSessions
    ? [...listSessions].sort((a, b) => {
        const aIsCurrent = a.id === currentSession.session.id;
        const bIsCurrent = b.id === currentSession.session.id;

        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;
        return 0;
      })
    : [];

  const handleRevokeOtherSessions = () => {
    revokeAllOtherSessions();
  };

  return (
    <Card>
      <CardHeader className="flex w-full justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions and connected devices
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Sessions Section */}
          <h4 className="mb-3 font-medium text-sm">
            Connected Sessions ({listSessions?.length || 0})
          </h4>
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-4 text-center text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                Loading sessions...
              </div>
            ) : !listSessions || listSessions.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                No active sessions found
              </div>
            ) : (
              sortedSessions.map((session, index) => {
                const isCurrentSession =
                  session.id === currentSession.session.id;
                return (
                  <div
                    key={session.id || index}
                    className={`flex items-center justify-between rounded-lg border p-3 max-sm:flex-col max-sm:items-start max-sm:gap-y-2 ${
                      isCurrentSession && 'bg-background-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-between">
                      <div className="flex items-center gap-x-2">
                        {new UAParser(session.userAgent || '').getDevice()
                          .type === 'mobile' ? (
                          <Smartphone />
                        ) : (
                          <Monitor size={16} />
                        )}

                        <div>
                          <div className="flex items-center gap-2 font-medium text-sm">
                            {new UAParser(session.userAgent || '').getOS().name}
                            ,{' '}
                            {
                              new UAParser(session.userAgent || '').getBrowser()
                                .name
                            }
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Last active:{' '}
                            {session.updatedAt
                              ? new Date(session.updatedAt).toLocaleDateString()
                              : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row-reverse items-center gap-x-2 max-sm:flex-col max-sm:items-end max-sm:gap-y-1">
                        {isCurrentSession && (
                          <Badge variant="secondary" className="py-0 text-xs">
                            Current
                          </Badge>
                        )}
                        {session.ipAddress && (
                          <div className="text-muted-foreground text-xs">
                            IP: {session.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-x-2 max-sm:w-full max-sm:justify-end">
                      {isCurrentSession &&
                        listSessions &&
                        listSessions.length > 1 && (
                          <SpinnerButton
                            size="sm"
                            variant="outline"
                            className="!max-sm:flex-1 max-sm:w-fit"
                            onClick={handleRevokeOtherSessions}
                            isLoading={isRevokingOtherSessions}
                            disabled={
                              isRevokingOtherSessions ||
                              !listSessions ||
                              listSessions.length <= 1
                            }
                          >
                            Revoke other sessions
                          </SpinnerButton>
                        )}
                      <SpinnerButton
                        size="sm"
                        variant="outline"
                        className="w-24 max-sm:flex-1 max-sm:w-fit"
                        isLoading={
                          (isPending && revokingSessionId === session.id) ||
                          (isCurrentSession && signingOutCurrentSession)
                        }
                        disabled={
                          isPending ||
                          revokingSessionId === session.id ||
                          (isCurrentSession && signingOutCurrentSession)
                        }
                        onClick={() => handleRevokeSession(session)}
                      >
                        {(isPending && revokingSessionId === session.id) ||
                        (isCurrentSession && signingOutCurrentSession) ? (
                          <>
                            <Loader2 size={15} className="mr-2 animate-spin" />
                            {isCurrentSession
                              ? 'Signing Out...'
                              : 'Terminating...'}
                          </>
                        ) : isCurrentSession ? (
                          'Log Out'
                        ) : (
                          'Terminate'
                        )}
                      </SpinnerButton>
                    </div>
                  </div>
                );
              })
            )}
        </div>

        {(!listSessions || listSessions.length === 0) && !isLoading && (
          <div className="py-8 text-center text-muted-foreground">
            <Wifi className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <h3 className="mb-2 font-medium text-lg">No Active Sessions</h3>
            <p className="text-sm">
              No active sessions found. This might indicate a data loading
              issue.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
