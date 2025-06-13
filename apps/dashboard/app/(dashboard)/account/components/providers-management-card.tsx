'use client';

import { PasskeyCleanupGuide } from '@/components/passkey-cleanup-guide';
import { SpinnerButton } from '@/components/spinner-button';
import {
  useAddPasskey,
  useAuthSession,
  useRemovePasskey,
  useUserPasskeys,
} from '@/hooks/auth.hooks';
import { authClient } from '@/lib/auth.client';
import { getDeviceTypeDescription } from '@/lib/passkey-utils';
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
  DialogTrigger,
} from '@deepcrawl/ui/components/ui/dialog';
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconEdit,
} from '@tabler/icons-react';
import {
  KeyIcon,
  Loader2,
  Mail,
  Monitor,
  Smartphone,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Helper function to safely format dates from server data
const formatDate = (date: Date | string | null): string => {
  if (!date) return 'Creation date unknown';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(dateObj.getTime())) return 'Creation date unknown';
    return dateObj.toLocaleDateString();
  } catch {
    return 'Creation date unknown';
  }
};

// Type for provider information
interface ProviderInfo {
  id: string;
  name: string;
  type: 'oauth' | 'passkeys' | 'email';
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  lastUsed?: string;
  accountInfo?: string;
}

export function ProvidersManagementCard() {
  const { data: session, isLoading } = useAuthSession();
  const { data: passkeys = [], isLoading: isLoadingPasskeys } =
    useUserPasskeys();
  const { mutate: addPasskey, isPending: isAddingPasskey } = useAddPasskey();
  const { mutate: removePasskey } = useRemovePasskey();
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  const [isPasskeysDialogOpen, setIsPasskeysDialogOpen] = useState(false);
  const [passkeyToRemove, setPasskeyToRemove] = useState<{
    id: string;
    name: string | null;
  } | null>(null);

  const user = session?.user;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Sign-in Methods
          </CardTitle>
          <CardDescription>
            Customize how you access your account. Link your Git profiles and
            set up passkeys for seamless, secure authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Sign-in Methods
          </CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-muted-foreground">
            Unable to load user information
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock provider data based on current session
  // In a real implementation, this would come from the session/user accounts
  const providers: ProviderInfo[] = [
    {
      id: 'email',
      name: 'Email',
      type: 'email',
      icon: Mail,
      connected: !!user.email,
      accountInfo: user.email || '',
    },
    {
      id: 'passkeys',
      name: 'Passkeys',
      type: 'passkeys',
      icon: KeyIcon,
      connected: passkeys.length > 0,
      accountInfo: `${passkeys.length} passkeys registered`,
    },
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      icon: IconBrandGoogle,
      connected: false, // Would check from session.user.accounts
      lastUsed: 'Jun 6',
      accountInfo: user.email,
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'oauth',
      icon: IconBrandGithub,
      connected: false, // Would check from session.user.accounts
      lastUsed: 'Jun 6',
      accountInfo: 'lumpinif',
    },
  ];

  const handleConnectProvider = async (providerId: string) => {
    if (providerId === 'google' || providerId === 'github') {
      try {
        setLinkingProvider(providerId);
        await authClient.linkSocial({
          provider: providerId as 'google' | 'github',
          callbackURL: '/account',
        });
        toast.success('Social provider linked successfully');
      } catch (error) {
        console.error('Failed to link provider:', error);
        toast.error('Failed to link social provider. Please try again.');
      } finally {
        setLinkingProvider(null);
      }
    }
  };

  const handleAddPasskey = () => {
    addPasskey({});
  };

  const handleRemovePasskey = (passkey: {
    id: string;
    name: string | null;
  }) => {
    setPasskeyToRemove(passkey);
  };

  const confirmRemovePasskey = () => {
    if (passkeyToRemove) {
      removePasskey(passkeyToRemove.id);
      setPasskeyToRemove(null);
    }
  };

  const cancelRemovePasskey = () => {
    setPasskeyToRemove(null);
  };

  const handleDisconnectProvider = async (providerId: string) => {
    // TODO: Implement provider disconnection
    toast.error('Provider disconnection not yet implemented');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Sign-in Methods
        </CardTitle>
        <CardDescription>
          Customize how you access your account. Link your Git profiles and set
          up passkeys for seamless, secure authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => {
          const IconComponent = provider.icon;
          const isProviderLoading =
            ((provider.id === 'google' || provider.id === 'github') &&
              linkingProvider === provider.id) ||
            (provider.id === 'passkeys' && isAddingPasskey);

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex flex-1 items-center gap-3">
                <IconComponent className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium text-sm">{provider.name}</span>
                    {provider.connected && provider.lastUsed && (
                      <span className="text-muted-foreground text-xs">
                        Last used {provider.lastUsed}
                      </span>
                    )}
                  </div>
                  {provider.accountInfo && (
                    <div className="text-muted-foreground text-xs">
                      {provider.accountInfo}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {provider.connected ? (
                  <>
                    {/* {provider.id === 'email' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnectProvider(provider.id)}
                        disabled={isProviderLoading}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )} */}
                    {provider.id === 'passkeys' && (
                      <div className="flex gap-2">
                        <Dialog
                          open={isPasskeysDialogOpen}
                          onOpenChange={setIsPasskeysDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <div className="flex items-center gap-x-2">
                                <DialogTitle>Your Passkeys</DialogTitle>
                                <PasskeyCleanupGuide />
                              </div>
                              <DialogDescription className="text-start">
                                Manage your registered passkeys for secure
                                authentication.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              {isLoadingPasskeys ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  <span className="ml-2 text-muted-foreground text-sm">
                                    Loading passkeys...
                                  </span>
                                </div>
                              ) : passkeys.length > 0 ? (
                                passkeys.map((passkey) => {
                                  const IconComponent =
                                    passkey.deviceType === 'cross-platform'
                                      ? Monitor
                                      : Smartphone;
                                  return (
                                    <div
                                      key={passkey.id}
                                      className="flex items-center gap-3 rounded-lg border p-3"
                                    >
                                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">
                                          {passkey.name || 'Unnamed Passkey'}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                          <div>
                                            Added{' '}
                                            {formatDate(passkey.createdAt)}
                                            {passkey.backedUp && ' • Backed up'}
                                          </div>
                                          <div className="mt-1">
                                            {getDeviceTypeDescription(
                                              passkey.deviceType,
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleRemovePasskey(passkey)
                                        }
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">
                                          Remove passkey
                                        </span>
                                      </Button>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="py-6 text-center text-muted-foreground text-sm">
                                  No passkeys registered yet
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <SpinnerButton
                          size="sm"
                          variant="outline"
                          className="w-20"
                          isLoading={isAddingPasskey}
                          onClick={handleAddPasskey}
                          disabled={isAddingPasskey}
                        >
                          Add
                        </SpinnerButton>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {provider.id === 'passkeys' ? (
                      <SpinnerButton
                        size="sm"
                        variant="outline"
                        className="w-20"
                        isLoading={isAddingPasskey}
                        onClick={handleAddPasskey}
                        disabled={isAddingPasskey}
                      >
                        Add
                      </SpinnerButton>
                    ) : provider.id === 'google' || provider.id === 'github' ? (
                      <SpinnerButton
                        size="sm"
                        variant="outline"
                        className="w-24"
                        isLoading={linkingProvider === provider.id}
                        onClick={() => handleConnectProvider(provider.id)}
                        disabled={linkingProvider === provider.id}
                      >
                        Connect
                      </SpinnerButton>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Passkey Removal Confirmation Dialog */}
      <Dialog
        open={!!passkeyToRemove}
        onOpenChange={() => setPasskeyToRemove(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove passkey?</DialogTitle>
            <DialogDescription>
              {passkeys.length === 1 ? (
                <>
                  You are about to remove your last passkey. You will only be
                  able to sign in with a password or email verification.
                  <br />
                  <br />
                  We recommend using passkeys for account sign-in as it is safer
                  and you do not need to remember password and 8-digit code.
                </>
              ) : (
                <>
                  Are you sure you want to remove &ldquo;
                  {passkeyToRemove?.name || 'Unnamed Passkey'}&rdquo;?
                  <br />
                  <br />
                  This passkey will no longer work with any device. You should
                  also remove it from your browser&apos;s password manager to
                  prevent confusion.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-y-2 md:flex-row md:justify-end md:space-x-2 md:space-y-0">
            <Button variant="outline" onClick={cancelRemovePasskey}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemovePasskey}>
              Remove passkey
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
