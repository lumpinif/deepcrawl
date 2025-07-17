import { Button } from '@deepcrawl/ui/components/ui/button';
import { LockIcon, MailIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type AuthView, authViewRoutes } from '@/routes/auth';

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
