'use client';

import { useIsHydrated } from '@/hooks/use-hydrated';
import { type AuthView, authViewRoutes } from '@/routes/auth';
import {
  getAuthViewByPath,
  getAuthViewDetailedDescription,
  getAuthViewTitle,
} from '@/utils';
// import { AuthForm } from '@daveyplate/better-auth-ui';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@deepcrawl/ui/components/ui/card';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import type { SocialProvider } from 'better-auth/social-providers';
import { ArrowLeftIcon, GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AuthCallback } from './auth-callback';
import { AuthForm } from './auth-form';
import { MagicLinkButton } from './magic-link-button';
import { PasskeyButton } from './passkey-button';
import { ProviderButton } from './provider-button';
import { SignOut } from './sign-out';
import { socialProviders } from './social-providers';

export interface AuthCardProps {
  pathname?: string;
  className?: string;
  callbackURL?: string;
  redirectTo?: string;
  view?: AuthView;
  providers?: SocialProvider[];
  otpSeparators?: 0 | 1 | 2;
}

export function AuthCard({
  className,
  callbackURL,
  pathname,
  redirectTo,
  view: viewProp,
  providers = ['github', 'google'],
  otpSeparators = 0,
}: AuthCardProps) {
  const isHydrated = useIsHydrated();
  const path = pathname?.split('/').pop();
  const view = viewProp || getAuthViewByPath(authViewRoutes, path) || 'login';

  const [isSubmitting, setIsSubmitting] = useState(false);

  // REVIEW: what does this do?
  // useEffect(() => {
  //     const handlePageHide = () => {
  //         setIsSubmitting(false)
  //     }

  //     window.addEventListener("pagehide", handlePageHide)

  //     return () => {
  //         setIsSubmitting(false)
  //         window.removeEventListener("pagehide", handlePageHide)
  //     }
  // }, [])

  // Handle special views that don't use the standard card layout
  switch (view) {
    case 'signOut':
      return <SignOut />;
    case 'callback':
      return <AuthCallback redirectTo={redirectTo} />;
    default:
      break;
  }

  return (
    <div className="w-md">
      <div className="mb-2 flex flex-col items-center gap-y-2">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <span className="font-bold text-2xl">
          {getAuthViewTitle(view as AuthView)}
        </span>
        <span className="h-14 select-none text-pretty text-center font-medium text-muted-foreground">
          {getAuthViewDetailedDescription(view as AuthView)}
        </span>
      </div>
      <Card className="w-full border-none">
        <CardContent className="grid gap-6">
          {/* TODO: Add one tap */}
          {/* {oneTap && ["login", "signUp", "magicLink", "emailOTP"].includes(view) && (
                    <OneTap localization={localization} redirectTo={redirectTo} />
                )} */}

          <div className="grid gap-4">
            <AuthForm
              pathname={pathname}
              redirectTo={redirectTo}
              callbackURL={callbackURL}
              isSubmitting={isSubmitting}
              otpSeparators={otpSeparators}
              setIsSubmitting={setIsSubmitting}
            />

            {(() => {
              switch (view) {
                case 'login':
                case 'signUp':
                case 'magicLink':
                case 'emailOTP':
                case 'forgotPassword':
                  return (
                    <MagicLinkButton view={view} isSubmitting={isSubmitting} />
                  );
                default:
                  return null;
              }
            })()}
          </div>

          {view !== 'resetPassword' && (true || true || true) && (
            <>
              <div className="flex items-center gap-2">
                <Separator className="!w-auto grow" />

                <span className="flex-shrink-0 text-muted-foreground text-sm">
                  Or continue with
                </span>

                <Separator className="!w-auto grow" />
              </div>

              <div className="grid gap-4">
                {providers?.length && (
                  <div className="flex w-full flex-col items-center justify-between gap-4">
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
                          callbackURL={callbackURL}
                          isSubmitting={isSubmitting}
                          setIsSubmitting={setIsSubmitting}
                        />
                      );
                    })}
                  </div>
                )}

                {(() => {
                  switch (view) {
                    case 'login':
                    case 'magicLink':
                    case 'emailOTP':
                    case 'recoverAccount':
                    case 'twoFactor':
                    case 'forgotPassword':
                      return (
                        <PasskeyButton
                          redirectTo={redirectTo}
                          isSubmitting={isSubmitting}
                          setIsSubmitting={setIsSubmitting}
                        />
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center gap-1.5 text-muted-foreground text-sm">
          {(() => {
            switch (view) {
              case 'login':
              case 'magicLink':
              case 'emailOTP':
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
                      variant="link"
                      size="sm"
                      className="px-0 text-foreground underline"
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
