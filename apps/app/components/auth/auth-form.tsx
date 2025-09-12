'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { type AuthView, authViewRoutes } from '@/routes/auth';
import { getAuthViewByPath } from '@/utils';
import { AuthCallback } from './auth-callback';
import { ForgotPasswordForm } from './forms/forgot-password-form';
import { MagicLinkForm } from './forms/magic-link-form';
import { ResetPasswordForm } from './forms/reset-password-form';
import { SignInForm } from './forms/sign-in-form';
import { SignUpForm } from './forms/sign-up-form';
import { UnifiedVerificationForm } from './forms/unified-verification-form';
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
  const searchParams = useSearchParams();

  const path = pathname?.split('/').pop();

  useEffect(() => {
    if (path && !getAuthViewByPath(authViewRoutes, path)) {
      router.replace(`/${authViewRoutes.login}${window.location.search}`);
    }
  }, [path, router]);

  const view = viewProp || getAuthViewByPath(authViewRoutes, path) || 'login';

  // Check if we're in a verification flow (has token parameter)
  const hasToken = searchParams.has('token');

  switch (view) {
    case 'logout':
      return <Logout />;
    case 'callback':
      return <AuthCallback redirectTo={redirectTo} />;
    case 'login':
      return (
        <SignInForm
          className={className}
          isSubmitting={isSubmitting}
          redirectTo={redirectTo}
          setIsSubmitting={setIsSubmitting}
        />
      );
    case 'signUp':
      return (
        <SignUpForm
          className={className}
          isSubmitting={isSubmitting}
          redirectTo={redirectTo}
          setIsSubmitting={setIsSubmitting}
        />
      );

    case 'magicLink':
      // If magic link has a token, show verification form instead of request form
      if (hasToken) {
        return <UnifiedVerificationForm className={className} />;
      }
      return (
        <MagicLinkForm
          className={className}
          isSubmitting={isSubmitting}
          redirectTo={redirectTo}
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
    case 'acceptInvitation':
      return <UnifiedVerificationForm className={className} />;
    default:
      return null;
  }
}
