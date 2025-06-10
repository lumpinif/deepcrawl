import type { SocialProvider } from 'better-auth/social-providers';
import { useCallback } from 'react';

import { authClient } from '@/lib/auth.client';
import { authViewRoutes } from '@/routes/auth';
import { getSearchParam } from '@/utils';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import { toast } from 'sonner';
import type { Provider } from './social-providers';

interface ProviderButtonProps {
  className?: string;
  callbackURL?: string;
  isSubmitting: boolean;
  other?: boolean;
  provider: Provider;
  redirectTo?: string;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export function ProviderButton({
  className,
  callbackURL: callbackURLProp,
  isSubmitting,
  other,
  provider,
  redirectTo: redirectToProp,
  setIsSubmitting,
}: ProviderButtonProps) {
  const getRedirectTo = useCallback(
    () => redirectToProp || getSearchParam('redirectTo'),
    [redirectToProp],
  );

  const getCallbackURL = useCallback(
    () =>
      `${
        callbackURLProp ||
        `/${authViewRoutes.callback}?redirectTo=${getRedirectTo()}`
      }`,
    [callbackURLProp, getRedirectTo],
  );

  const doSignInSocial = async () => {
    setIsSubmitting(true);

    try {
      const socialParams = {
        provider: provider.provider as SocialProvider,
        callbackURL: getCallbackURL(),
        fetchOptions: { throw: true },
      };

      await authClient.signIn.social(socialParams);
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
