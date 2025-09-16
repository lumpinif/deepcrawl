import { Button } from '@deepcrawl/ui/components/ui/button';
import { LockIcon, MailIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth.client';
import { type AuthView, authViewSegments } from '@/routes/auth';
import { LastUsedBadge } from './last-userd-badge';

interface MagicLinkButtonProps {
  isSubmitting?: boolean;
  view: AuthView;
}

export function MagicLinkButton({ isSubmitting, view }: MagicLinkButtonProps) {
  const router = useRouter();
  const lastUsedMethod = authClient.getLastUsedLoginMethod();
  const isEmailLastUsed = lastUsedMethod === 'email';
  const isMagicLinkLastUsed = lastUsedMethod === 'magic-link';

  return (
    <Button
      className="group relative w-full"
      disabled={isSubmitting}
      onClick={() =>
        router.push(
          `/${view === 'magicLink' ? authViewSegments.login : authViewSegments.magicLink}${window.location.search}`,
        )
      }
      type="button"
      variant="authButton"
    >
      <div className="flex items-center gap-2">
        {view === 'magicLink' ? <LockIcon /> : <MailIcon />}
        Login with {view === 'magicLink' ? 'Password' : 'Magic Link'}
      </div>
      {isMagicLinkLastUsed && view === 'login' && <LastUsedBadge />}
      {isEmailLastUsed && view === 'magicLink' && <LastUsedBadge />}
    </Button>
  );
}
