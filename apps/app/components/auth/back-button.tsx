'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      className="absolute top-4 left-4 text-muted-foreground hover:text-foreground active:scale-95"
      onClick={() => router.back()}
      size="sm"
      variant="outline"
    >
      Back
    </Button>
  );
}
