'use client';

import { LayoutPanelLeftIcon } from '@deepcrawl/ui/components/icons/layout-panel-left';
import { LayoutPanelTopIcon } from '@deepcrawl/ui/components/icons/layout-panel-top';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import type { NavigationMode } from '@/components/providers';

interface LayoutToggleProps {
  currentMode: NavigationMode;
}

export function LayoutToggle({ currentMode }: LayoutToggleProps) {
  const router = useRouter();

  const toggleMode = () => {
    const newMode = currentMode === 'sidebar' ? 'header' : 'sidebar';
    // Set cookie with 7 days expiry
    document.cookie = `navigation:mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    // Refresh the page to apply the new layout
    router.refresh();
  };

  const tooltipContent =
    currentMode === 'sidebar'
      ? 'Switch to header tabs navigation'
      : 'Switch to sidebar navigation';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMode}
          className="h-9 w-9 text-muted-foreground"
        >
          {currentMode === 'sidebar' ? (
            <LayoutPanelTopIcon className="h-4 w-4" />
          ) : (
            <LayoutPanelLeftIcon className="h-4 w-4" />
          )}
          <span className="sr-only">{tooltipContent}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}

export function LayoutViewToggle({ currentMode }: LayoutToggleProps) {
  const router = useRouter();

  const toggleMode = (mode: NavigationMode) => {
    if (mode === currentMode) return;

    const newMode = mode;
    // Set cookie with 7 days expiry
    document.cookie = `navigation:mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    // Refresh the page to apply the new layout
    router.refresh();
  };

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    mode: NavigationMode,
  ) => {
    e.preventDefault();
    toggleMode(mode);
  };

  const buttonCN =
    'flex w-full flex-col items-center gap-2 border hover:bg-accent p-3 rounded-md bg-accent/20';

  return (
    <div className="flex w-full justify-between gap-x-2 py-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={buttonCN}
            onClick={(e) => handleClick(e, 'header')}
          >
            <LayoutPanelTopIcon svgClassName="size-7 text-muted-foreground/70 stroke-[1.2px]" />
            <span className="text-xs">Vercel Tabs</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Vercel-like Tabs</span>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={buttonCN}
            onClick={(e) => handleClick(e, 'sidebar')}
          >
            <LayoutPanelLeftIcon svgClassName="size-7 text-muted-foreground/70 stroke-[1.2px]" />
            <span className="text-xs">Sidebar</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Resizeable Sidebar</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
