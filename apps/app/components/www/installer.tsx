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
    <div className="flex w-fit flex-col gap-y-4">
      <div
        className="group relative flex cursor-default items-center gap-2 rounded-md border bg-background text-foreground"
        onClick={copyToClipboard}
        role="button"
        tabIndex={0}
      >
        <pre className="group-hover:!text-foreground w-full whitespace-pre-wrap py-2 text-center font-semibold text-sm transition-all dark:text-muted-foreground">
          {CODE}
        </pre>
        <Button
          className="!bg-transparent absolute right-0 rounded-sm text-muted-foreground group-hover:text-foreground"
          onClick={copyToClipboard}
          size="icon"
          variant="ghost"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-x-4">
        <Button asChild variant="default">
          <Link href="/docs">Get Started</Link>
        </Button>
        <Button
          asChild
          className="!bg-background text-muted-foreground"
          variant="outline"
        >
          <Link href="/app">Visit Playground</Link>
        </Button>
      </div>
    </div>
  );
};
