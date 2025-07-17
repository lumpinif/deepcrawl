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

  const signInPassKey = async () => {
    setIsSubmitting?.(true);

    try {
      // Use throw: false to get error object instead of throwing
      await authClient.signIn.passkey({
        fetchOptions: {
          credentials: 'include',
          onSuccess: async (context) => {
            if (context?.data) {
              await onSuccess();
            }
          },
          onError: async (context) => {
            const errorMessage = getAuthErrorMessage(context.error);
            toast.error(errorMessage);
          },
        },
      });
    } catch (error) {
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
      setIsSubmitting?.(false);
    }
  };

  return (
    <Button
      value="true"
      name="passkey"
      formNoValidate
      variant="authButton"
      disabled={isSubmitting}
      onClick={signInPassKey}
      className="w-full"
    >
      <KeyIcon />
      Continue with Passkey
    </Button>
  );
}
