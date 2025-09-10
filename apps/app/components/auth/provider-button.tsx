import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { SocialProvider } from 'better-auth/social-providers';
import { toast } from 'sonner';
import { useAuthRedirect } from '@/hooks/auth.hooks';
import { authClient } from '@/lib/auth.client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
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
  const lastUsedMethod = authClient.getLastUsedLoginMethod();
  const isLastUsed = lastUsedMethod === provider.providerId;

  const doSignInSocial = async () => {
    setIsSubmitting(true);

    try {
      const socialParams = {
        provider: provider.providerId as SocialProvider,
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
      className={cn('group relative w-full', className)}
      disabled={isSubmitting}
      onClick={doSignInSocial}
      variant="authButton"
    >
      <div className="flex items-center gap-2">
        {provider.icon && (
          <>
            <provider.icon className="dark:hidden" variant="color" />
            <provider.icon className="hidden dark:block" />
          </>
        )}
        Continue with {provider.name}
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
