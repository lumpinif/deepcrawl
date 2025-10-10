'use client';

import { MAX_SESSIONS } from '@deepcrawl/auth/configs/constants';
import type {
  LDSUser,
  ListDeviceSession,
  Session,
} from '@deepcrawl/auth/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@deepcrawl/ui/components/ui/avatar';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@deepcrawl/ui/components/ui/dialog';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  Loader2,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';
import { SpinnerButton } from '@/components/spinner-button';
import {
  useRevokeDeviceSession,
  useSetActiveSession,
} from '@/hooks/auth.hooks';
import {
  deviceSessionsQueryOptionsClient,
  sessionQueryOptionsClient,
} from '@/query/query-options.client';
import { MultipleAccountsManagementCardSkeleton } from './account-skeletons';

function UserAvatar({ user }: { user: Session['user'] | LDSUser }) {
  return (
    <Avatar className="h-8 w-8 rounded-full">
      <AvatarImage alt={user.name} src={user.image || ''} />
      <AvatarFallback className="rounded-full">
        {user.name?.charAt(0).toUpperCase() ||
          user.email?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function MultipleAccountsManagementCard() {
  const { data: currentSession, isPending: isPendingCurrentSession } = useQuery(
    sessionQueryOptionsClient(),
  );
  const { data: deviceSessions } = useSuspenseQuery(
    deviceSessionsQueryOptionsClient(),
  );
  const { mutate: setActiveSession, isPending: isSwitching } =
    useSetActiveSession();
  const { mutate: revokeDeviceSession, isPending: isRemoving } =
    useRevokeDeviceSession();

  const [switchingSessionToken, setSwitchingSessionToken] = useState<
    string | null
  >(null);
  const [removingSessionToken, setRemovingSessionToken] = useState<
    string | null
  >(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [sessionToRemove, setSessionToRemove] = useState<
    Session | ListDeviceSession | null
  >(null);

  // Cleanup: Reset local state if mutations are no longer pending
  useEffect(() => {
    if (!isSwitching && switchingSessionToken) {
      setSwitchingSessionToken(null);
    }
    if (!isRemoving && removingSessionToken) {
      setRemovingSessionToken(null);
    }
  }, [isSwitching, isRemoving, switchingSessionToken, removingSessionToken]);

  if (isPendingCurrentSession) {
    //   return (
    //     <Card>
    //       <CardHeader>
    //         <CardTitle className="flex items-center gap-2">
    //           <Users className="h-5 w-5" />
    //           Multiple Accounts
    //         </CardTitle>
    //         <CardDescription>
    //           Manage multiple accounts and switch between them seamlessly. Maximum{' '}
    //           {MAX_SESSIONS} accounts allowed.
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent className="space-y-6">
    //         <div className="flex items-center justify-center py-8">
    //           <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    //         </div>
    //       </CardContent>
    // </Card>
    // );
    return <MultipleAccountsManagementCardSkeleton />;
  }

  // Early return if no current session
  if (!currentSession?.session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multiple Accounts
          </CardTitle>
          <CardDescription>
            Manage multiple accounts and switch between them seamlessly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-muted-foreground">
            Unable to load account information
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSwitchAccount = (session: Session | ListDeviceSession) => {
    const isCurrentSession = session.session.id === currentSession.session.id;

    if (isCurrentSession) {
      return; // Don't switch to the same account
    }

    setSwitchingSessionToken(session.session.token);
    setActiveSession(session.session.token, {
      onSettled: () => {
        setSwitchingSessionToken(null);
      },
    });
  };

  const handleRemoveAccount = (session: Session | ListDeviceSession) => {
    setSessionToRemove(session);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveAccount = () => {
    if (!sessionToRemove) {
      return;
    }

    setRemovingSessionToken(sessionToRemove.session.token);
    revokeDeviceSession(sessionToRemove.session.token, {
      onSettled: () => {
        setRemovingSessionToken(null);
        setIsRemoveDialogOpen(false);
        setSessionToRemove(null);
      },
    });
  };

  const cancelRemoveAccount = () => {
    setIsRemoveDialogOpen(false);
    setSessionToRemove(null);
  };

  // Filter to show only other accounts (not current user) - following Better Auth demo pattern
  const otherSessions = deviceSessions
    ? deviceSessions.filter((s) => s.user.id !== currentSession?.user?.id)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Multiple Accounts
        </CardTitle>
        <CardDescription>
          Manage multiple accounts and switch between them seamlessly. Maximum{' '}
          {MAX_SESSIONS} accounts allowed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Account Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-sm">Current Account</h4>
          </div>

          <div className="rounded-lg border bg-background-subtle p-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={currentSession.user} />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  {currentSession.user.name || currentSession.user.email}
                </div>
                <div className="text-muted-foreground text-xs">
                  {currentSession.user.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Accounts Section */}
        {otherSessions.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-sm">
                Other Accounts ({otherSessions.length})
              </h4>
            </div>

            <div className="space-y-3">
              {otherSessions.map((session, index) => {
                const isSwitchingThis =
                  isSwitching &&
                  switchingSessionToken === session.session.token;
                const isRemovingThis =
                  isRemoving && removingSessionToken === session.session.token;

                return (
                  <div
                    className="flex items-center justify-between rounded-lg border p-3 max-sm:flex-col max-sm:items-start max-sm:gap-y-2"
                    key={session.session.id || index}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={session.user} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium text-sm">
                          {session.user.name || session.user.email}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {session.user.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          {new UAParser(
                            session.session.userAgent || '',
                          ).getDevice().type === 'mobile' ? (
                            <Smartphone className="h-3 w-3" />
                          ) : (
                            <Monitor className="h-3 w-3" />
                          )}
                          {
                            new UAParser(
                              session.session.userAgent || '',
                            ).getOS().name
                          }
                          ,{' '}
                          {
                            new UAParser(
                              session.session.userAgent || '',
                            ).getBrowser().name
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 max-sm:w-full">
                      <SpinnerButton
                        className="max-sm:flex-1"
                        disabled={isSwitching || isRemoving}
                        isLoading={isSwitchingThis}
                        onClick={() => handleSwitchAccount(session)}
                        size="sm"
                        variant="outline"
                      >
                        {isSwitchingThis ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={15} />
                            Switching...
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Switch
                          </>
                        )}
                      </SpinnerButton>

                      <SpinnerButton
                        className="max-sm:flex-1"
                        disabled={isSwitching || isRemoving}
                        isLoading={isRemovingThis}
                        onClick={() => handleRemoveAccount(session)}
                        size="sm"
                        variant="outline"
                      >
                        {isRemovingThis ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={15} />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </>
                        )}
                      </SpinnerButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add More Accounts Section */}
        {otherSessions.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-2 font-medium text-sm">Add More Accounts</h3>
            <p className="mb-4 text-muted-foreground text-xs">
              You can add up to {MAX_SESSIONS - 1} more accounts to switch
              between them easily.
            </p>
            <Button
              asChild
              className="max-sm:w-full"
              size="sm"
              variant="outline"
            >
              <Link href="/login">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Link>
            </Button>
          </div>
        )}

        {/* Remove Account Confirmation Dialog */}
        <Dialog onOpenChange={setIsRemoveDialogOpen} open={isRemoveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this account? This will sign out
                the account from this device.
              </DialogDescription>
            </DialogHeader>
            {sessionToRemove && (
              <div className="my-4 flex items-center gap-3 rounded-lg border p-3">
                <UserAvatar user={sessionToRemove.user} />
                <div>
                  <div className="font-medium text-sm">
                    {sessionToRemove.user.name || sessionToRemove.user.email}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {sessionToRemove.user.email}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={cancelRemoveAccount} variant="outline">
                Cancel
              </Button>
              <SpinnerButton
                isLoading={isRemoving}
                onClick={confirmRemoveAccount}
                variant="destructive"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={15} />
                    Removing...
                  </>
                ) : (
                  'Remove Account'
                )}
              </SpinnerButton>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
