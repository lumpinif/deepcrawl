'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@deepcrawl/ui/components/ui/card';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import type { SocialProvider } from 'better-auth/social-providers';
import {
  ArrowLeftIcon,
  GalleryVerticalEnd,
  RectangleEllipsis,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useIsHydrated } from '@/hooks/use-hydrated';
import { type AuthView, authViewRoutes } from '@/routes/auth';
import {
  getAuthViewByPath,
  getAuthViewDetailedDescription,
  getAuthViewTitle,
} from '@/utils';
import { AuthCallback } from './auth-callback';
import { AuthForm } from './auth-form';
import { Logout } from './logout';
import { MagicLinkButton } from './magic-link-button';
import { PasskeyButton } from './passkey-button';
import { ProviderButton } from './provider-button';
import { socialProviders } from './social-providers';

export interface AuthCardProps {
  pathname?: string;
  redirectTo?: string;
  view?: AuthView;
  providers?: SocialProvider[];
  otpSeparators?: 0 | 1 | 2;
}

export function AuthCard({
  pathname,
  redirectTo,
  view: viewProp,
  providers = ['github', 'google'],
  otpSeparators = 0,
}: AuthCardProps) {
  const isHydrated = useIsHydrated();
  const path = pathname?.split('/').pop();
  const view = viewProp || getAuthViewByPath(authViewRoutes, path) || 'login';
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moreAuthOptions, setMoreAuthOptions] = useState(false);

  // Preventing Stuck Loading States when the page is hidden or navigated away from
  useEffect(() => {
    const handlePageHide = () => {
      setIsSubmitting(false);
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      setIsSubmitting(false);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Check if we're in a verification flow (has token parameter)
  const hasToken = searchParams.has('token');

  // Handle special views that don't use the standard card layout
  switch (view) {
    case 'logout':
      return <Logout />;
    case 'callback':
      return <AuthCallback redirectTo={redirectTo} />;
    default:
      break;
  }

  return (
    <div className="w-full md:w-md">
      <div className="flex flex-col items-center gap-y-2">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <span className="font-bold text-2xl">
          {/* Show different title for magic link verification */}
          {view === 'magicLink' && hasToken
            ? 'Signing you in...'
            : getAuthViewTitle(view as AuthView)}
        </span>
        <span className="my-2 select-none text-pretty text-center font-medium text-muted-foreground">
          {/* Show different description for magic link verification */}
          {view === 'magicLink' && hasToken
            ? 'Please wait while we sign you in via magic link.'
            : getAuthViewDetailedDescription(view as AuthView)}
        </span>
      </div>
      <Card className="w-full border-none">
        <CardContent className="grid gap-6">
          {/* TODO: Add one tap */}
          {/* {oneTap && ["login", "signUp", "magicLink", "emailOTP"].includes(view) && (
                    <OneTap localization={localization} redirectTo={redirectTo} />
                )} */}

          {(() => {
            switch (view) {
              case 'login':
              case 'signUp':
              case 'magicLink':
                // Hide all login methods when magic link has token (verification in progress)
                if (view === 'magicLink' && hasToken) {
                  return null;
                }
                return (
                  <>
                    {providers?.length && (
                      <div className="grid gap-2">
                        <div className="flex w-full flex-col items-center justify-between gap-2">
                          {providers?.map((provider) => {
                            const socialProvider = socialProviders.find(
                              (socialProvider) =>
                                socialProvider.provider === provider,
                            );
                            if (!socialProvider) return null;

                            return (
                              <ProviderButton
                                key={provider}
                                redirectTo={redirectTo}
                                provider={socialProvider}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                              />
                            );
                          })}
                        </div>

                        {(moreAuthOptions || view === 'magicLink') && (
                          <>
                            <PasskeyButton
                              redirectTo={redirectTo}
                              isSubmitting={isSubmitting}
                              setIsSubmitting={setIsSubmitting}
                            />
                            <MagicLinkButton
                              view={view}
                              isSubmitting={isSubmitting}
                            />
                          </>
                        )}

                        {!moreAuthOptions && view !== 'magicLink' && (
                          <Button
                            className="w-full"
                            variant="authButton"
                            disabled={isSubmitting}
                            onClick={() => setMoreAuthOptions(true)}
                          >
                            <RectangleEllipsis />
                            Passkey or Magic Link
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                );

              default:
                return null;
            }
          })()}

          {(() => {
            switch (view) {
              case 'login':
              case 'signUp':
              case 'magicLink':
                // Hide separator when magic link has token (verification in progress)
                if (view === 'magicLink' && hasToken) {
                  return null;
                }
                return (
                  <div className="flex items-center gap-2">
                    <Separator className="!w-auto grow" />
                    <span className="flex-shrink-0 text-muted-foreground text-sm">
                      {view === 'login'
                        ? 'Or continue with'
                        : view === 'signUp'
                          ? 'Sign up below'
                          : view === 'magicLink'
                            ? 'Or continue with magic link'
                            : null}
                    </span>
                    <Separator className="!w-auto grow" />
                  </div>
                );
              default:
                return null;
            }
          })()}

          <div className="grid gap-4">
            <AuthForm
              pathname={pathname}
              redirectTo={redirectTo}
              isSubmitting={isSubmitting}
              otpSeparators={otpSeparators}
              setIsSubmitting={setIsSubmitting}
            />
          </div>
        </CardContent>

        <CardFooter className="justify-center gap-1.5 text-muted-foreground text-sm">
          {(() => {
            switch (view) {
              case 'login':
              case 'magicLink':
              case 'emailOTP':
                // Hide footer navigation when magic link has token (verification in progress)
                if (view === 'magicLink' && hasToken) {
                  return null;
                }
                return (
                  <>
                    Don&apos;t have an account?
                    <Link
                      className="text-foreground underline"
                      href={`/${authViewRoutes.signUp}${isHydrated ? window.location.search : ''}`}
                    >
                      <Button
                        size="sm"
                        variant="link"
                        className="px-1 text-foreground hover:underline"
                      >
                        Sign up
                      </Button>
                    </Link>
                  </>
                );
              case 'signUp':
                return (
                  <>
                    Already have an account?
                    <Link
                      className="text-foreground underline"
                      href={`/${authViewRoutes.login}${isHydrated ? window.location.search : ''}`}
                    >
                      <Button
                        size="sm"
                        variant="link"
                        className="px-1 text-foreground hover:underline"
                      >
                        Sign in
                      </Button>
                    </Link>
                  </>
                );
              default:
                return (
                  <>
                    <ArrowLeftIcon className="size-3" />
                    <Button
                      size="sm"
                      variant="link"
                      className="px-0 text-muted-foreground hover:text-foreground hover:underline"
                      onClick={() => window.history.back()}
                    >
                      Go back
                    </Button>
                  </>
                );
            }
          })()}
        </CardFooter>
      </Card>
    </div>
  );
}
