import { LockIcon, MailIcon } from 'lucide-react';

import { type AuthView, authViewRoutes } from '@/routes/auth';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { useRouter } from 'next/navigation';

interface MagicLinkButtonProps {
  isSubmitting?: boolean;
  view: AuthView;
}

export function MagicLinkButton({ isSubmitting, view }: MagicLinkButtonProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      className="w-full"
      variant="authButton"
      disabled={isSubmitting}
      onClick={() =>
        router.push(
          `/${view === 'magicLink' ? authViewRoutes.login : authViewRoutes.magicLink}${window.location.search}`,
        )
      }
    >
      {view === 'magicLink' ? <LockIcon /> : <MailIcon />}
      Login with {view === 'magicLink' ? 'Password' : 'Magic Link'}
    </Button>
  );
}
