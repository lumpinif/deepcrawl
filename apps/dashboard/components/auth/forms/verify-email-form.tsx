'use client';

import { authClient } from '@/lib/auth.client';
import { authViewRoutes } from '@/routes/auth';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import { CheckCircle, Mail, RefreshCw, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface VerifyEmailFormProps {
  className?: string;
}

type VerificationState = 'loading' | 'success' | 'error' | 'expired';

export function VerifyEmailForm({ className }: VerifyEmailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>('loading');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        const { data, error } = await authClient.verifyEmail({
          query: { token },
        });

        if (error) {
          console.error('Email verification error:', error);

          // Check if it's a token expiry error
          if (
            error.message?.toLowerCase().includes('expired') ||
            error.message?.toLowerCase().includes('invalid')
          ) {
            setState('expired');
          } else {
            setState('error');
          }
          return;
        }

        setState('success');
        toast.success('Email verified successfully!');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Email verification failed:', error);
        setState('error');
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // Note: This would need to be implemented with a way to get the user's email
      // For now, we'll just redirect to login with a message
      toast.info('Please log in again to receive a new verification email');
      router.push(authViewRoutes.login);
    } catch (error) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.push(authViewRoutes.login);
  };

  return (
    <div className={cn('grid w-full gap-6 text-center', className)}>
      {state === 'loading' && (
        <>
          <div className="flex justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Verifying your email...</h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we verify your email address.
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
              Email verified successfully!
            </h3>
            <p className="text-muted-foreground text-sm">
              Your email has been verified. Redirecting to dashboard...
            </p>
          </div>
        </>
      )}

      {state === 'error' && (
        <>
          <div className="flex justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-red-600">
              Verification failed
            </h3>
            <p className="text-muted-foreground text-sm">
              We couldn&apos;t verify your email address. The link may be
              invalid.
            </p>
          </div>
          <Button onClick={handleBackToLogin} className="w-full">
            Back to Login
          </Button>
        </>
      )}

      {state === 'expired' && (
        <>
          <div className="flex justify-center">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-orange-600">
              Verification link expired
            </h3>
            <p className="text-muted-foreground text-sm">
              This verification link has expired. Please request a new one.
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
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
    </div>
  );
}
