'use client';

import type { NavigationMode } from '@/lib/types';
import { LayoutPanelLeftIcon } from '@deepcrawl/ui/components/icons/layout-panel-left';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { useRouter } from 'next/navigation';

import { LayoutPanelTopIcon } from '@deepcrawl/ui/components/icons/layout-panel-top';

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
      ? 'Switch to Vercel Mode'
      : 'Switch to sidebar navigation';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMode}
          className="hidden h-9 w-9 text-muted-foreground md:flex"
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
