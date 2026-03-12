'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
// import { track } from "@vercel/analytics/react";
import { CheckIcon, CopyIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const CODE = 'npm i deepcrawl';
const TIMEOUT = 2000;

type CommandInstallerProps = {
  code: string;
  className?: string;
  compact?: boolean;
};

export const CommandInstaller = ({
  code,
  className,
  compact = false,
}: CommandInstallerProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      // track("Copied installer code");
      setTimeout(() => setIsCopied(false), TIMEOUT);
    } catch (_error) {}
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <div
      className={cn(
        compact
          ? 'group relative inline-flex max-w-full cursor-default items-center rounded-md border bg-background text-foreground'
          : 'group inline-grid max-w-full cursor-default grid-cols-[2.5rem_auto_2.5rem] items-center rounded-md border bg-background text-foreground',
        className,
      )}
      onClick={copyToClipboard}
      role="button"
      tabIndex={0}
    >
      {compact ? (
        <>
          <pre className="min-w-0 whitespace-nowrap px-5 py-2 pr-11 text-center font-semibold text-sm transition-all group-hover:text-foreground! dark:text-muted-foreground">
            {code}
          </pre>
          <Button
            className="absolute right-1 rounded-sm bg-transparent! text-muted-foreground group-hover:text-foreground"
            onClick={copyToClipboard}
            size="icon"
            variant="ghost"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span aria-hidden="true" className="size-9" />
          <pre className="min-w-0 whitespace-nowrap px-4 py-2 text-center font-semibold text-sm transition-all group-hover:text-foreground! dark:text-muted-foreground">
            {code}
          </pre>
          <Button
            className="justify-self-center rounded-sm bg-transparent! text-muted-foreground group-hover:text-foreground"
            onClick={copyToClipboard}
            size="icon"
            variant="ghost"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export const Installer = () => {
  return (
    <div className="flex w-fit flex-col gap-y-4">
      <CommandInstaller code={CODE} />
      <div className="flex items-center gap-x-4">
        <Button asChild variant="default">
          <Link href="/docs">Get Started</Link>
        </Button>
        <Button
          asChild
          className="bg-background! text-muted-foreground"
          variant="outline"
        >
          <Link href="/app">Visit Playground</Link>
        </Button>
      </div>
    </div>
  );
};
