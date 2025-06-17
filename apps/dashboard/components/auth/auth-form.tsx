'use client';

import { useEffect } from 'react';

import { type AuthView, authViewRoutes } from '@/routes/auth';
import { getAuthViewByPath } from '@/utils';
import { useRouter } from 'next/navigation';
import { AuthCallback } from './auth-callback';
import { ForgotPasswordForm } from './forms/forgot-password-form';
import { MagicLinkForm } from './forms/magic-link-form';
import { ResetPasswordForm } from './forms/reset-password-form';
import { SignInForm } from './forms/sign-in-form';
import { SignUpForm } from './forms/sign-up-form';
import { VerifyEmailForm } from './forms/verify-email-form';
import { Logout } from './logout';

export interface AuthFormProps {
  className?: string;
  isSubmitting?: boolean;
  pathname?: string;
  redirectTo?: string;
  view?: AuthView;
  otpSeparators?: 0 | 1 | 2;
  setIsSubmitting?: (isSubmitting: boolean) => void;
}

export function AuthForm({
  className,
  isSubmitting,
  pathname,
  redirectTo,
  view: viewProp,
  // otpSeparators = 0,
  setIsSubmitting,
}: AuthFormProps) {
  const router = useRouter();

  const path = pathname?.split('/').pop();

  useEffect(() => {
    if (path && !getAuthViewByPath(authViewRoutes, path)) {
      console.error(`Invalid auth view: ${path}`);
      router.replace(`${authViewRoutes.login}${window.location.search}`);
    }
  }, [path, router]);

  const view = viewProp || getAuthViewByPath(authViewRoutes, path) || 'login';

  switch (view) {
    case 'logout':
      return <Logout />;
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

    case 'magicLink':
      return (
        <MagicLinkForm
          className={className}
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
      return <ResetPasswordForm className={className} />;
    case 'verifyEmail':
      return <VerifyEmailForm className={className} />;
    default:
      return null;
  }
}
