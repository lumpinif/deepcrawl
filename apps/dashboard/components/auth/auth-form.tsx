'use client';

import { useEffect } from 'react';

import { type AuthView, authViewRoutes } from '@/routes/auth';
import { getAuthViewByPath } from '@/utils';
import { useRouter } from 'next/navigation';
import { AuthCallback } from './auth-callback';
import { SignInForm } from './forms/sign-in-form';
import { SignUpForm } from './forms/sign-up-form';
import { TwoFactorForm } from './forms/two-factor-form';
import { SignOut } from './sign-out';

export interface AuthFormProps {
  className?: string;
  callbackURL?: string;
  isSubmitting?: boolean;
  pathname?: string;
  redirectTo?: string;
  view?: AuthView;
  otpSeparators?: 0 | 1 | 2;
  setIsSubmitting?: (isSubmitting: boolean) => void;
}

export function AuthForm({
  className,
  callbackURL,
  isSubmitting,
  pathname,
  redirectTo,
  view: viewProp,
  otpSeparators = 0,
  setIsSubmitting,
}: AuthFormProps) {
  const router = useRouter();

  const path = pathname?.split('/').pop();

  useEffect(() => {
    if (path && !getAuthViewByPath(authViewRoutes, path)) {
      console.error(`Invalid auth view: ${path}`);
      router.replace(`${authViewRoutes.login}${window.location.search}`);
    }
  }, [path, authViewRoutes, router]);

  const view = viewProp || getAuthViewByPath(authViewRoutes, path) || 'login';

  switch (view) {
    case 'signOut':
      return <SignOut />;
    case 'callback':
      return <AuthCallback redirectTo={redirectTo} />;
    case 'login':
      return (
        <SignInForm
          className={className}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      );
    case 'signUp':
      return (
        <SignUpForm
          className={className}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      );
    case 'twoFactor':
      return (
        <TwoFactorForm
          className={className}
          otpSeparators={otpSeparators}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      );
    /* case 'recoverAccount':
      return (
        <RecoverAccountForm
          className={className}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      );
    case 'magicLink':
      return (
        <MagicLinkForm
          className={className}
          callbackURL={callbackURL}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      );
    case 'emailOTP':
      return (
        <EmailOTPForm
          className={className}
          callbackURL={callbackURL}
          redirectTo={redirectTo}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      );
    case 'forgotPassword':
      return (
        <ForgotPasswordForm
          className={className}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      );
    case 'resetPassword':
      return <ResetPasswordForm className={className} />; */
    default:
      return null;
  }
}
