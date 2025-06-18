'use client';

import { useAuthSession } from '@/hooks/auth.hooks';
import { userQueryKeys } from '@/lib/query-keys';
import { authViewRoutes } from '@/routes/auth';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  Mail,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface VerifyEmailFormProps {
  className?: string;
}

type VerificationState =
  | 'checking'
  | 'justVerified'
  | 'alreadyVerified'
  | 'needsVerification'
  | 'notAuthenticated'
  | 'verificationFailed';

//NOTE: this component is not accurate about verification status and logic, needs to be refactored.

export function VerifyEmailForm({ className }: VerifyEmailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [state, setState] = useState<VerificationState>('checking');
  const { data: session, isLoading } = useAuthSession();

  // Check if user was redirected here after verification attempt
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);
  const [sessionCheckRetries, setSessionCheckRetries] = useState(0);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const maxRetries = 3;

  useEffect(() => {
    if (isLoading) return;

    // Check for Better Auth URL parameters indicating verification status
    const error = searchParams.get('error');
    const status = searchParams.get('status');

    // Handle Better Auth error states first
    if (error) {
      switch (error) {
        case 'token_expired':
          setState('verificationFailed');
          toast.error(
            'Verification link has expired. Please request a new one.',
          );
          break;
        case 'invalid_token':
          setState('verificationFailed');
          toast.error('Invalid verification link. Please request a new one.');
          break;
        case 'unauthorized':
          setState('verificationFailed');
          toast.error('Unauthorized access. Please try again.');
          break;
        default:
          setState('verificationFailed');
          toast.error('Email verification failed. Please try again.');
      }
      // Clean up URL parameters after handling error
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    // Handle successful verification - no URL parameters needed since Better Auth auto-signs in
    // We detect successful verification by: user is signed in + email verified + initial load
    // (Without any error URL parameters)

    // Handle session-based state detection
    if (session?.user) {
      if (session.user.emailVerified) {
        // User is verified - determine if this is fresh verification or already verified
        if (isInitialLoad && !hasShownSuccessToast && !error) {
          // User just completed verification (arrived here after verification redirect)
          // No error parameters + verified session + initial load = successful verification
          setState('justVerified');
          toast.success('Email verified successfully!');
          setHasShownSuccessToast(true);
          setIsInitialLoad(false);
        } else if (!isInitialLoad) {
          // User returned to page later or navigated directly
          setState('alreadyVerified');
        }
      } else {
        // User is logged in but email is not verified
        if (!hasTriedRefresh) {
          queryClient.invalidateQueries({ queryKey: userQueryKeys.session });
          setHasTriedRefresh(true);
          setState('checking');
        } else {
          setState('needsVerification');
          setIsInitialLoad(false);
        }
      }
    } else {
      // No session - might need to retry or redirect to sign in
      if (sessionCheckRetries < maxRetries) {
        setTimeout(() => {
          setSessionCheckRetries((prev) => prev + 1);
        }, 1000);
        setState('checking');
      } else {
        setState('notAuthenticated');
        setIsInitialLoad(false);
      }
    }
  }, [
    session,
    isLoading,
    hasShownSuccessToast,
    sessionCheckRetries,
    hasTriedRefresh,
    isInitialLoad,
    queryClient,
    searchParams,
  ]);

  const handleGoToDashboard = () => {
    router.push('/');
  };

  const handleGoToAccount = () => {
    router.push('/account');
  };

  const handleBackToLogin = () => {
    router.push(authViewRoutes.login);
  };

  const handleRefreshSession = () => {
    // Force a page refresh to re-establish session
    window.location.reload();
  };

  return (
    <div className={cn('grid w-full gap-4 text-center', className)}>
      {state === 'checking' && (
        <>
          <div className="flex justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              Checking verification status...
            </h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we check your email verification status.
            </p>
          </div>
        </>
      )}

      {state === 'justVerified' && (
        <>
          <div className="flex justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-600 text-lg">
              Email verified successfully!
            </h3>
            <p className="text-muted-foreground text-sm">
              Your email address has been verified. You can now access all
              features.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleGoToAccount}
              className="w-full"
            >
              Go to Account Settings
            </Button>
          </div>
        </>
      )}

      {state === 'alreadyVerified' && (
        <>
          <div className="flex justify-center">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-600 text-lg">
              Email already verified
            </h3>
            <p className="text-muted-foreground text-sm">
              Your email address is already verified. You have full access to
              your account.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleGoToAccount}
              className="w-full"
            >
              Go to Account Settings
            </Button>
          </div>
        </>
      )}

      {state === 'needsVerification' && (
        <>
          <div className="flex justify-center">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-orange-600">
              Email verification required
            </h3>
            <p className="text-muted-foreground text-sm">
              Please check your inbox for a verification email and click the
              link to verify your account.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleGoToDashboard} className="w-full">
              Continue to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </>
      )}

      {state === 'verificationFailed' && (
        <>
          <div className="flex justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-600">
              Email verification failed
            </h3>
            <p className="text-muted-foreground text-sm">
              The verification link may have expired or is invalid. Please
              request a new verification email.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleBackToLogin} className="w-full">
              Request New Verification Email
            </Button>
            <Button
              variant="outline"
              onClick={handleGoToDashboard}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </div>
        </>
      )}

      {state === 'notAuthenticated' && (
        <>
          <div className="flex justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-600">
              Session not found
            </h3>
            <p className="text-muted-foreground text-sm">
              Your email may have been verified, but we couldn&apos;t detect
              your session. Try refreshing the page or signing in again.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleRefreshSession} className="w-full">
              Refresh Page
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
