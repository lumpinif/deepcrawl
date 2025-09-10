'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BASE_APP_PATH } from '@/config';
import { useAuthSession } from '@/hooks/auth.hooks';
import { authClient } from '@/lib/auth.client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { getAppRoute } from '@/lib/navigation-config';
import { userQueryKeys } from '@/query/query-keys';
import { authViewRoutes } from '@/routes/auth';

export interface UnifiedVerificationFormProps {
  className?: string;
}

type VerificationType = 'email' | 'magic-link' | 'accept-invitation';

type VerificationState =
  | 'checking'
  | 'success'
  | 'tokenExpired'
  | 'invalidToken'
  | 'userNotFound'
  | 'unauthorized'
  | 'invitationNotFound'
  | 'invitationExpired'
  | 'organizationFull'
  | 'networkError'
  | 'unknownError';

export function UnifiedVerificationForm({
  className,
}: UnifiedVerificationFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [state, setState] = useState<VerificationState>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [canResend, setCanResend] = useState(false);
  const { data: session } = useAuthSession();

  // Determine verification type from pathname
  const verificationType: VerificationType = pathname.includes('/verify-email')
    ? 'email'
    : pathname.includes('/magic-link')
      ? 'magic-link'
      : 'accept-invitation';

  // Get token or invitation ID from URL
  const token = searchParams.get('token');
  const invitationId = searchParams.get('invitationId'); // For accept-invitation routes

  useEffect(() => {
    // Handle URL-based errors first (from Better Auth redirects)
    const error = searchParams.get('error');
    if (error) {
      handleUrlError(error);
      return;
    }

    // Perform verification
    if (verificationType === 'accept-invitation' && invitationId) {
      verifyInvitation(invitationId);
    } else if (
      token &&
      (verificationType === 'email' || verificationType === 'magic-link')
    ) {
      verifyToken(verificationType, token);
    } else {
      setState('invalidToken');
      setErrorMessage('No verification token found in URL.');
    }
  }, [verificationType, token, invitationId, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUrlError = (error: string) => {
    switch (error) {
      case 'token_expired':
        setState('tokenExpired');
        setCanResend(true);
        toast.error('Verification link has expired. Please request a new one.');
        break;
      case 'invalid_token':
        setState('invalidToken');
        setCanResend(true);
        toast.error('Invalid verification link. Please request a new one.');
        break;
      case 'unauthorized':
        setState('unauthorized');
        toast.error('Unauthorized access. Please try again.');
        break;
      default:
        setState('unknownError');
        toast.error('Verification failed. Please try again.');
    }

    // Clean up URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());
  };

  const verifyToken = async (type: 'email' | 'magic-link', token: string) => {
    setState('checking');

    try {
      const result = await (async () => {
        switch (type) {
          case 'email':
            return await authClient.verifyEmail({
              query: { token },
            });

          case 'magic-link':
            return await authClient.magicLink.verify({
              query: { token },
            });

          default:
            throw new Error(`Unknown verification type: ${type}`);
        }
      })();

      if (result?.error) {
        const errorWithDefaults = {
          ...result.error,
          status: result.error.status || 400,
          statusText: result.error.statusText || 'Bad Request',
        };
        handleVerificationError(errorWithDefaults, type);
      } else {
        setState('success');
        const successMessage = getSuccessMessage(type);
        toast.success(successMessage);

        // Refresh session data
        queryClient.invalidateQueries({ queryKey: userQueryKeys.session });

        // Redirect after success
        setTimeout(() => {
          router.push(getAppRoute(BASE_APP_PATH));
        }, 4000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setState('networkError');
      setErrorMessage('Network error occurred. Please try again.');
    }
  };

  const verifyInvitation = async (invitationId: string) => {
    setState('checking');

    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        handleInvitationError(result.error);
      } else {
        setState('success');
        toast.success('Successfully joined organization!');

        // Refresh session data
        queryClient.invalidateQueries({ queryKey: userQueryKeys.session });

        // Redirect to dashboard
        setTimeout(() => {
          router.push(getAppRoute(BASE_APP_PATH));
        }, 2000);
      }
    } catch (error) {
      console.error('Invitation acceptance error:', error);
      setState('networkError');
      setErrorMessage('Network error occurred. Please try again.');
    }
  };

  const handleVerificationError = (
    error: { message?: string; status?: number; code?: string },
    type: 'email' | 'magic-link',
  ) => {
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('expired') || error.status === 410) {
      setState('tokenExpired');
      setCanResend(true);
      setErrorMessage(
        `Your ${type === 'email' ? 'verification' : 'magic'} link has expired.`,
      );
    } else if (errorMessage.includes('invalid') || error.status === 400) {
      setState('invalidToken');
      setCanResend(true);
      setErrorMessage(
        `This ${type === 'email' ? 'verification' : 'magic'} link is invalid.`,
      );
    } else if (errorMessage.includes('user not found')) {
      setState('userNotFound');
      setErrorMessage('User account not found.');
    } else if (errorMessage.includes('unauthorized')) {
      setState('unauthorized');
      setErrorMessage('You are not authorized to perform this action.');
    } else {
      setState('unknownError');
      // Use centralized error handling as fallback for unhandled cases
      const fallbackMessage = getAuthErrorMessage({
        code: error.code,
        message: error.message,
        status: error.status || 400,
        statusText: 'Bad Request',
      });
      setErrorMessage(
        fallbackMessage || 'An unknown verification error occurred.',
      );
    }
  };

  const handleInvitationError = (error: {
    message?: string;
    status?: number;
    code?: string;
  }) => {
    const errorMessage = error.message?.toLowerCase() || '';

    if (
      errorMessage.includes('not found') ||
      errorMessage.includes('invalid')
    ) {
      setState('invitationNotFound');
      setErrorMessage('This invitation link is invalid or has been revoked.');
    } else if (errorMessage.includes('expired')) {
      setState('invitationExpired');
      setErrorMessage('This invitation has expired.');
    } else if (
      errorMessage.includes('organization is full') ||
      errorMessage.includes('member limit')
    ) {
      setState('organizationFull');
      setErrorMessage('This organization has reached its member limit.');
    } else if (errorMessage.includes('unauthorized')) {
      setState('unauthorized');
      setErrorMessage('You need to sign in to accept this invitation.');
    } else {
      setState('unknownError');
      // Use centralized error handling as fallback for unhandled cases
      const fallbackMessage = getAuthErrorMessage({
        code: error.code,
        message: error.message,
        status: error.status || 400,
        statusText: 'Bad Request',
      });
      setErrorMessage(fallbackMessage || 'Failed to accept invitation.');
    }
  };

  const handleResendVerification = async () => {
    try {
      switch (verificationType) {
        case 'email':
          if (session?.user?.email) {
            await authClient.sendVerificationEmail({
              email: session.user.email,
              callbackURL: `${window.location.origin}/verify-email`,
            });
            toast.success('Verification email sent! Please check your inbox.');
          } else {
            toast.error('No email address found. Please sign in again.');
          }
          break;

        case 'magic-link':
          router.push(`/${authViewRoutes.magicLink}`);
          toast.info('Redirecting to request a new magic link...');
          break;

        case 'accept-invitation':
          toast.info(
            'Please contact the person who invited you for a new invitation.',
          );
          break;
      }
    } catch (error) {
      toast.error('Failed to resend verification email.');
    }
  };

  const getSuccessMessage = (type: VerificationType): string => {
    switch (type) {
      case 'email':
        return 'Email verified successfully!';
      case 'magic-link':
        return 'Successfully signed in via magic link!';
      case 'accept-invitation':
        return 'Successfully joined the organization!';
      default:
        return 'Verification successful!';
    }
  };

  const getCheckingMessage = (type: VerificationType): string => {
    switch (type) {
      case 'email':
        return 'Verifying your email address...';
      case 'magic-link':
        return 'Signing you in via magic link...';
      case 'accept-invitation':
        return 'Processing your invitation...';
      default:
        return 'Processing...';
    }
  };

  const getErrorStateUI = () => {
    const showResend =
      canResend &&
      (verificationType === 'email' || verificationType === 'magic-link');

    switch (state) {
      case 'tokenExpired':
      case 'invitationExpired':
        return (
          <>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-lg text-orange-600">
                Link Expired
              </h3>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </div>
            {showResend && (
              <Button className="w-full" onClick={handleResendVerification}>
                {verificationType === 'email'
                  ? 'Send New Verification Email'
                  : 'Request New Magic Link'}
              </Button>
            )}
            {!showResend && (
              <Button
                className="w-full"
                onClick={() => router.push(`/${authViewRoutes.login}`)}
              >
                Back to Login
              </Button>
            )}
          </>
        );

      case 'invalidToken':
      case 'invitationNotFound':
        return (
          <>
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-lg text-red-600">
                Invalid Link
              </h3>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </div>
            {showResend && (
              <Button className="w-full" onClick={handleResendVerification}>
                {verificationType === 'email'
                  ? 'Request New Verification'
                  : 'Request New Magic Link'}
              </Button>
            )}
            {!showResend && (
              <Button
                className="w-full"
                onClick={() => router.push(`/${authViewRoutes.login}`)}
              >
                Back to Login
              </Button>
            )}
          </>
        );

      case 'unauthorized':
        return (
          <>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-lg text-orange-600">
                Sign In Required
              </h3>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push(`/${authViewRoutes.login}`)}
            >
              Sign In
            </Button>
          </>
        );

      case 'organizationFull':
        return (
          <>
            <Users className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-lg text-orange-600">
                Organization Full
              </h3>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push(getAppRoute(BASE_APP_PATH))}
            >
              Continue to Dashboard
            </Button>
          </>
        );

      case 'networkError':
        return (
          <>
            <RefreshCw className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-lg text-orange-600">
                Connection Error
              </h3>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (verificationType === 'accept-invitation' && invitationId) {
                  verifyInvitation(invitationId);
                } else if (token) {
                  verifyToken(
                    verificationType as 'email' | 'magic-link',
                    token,
                  );
                }
              }}
            >
              Try Again
            </Button>
          </>
        );

      default:
        return (
          <>
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-lg text-red-600">
                Verification Failed
              </h3>
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push(`/${authViewRoutes.login}`)}
            >
              Back to Login
            </Button>
          </>
        );
    }
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
              {getCheckingMessage(verificationType)}
            </h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we process your request.
            </p>
          </div>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="flex justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-600 text-lg">
              {getSuccessMessage(verificationType)}
            </h3>
            <p className="text-muted-foreground text-sm">
              {verificationType === 'accept-invitation'
                ? 'You are now a member of the organization.'
                : 'You can now access all features.'}
            </p>
          </div>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => router.push(getAppRoute(BASE_APP_PATH))}
            >
              Go to Dashboard
            </Button>
            {verificationType !== 'accept-invitation' && (
              <Button
                className="w-full"
                onClick={() => router.push(getAppRoute('/account'))}
                variant="outline"
              >
                Go to Account Settings
              </Button>
            )}
          </div>
        </>
      )}

      {state !== 'checking' && state !== 'success' && (
        <div className="flex flex-col items-center gap-4">
          {getErrorStateUI()}
        </div>
      )}
    </div>
  );
}
