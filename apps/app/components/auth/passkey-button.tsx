import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { KeyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useOnSuccessTransition } from '@/hooks/use-success-transition';
import { authClient } from '@/lib/auth.client';
import {
  getAuthErrorMessage,
  isWebAuthnCancellationError,
} from '@/lib/auth-errors';

interface PasskeyButtonProps {
  isSubmitting?: boolean;
  redirectTo?: string;
  setIsSubmitting?: (isSubmitting: boolean) => void;
}

export function PasskeyButton({
  isSubmitting,
  redirectTo,
  setIsSubmitting,
}: PasskeyButtonProps) {
  const { onSuccess } = useOnSuccessTransition({ redirectTo });
  const lastUsedMethod = authClient.getLastUsedLoginMethod();
  const isLastUsed = lastUsedMethod === 'passkey';

  const signInPassKey = async () => {
    console.log('[PasskeyButton] Sign in started', {
      redirectTo,
      isProduction: process.env.NODE_ENV === 'production',
      timestamp: new Date().toISOString(),
    });

    setIsSubmitting?.(true);

    try {
      // Use throw: false to get error object instead of throwing
      await authClient.signIn.passkey({
        fetchOptions: {
          credentials: 'include',
          onSuccess: async (context) => {
            console.log('[PasskeyButton] Passkey auth success', {
              hasData: !!context?.data,
              redirectTo,
              timestamp: new Date().toISOString(),
            });

            if (context?.data) {
              console.log('[PasskeyButton] Calling onSuccess...');
              await onSuccess();
              console.log('[PasskeyButton] onSuccess completed');
            } else {
              console.warn('[PasskeyButton] No data in success context');
            }
          },
          onError: async (context) => {
            console.error('[PasskeyButton] Passkey auth error', {
              error: context.error,
              timestamp: new Date().toISOString(),
            });
            const errorMessage = getAuthErrorMessage(context.error);
            toast.error(errorMessage);
          },
        },
      });
    } catch (error) {
      console.error('[PasskeyButton] Caught exception during passkey auth', {
        error,
        isWebAuthnCancellation: isWebAuthnCancellationError(error),
        timestamp: new Date().toISOString(),
      });

      // Only show error toast for actual errors, not cancellations
      if (!isWebAuthnCancellationError(error)) {
        // Handle unexpected errors that still throw despite throw: false
        const errorMessage =
          error instanceof Error
            ? getAuthErrorMessage({
                message: error.message,
                status: 400,
                statusText: 'Bad Request',
              })
            : 'An unexpected error occurred. Please try again.';

        toast.error(errorMessage);
      }
    } finally {
      console.log('[PasskeyButton] Sign in finished', {
        timestamp: new Date().toISOString(),
      });
      setIsSubmitting?.(false);
    }
  };

  return (
    <Button
      className="group relative w-full"
      disabled={isSubmitting}
      formNoValidate
      name="passkey"
      onClick={signInPassKey}
      value="true"
      variant="authButton"
    >
      <div className="flex items-center gap-2">
        <KeyIcon />
        Continue with Passkey
      </div>
      {isLastUsed && (
        <Badge
          className="absolute right-3 text-muted-foreground text-xs transition-colors duration-150 group-hover:text-foreground"
          variant="secondary"
        >
          Last used
        </Badge>
      )}
    </Button>
  );
}
