import type { Session } from '@deepcrawl/auth/types';
import { ThemeToggle } from '@deepcrawl/ui/components/theme/toggle';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { SidebarTrigger } from '@deepcrawl/ui/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import { IconBook } from '@tabler/icons-react';
import Link from 'next/link';
import type { NavigationMode } from '@/components/providers';
import { LayoutToggle } from '../layout-toggle';
import { UserDropdown } from '../user/user-dropdown';

export function SiteHeader({
  session,
  className,
  navigationMode,
  enableTitle = true,
  enableDocsLink = true,
  enableThemeToggle = false,
  enableLayoutToggle = false,
  enableLayoutViewToggle = true,
}: {
  session?: Session | null;
  className?: string;
  navigationMode: NavigationMode;
  enableThemeToggle?: boolean;
  enableTitle?: boolean;
  enableLayoutToggle?: boolean;
  enableDocsLink?: boolean;
  enableLayoutViewToggle?: boolean;
}) {
  return (
    <header
      className={cn(
        'z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-in-out max-sm:h-16 sm:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
        navigationMode === 'header' &&
          '!h-14 border-none bg-background-subtle px-3 pt-2 pb-0',
        className,
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        {navigationMode === 'sidebar' && enableTitle && (
          <>
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-1 data-[orientation=vertical]:h-4 md:hidden"
              orientation="vertical"
            />
            <Link
              className="font-semibold text-base tracking-tight md:hidden"
              href="/"
            >
              Deepcrawl
            </Link>
          </>
        )}
        {navigationMode === 'header' && enableTitle && (
          <Link className="font-semibold text-base tracking-tight" href="/">
            Deepcrawl
          </Link>
        )}
        <div className="ml-auto flex items-center gap-1">
          {enableThemeToggle && <ThemeToggle />}

          {enableThemeToggle && enableLayoutToggle && (
            <Separator
              className="data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
          )}

          {enableLayoutToggle && <LayoutToggle currentMode={navigationMode} />}

          {enableDocsLink && enableLayoutToggle && (
            <Separator
              className="data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
          )}

          {enableDocsLink && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  className="text-muted-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <Link
                    className="font-medium text-muted-foreground text-sm hover:text-foreground"
                    href="/docs"
                  >
                    <IconBook />
                    <span className="sr-only">Docs</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Docs</p>
              </TooltipContent>
            </Tooltip>
          )}

          {(enableThemeToggle || enableLayoutToggle || enableDocsLink) && (
            <Separator
              className="mr-1 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
          )}
          {session ? (
            <UserDropdown
              enableLayoutViewToggle={enableLayoutViewToggle}
              navigationMode={navigationMode}
              session={session}
            />
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
