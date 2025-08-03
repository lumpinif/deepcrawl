'use client';

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
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Passkey } from 'better-auth/plugins/passkey';
import {
  KeyIcon,
  Link,
  Mail,
  Monitor,
  Smartphone,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PasskeyCleanupGuide } from '@/components/passkey-cleanup-guide';
import { SpinnerButton } from '@/components/spinner-button';
import {
  useAddPasskey,
  useCanUnlinkProvider,
  useLinkSocialProvider,
  useRemovePasskey,
  useUnlinkSocialProvider,
} from '@/hooks/auth.hooks';
import { getDeviceTypeDescription } from '@/lib/passkey-utils';
import {
  linkedAccountsQueryOptionsClient,
  sessionQueryOptionsClient,
  userPasskeysQueryOptionsClient,
} from '@/query/query-options.client';

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
  type: 'oauth' | 'passkeys' | 'email' | 'magic-link';
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  lastUsed?: string;
  accountInfo?: string;
}

export function ProvidersManagementCard() {
  // const { data: session, isLoading } = useAuthSession();
  // const { data: linkedAccounts = [], isLoading: isLoadingAccounts } =
  //   useLinkedAccounts();
  // const { data: passkeys = [], isLoading: isLoadingPasskeys } =
  //   useUserPasskeys();

  const { data: session } = useSuspenseQuery(sessionQueryOptionsClient());
  const { data: linkedAccounts = [] } = useSuspenseQuery(
    linkedAccountsQueryOptionsClient(),
  );
  const { data: passkeys = [] } = useSuspenseQuery(
    userPasskeysQueryOptionsClient(),
  );

  const { mutate: addPasskey, isPending: isAddingPasskey } = useAddPasskey();
  const { mutate: removePasskey } = useRemovePasskey();
  const { mutate: linkProvider, isPending: isLinkingProvider } =
    useLinkSocialProvider();
  const { mutate: unlinkProvider, isPending: isUnlinkingProvider } =
    useUnlinkSocialProvider();
  const [isPasskeysDialogOpen, setIsPasskeysDialogOpen] = useState(false);
  const [passkeyToRemove, setPasskeyToRemove] = useState<Passkey | null>(null);
  const [processingProvider, setProcessingProvider] = useState<string | null>(
    null,
  );

  const user = session?.user;

  // Get safety check for each provider
  const googleUnlinkSafety = useCanUnlinkProvider('google');
  const githubUnlinkSafety = useCanUnlinkProvider('github');

  // Reset processing provider when mutations complete
  useEffect(() => {
    if (!isLinkingProvider && !isUnlinkingProvider) {
      setProcessingProvider(null);
    }
  }, [isLinkingProvider, isUnlinkingProvider]);

  // if (isLoading || isLoadingAccounts) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle className="flex items-center gap-2">
  //           <UserCheck className="h-5 w-5" />
  //           Sign-in Methods
  //         </CardTitle>
  //         <CardDescription>
  //           Customize how you access your account. Link your Git profiles and
  //           set up passkeys for seamless, secure authentication.
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent className="space-y-6">
  //         <div className="flex items-center justify-center py-8">
  //           <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

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

  // Check if providers are connected based on linked accounts
  const isGoogleConnected =
    Array.isArray(linkedAccounts) &&
    linkedAccounts?.some((account) => account.provider === 'google');
  const isGithubConnected =
    Array.isArray(linkedAccounts) &&
    linkedAccounts?.some((account) => account.provider === 'github');

  // Magic Link detection: If user has verified email but no OAuth accounts or passkeys,
  // they likely used magic link or email verification
  const hasMagicLinkCapability = !!user.emailVerified;
  const magicLinkAccountInfo = hasMagicLinkCapability
    ? `${user.email}`
    : 'Email verification required';

  // Provider data with real connection status
  const providers: ProviderInfo[] = [
    {
      id: 'email',
      name: 'Email & Password',
      type: 'email',
      icon: Mail,
      connected: !!user.email,
      accountInfo: user.email || '',
    },
    {
      id: 'magic-link',
      name: 'Magic Link',
      type: 'magic-link',
      icon: Link,
      connected: hasMagicLinkCapability,
      accountInfo: magicLinkAccountInfo,
    },
    {
      id: 'passkeys',
      name: 'Passkeys',
      type: 'passkeys',
      icon: KeyIcon,
      connected: Array.isArray(passkeys) && passkeys.length > 0,
      accountInfo: `${passkeys?.length || 0} passkeys registered`,
    },
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      icon: IconBrandGoogle,
      connected: isGoogleConnected,
      lastUsed: isGoogleConnected ? 'Recently' : undefined,
      accountInfo: isGoogleConnected ? user.email : undefined,
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'oauth',
      icon: IconBrandGithub,
      connected: isGithubConnected,
      lastUsed: isGithubConnected ? 'Recently' : undefined,
      accountInfo: isGithubConnected ? 'Connected' : undefined,
    },
  ];

  const handleConnectProvider = async (providerId: string) => {
    setProcessingProvider(providerId);
    if (providerId === 'google' || providerId === 'github') {
      linkProvider({
        provider: providerId,
      });
    }
  };

  const handleDisconnectProvider = async (providerId: string) => {
    setProcessingProvider(providerId);
    if (providerId === 'google' || providerId === 'github') {
      unlinkProvider(providerId);
    }
  };

  const handleAddPasskey = () => {
    addPasskey();
  };

  const handleRemovePasskey = (passkey: Passkey) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Sign-in Methods
        </CardTitle>
        <CardDescription>
          Customize how you access your account. Set up passkeys for seamless,
          secure authentication or oAuth providers for easy sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => {
          const IconComponent = provider.icon;

          const canUnlink =
            provider.id === 'google'
              ? googleUnlinkSafety.canUnlink
              : provider.id === 'github'
                ? githubUnlinkSafety.canUnlink
                : true;

          const isThisProviderLinking =
            isLinkingProvider && processingProvider === provider.id;
          const isThisProviderUnlinking =
            isUnlinkingProvider && processingProvider === provider.id;
          const isAnyProviderProcessing =
            isLinkingProvider || isUnlinkingProvider || isAddingPasskey;

          return (
            <div
              key={provider.id}
              className="flex justify-between rounded-lg border p-4 max-sm:flex-col max-sm:gap-y-2 sm:items-center"
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

              <div className="flex items-center gap-2 max-sm:w-full max-sm:flex-col">
                {provider.connected ? (
                  <>
                    {provider.id === 'magic-link' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-24 max-sm:w-full"
                        disabled
                      >
                        Enabled
                      </Button>
                    )}
                    {provider.id === 'passkeys' && (
                      <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
                        <Dialog
                          open={isPasskeysDialogOpen}
                          onOpenChange={setIsPasskeysDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-24 max-sm:w-full"
                              disabled={isAnyProviderProcessing}
                            >
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
                              {
                                // isLoadingPasskeys ? (
                                //   <div className="flex items-center justify-center py-6">
                                //     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                //     <span className="ml-2 text-muted-foreground text-sm">
                                //       Loading passkeys...
                                //     </span>
                                //   </div>
                                // ) :
                                Array.isArray(passkeys) &&
                                passkeys.length > 0 ? (
                                  passkeys.map((passkey) => {
                                    const IconComponent =
                                      passkey.deviceType === 'multiDevice'
                                        ? Smartphone
                                        : Monitor;
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
                                              {passkey.backedUp &&
                                                ' • Backed up'}
                                            </div>
                                            <div className="mt-1">
                                              {getDeviceTypeDescription(
                                                passkey.deviceType,
                                                passkey.name,
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
                                )
                              }
                            </div>
                          </DialogContent>
                        </Dialog>
                        <SpinnerButton
                          size="sm"
                          variant="outline"
                          className="w-24 max-sm:w-full"
                          isLoading={isAddingPasskey}
                          onClick={handleAddPasskey}
                          disabled={isAnyProviderProcessing || !canUnlink}
                        >
                          Add
                        </SpinnerButton>
                      </div>
                    )}
                    {(provider.id === 'google' || provider.id === 'github') && (
                      <SpinnerButton
                        size="sm"
                        variant="outline"
                        className="w-24 max-sm:w-full"
                        isLoading={isThisProviderUnlinking}
                        onClick={() => handleDisconnectProvider(provider.id)}
                        disabled={isAnyProviderProcessing || !canUnlink}
                      >
                        Disconnect
                      </SpinnerButton>
                    )}
                  </>
                ) : provider.id === 'passkeys' ? (
                  <SpinnerButton
                    size="sm"
                    variant="outline"
                    className="w-20 max-sm:w-full"
                    isLoading={isAddingPasskey}
                    onClick={handleAddPasskey}
                    disabled={isAnyProviderProcessing || !canUnlink}
                  >
                    Add
                  </SpinnerButton>
                ) : provider.id === 'google' || provider.id === 'github' ? (
                  <SpinnerButton
                    size="sm"
                    variant="outline"
                    className="w-24 max-sm:w-full"
                    isLoading={isThisProviderLinking}
                    onClick={() => handleConnectProvider(provider.id)}
                    disabled={isAnyProviderProcessing || !canUnlink}
                  >
                    Connect
                  </SpinnerButton>
                ) : null}
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
              {Array.isArray(passkeys) && passkeys?.length === 1 ? (
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
