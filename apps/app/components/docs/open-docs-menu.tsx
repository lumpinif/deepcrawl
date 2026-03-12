'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import { cn } from '@deepcrawl/ui/lib/utils';
import {
  Bot,
  ChevronDown,
  ExternalLink,
  FileText,
  Github,
  Sparkles,
} from 'lucide-react';

type OpenDocsMenuProps = {
  className?: string;
  githubUrl: string;
  markdownUrl: string;
  pageUrl: string;
};

const AI_PROMPT = 'I want to ask questions about it.';

export function OpenDocsMenu({
  className,
  githubUrl,
  markdownUrl,
  pageUrl,
}: OpenDocsMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            'gap-1.5 rounded-xl border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
            className,
          )}
          size="sm"
          variant="outline"
        >
          <ExternalLink className="size-4" />
          <span>Open</span>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-xl border-fd-border bg-fd-popover p-1.5"
        side="bottom"
      >
        <DropdownMenuItem asChild>
          <a href={githubUrl} rel="noreferrer noopener" target="_blank">
            <Github className="size-4" />
            <span>Open in GitHub</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={markdownUrl} rel="noreferrer noopener" target="_blank">
            <FileText className="size-4" />
            <span>View as Markdown</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href={buildSciraUrl(pageUrl)}
            rel="noreferrer noopener"
            target="_blank"
          >
            <Sparkles className="size-4" />
            <span>Open in Scira AI</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={buildChatGptUrl(pageUrl)}
            rel="noreferrer noopener"
            target="_blank"
          >
            <Bot className="size-4" />
            <span>Open in ChatGPT</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={buildClaudeUrl(pageUrl)}
            rel="noreferrer noopener"
            target="_blank"
          >
            <Bot className="size-4" />
            <span>Open in Claude</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={buildCursorUrl(pageUrl)}
            rel="noreferrer noopener"
            target="_blank"
          >
            <Bot className="size-4" />
            <span>Open in Cursor</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function buildSciraUrl(pageUrl: string): string {
  return `https://scira.ai/?q=${encodePrompt(pageUrl)}`;
}

function buildChatGptUrl(pageUrl: string): string {
  return `https://chatgpt.com/?hints=search&q=${encodePrompt(pageUrl)}`;
}

function buildClaudeUrl(pageUrl: string): string {
  return `https://claude.ai/new?q=${encodePrompt(pageUrl)}`;
}

function buildCursorUrl(pageUrl: string): string {
  return `https://cursor.com/link/prompt?text=${encodePrompt(pageUrl)}`;
}

function encodePrompt(pageUrl: string): string {
  return encodeURIComponent(`Read ${pageUrl}, ${AI_PROMPT}`);
}
