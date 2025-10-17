'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
// import { track } from "@vercel/analytics/react";
import { CheckIcon, CopyIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const CODE = 'npm i deepcrawl';
const TIMEOUT = 2000;

export const Installer = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(CODE);
      setIsCopied(true);
      // track("Copied installer code");
      setTimeout(() => setIsCopied(false), TIMEOUT);
    } catch (_error) {}
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <div className="flex w-fit items-center gap-3">
      <div className="group relative flex items-center gap-3 rounded-md border bg-background text-foreground">
        <pre className="group-hover:!text-foreground w-full whitespace-pre-wrap py-2 pl-4 font-semibold text-sm transition-all dark:text-muted-foreground">
          {CODE}
        </pre>
        <Button
          className="!bg-transparent rounded-sm text-muted-foreground group-hover:text-foreground"
          onClick={copyToClipboard}
          size="icon"
          variant="ghost"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </div>
      <Button asChild variant="outline">
        <Link href="/docs">Read the docs</Link>
      </Button>
    </div>
  );
};
