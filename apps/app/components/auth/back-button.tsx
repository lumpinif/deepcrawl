'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/auth.hooks';

export function BackButton() {
  const router = useRouter();
  const { data: session, isLoading } = useAuthSession();

  const handleButtonClick = () => {
    if (session) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <Button
        className="absolute top-4 left-4 w-16 text-muted-foreground hover:text-foreground active:scale-95"
        onClick={handleButtonClick}
        size="sm"
        variant="outline"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      className="absolute top-4 left-4 w-16 text-muted-foreground hover:text-foreground active:scale-95"
      onClick={handleButtonClick}
      size="sm"
      variant="outline"
    >
      {session ? 'Back' : 'Home'}
    </Button>
  );
}
