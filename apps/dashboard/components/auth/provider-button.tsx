import { useAuthRedirect } from '@/hooks/auth.hooks';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { authClient } from '@/lib/auth.client';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { SocialProvider } from 'better-auth/social-providers';
import { toast } from 'sonner';
import type { Provider } from './social-providers';

interface ProviderButtonProps {
  className?: string;
  isSubmitting: boolean;
  provider: Provider;
  redirectTo?: string;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export function ProviderButton({
  className,
  isSubmitting,
  provider,
  redirectTo,
  setIsSubmitting,
}: ProviderButtonProps) {
  const { getFrontendCallbackURL } = useAuthRedirect(redirectTo);

  const doSignInSocial = async () => {
    setIsSubmitting(true);

    try {
      const socialParams = {
        provider: provider.provider as SocialProvider,
        callbackURL: getFrontendCallbackURL(),
      };

      const { error } = await authClient.signIn.social(socialParams);

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="authButton"
      disabled={isSubmitting}
      onClick={doSignInSocial}
      className={cn('w-full', className)}
    >
      {provider.icon && (
        <>
          <provider.icon variant="color" className="dark:hidden" />
          <provider.icon className="hidden dark:block" />
        </>
      )}
      Continue with {provider.name}
    </Button>
  );
}
