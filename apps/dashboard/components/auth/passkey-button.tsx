import { KeyIcon } from 'lucide-react';

import { useOnSuccessTransition } from '@/hooks/use-success-transition';
import { authClient } from '@/lib/auth.client';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { toast } from 'sonner';

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
      // throw error as it doesn't have an error return object
      const response = await authClient.signIn.passkey({
        fetchOptions: { credentials: 'include', throw: true },
      });

      if (response?.error) {
        toast.error(response.error.message);

        setIsSubmitting?.(false);
      } else {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
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
