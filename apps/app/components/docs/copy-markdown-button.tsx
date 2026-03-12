'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils';

type CopyMarkdownButtonProps = {
  className?: string;
  markdownUrl: string;
};

const RESET_DELAY_MS = 1500;

export function CopyMarkdownButton({
  className,
  markdownUrl,
}: CopyMarkdownButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsCopied(false);
    }, RESET_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isCopied]);

  const handleCopy = async () => {
    const response = await fetch(markdownUrl, {
      headers: {
        Accept: 'text/markdown',
      },
    });

    if (!response.ok) {
      toast.error('Failed to load markdown');
      return;
    }

    const markdown = await response.text();
    const didCopy = await copyToClipboard(markdown);

    if (!didCopy) {
      toast.error('Failed to copy markdown');
      return;
    }

    setIsCopied(true);
  };

  return (
    <Button
      aria-label={isCopied ? 'Markdown copied' : 'Copy page markdown'}
      className={cn(
        'gap-1.5 rounded-xl border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
        className,
      )}
      onClick={handleCopy}
      size="sm"
      type="button"
      variant="outline"
    >
      {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
      <span>{isCopied ? 'Copied' : 'Copy Markdown'}</span>
    </Button>
  );
}
