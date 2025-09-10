import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { LockIcon, MailIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth.client';
import { type AuthView, authViewRoutes } from '@/routes/auth';

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
          `/${view === 'magicLink' ? authViewRoutes.login : authViewRoutes.magicLink}${window.location.search}`,
        )
      }
      type="button"
      variant="authButton"
    >
      <div className="flex items-center gap-2">
        {view === 'magicLink' ? <LockIcon /> : <MailIcon />}
        Login with {view === 'magicLink' ? 'Password' : 'Magic Link'}
      </div>
      {isMagicLinkLastUsed && view === 'login' && (
        <Badge
          className="absolute right-3 text-muted-foreground text-xs transition-colors duration-150 group-hover:text-foreground"
          variant="secondary"
        >
          Last used
        </Badge>
      )}
      {isEmailLastUsed && view === 'magicLink' && (
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
