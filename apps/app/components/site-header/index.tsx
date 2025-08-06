import type { ListDeviceSessions, Session } from '@deepcrawl/auth/types';
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

export async function SiteHeader({
  session,
  className,
  deviceSessions,
  navigationMode,
  enableTitle = true,
  enableDocsLink = true,
  enableThemeToggle = false,
  enableLayoutToggle = false,
  enableLayoutViewToggle = true,
}: {
  session?: Session | null;
  deviceSessions: ListDeviceSessions;
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
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-4 md:hidden"
            />
            <Link
              href="/"
              className="font-semibold text-base tracking-tight md:hidden"
            >
              Deepcrawl
            </Link>
          </>
        )}
        {navigationMode === 'header' && enableTitle && (
          <Link href="/" className="font-semibold text-base tracking-tight">
            Deepcrawl
          </Link>
        )}
        <div className="ml-auto flex items-center gap-1">
          {enableThemeToggle && <ThemeToggle />}

          {enableThemeToggle && enableLayoutToggle && (
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
          )}

          {enableLayoutToggle && <LayoutToggle currentMode={navigationMode} />}

          {enableDocsLink && enableLayoutToggle && (
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
          )}

          {enableDocsLink && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <Link
                    href="/docs"
                    className="font-medium text-muted-foreground text-sm hover:text-foreground"
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
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-4"
            />
          )}
          {session ? (
            <UserDropdown
              session={session}
              deviceSessions={deviceSessions}
              navigationMode={navigationMode}
              enableLayoutViewToggle={enableLayoutViewToggle}
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
