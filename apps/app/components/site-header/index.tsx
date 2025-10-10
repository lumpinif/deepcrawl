'use client';

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
import { useMediaQuery } from '@deepcrawl/ui/hooks/use-media-query';
import { cn } from '@deepcrawl/ui/lib/utils';
import { IconBook } from '@tabler/icons-react';
import Link from 'next/link';
import type { NavigationMode } from '@/components/providers';
import { LayoutToggle } from '../layout-toggle';
import { UserDropdown } from '../user/user-dropdown';

export interface SiteHeaderProps {
  session?: Session | null;
  className?: string;
  navigationMode: NavigationMode;
  enableThemeToggle?: boolean;
  enableTitle?: boolean;
  enableLayoutToggle?: boolean;
  enableDocsLink?: boolean;
  enableLayoutViewToggle?: boolean;
  logoScale?: number;
  logoTransformY?: number;
}

export function SiteHeader({
  session,
  className,
  navigationMode,
  enableTitle = true,
  enableDocsLink = true,
  enableThemeToggle = false,
  enableLayoutToggle = false,
  enableLayoutViewToggle = true,
  logoScale = 1,
  logoTransformY = 0,
}: SiteHeaderProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <header
      className={cn(
        'z-50 h-16 border-b bg-background px-4 pt-4',
        'flex shrink-0 items-center gap-2',
        'transition-[width,height] ease-in-out sm:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
        navigationMode === 'header' &&
          '!h-13 border-none bg-background-subtle pb-0',
        className,
      )}
    >
      <div className="flex h-full w-full items-center gap-1 lg:gap-2">
        {navigationMode === 'sidebar' && enableTitle && (
          <>
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-1 data-[orientation=vertical]:h-4 md:hidden"
              orientation="vertical"
            />
            <Link
              className="font-semibold text-base tracking-tighter md:hidden"
              href="/"
            >
              Deepcrawl
            </Link>
          </>
        )}

        {/* Logo */}
        {navigationMode === 'header' && enableTitle && (
          <div
            className={cn(
              'top-4 left-7 z-50 block bg-background-subtle sm:fixed',
              'transform-gpu transition-all duration-[50ms] ease-linear',
              logoTransformY >= 85 &&
                'top-2.5 text-muted-foreground hover:text-foreground',
            )}
          >
            <Link
              className="font-semibold text-base tracking-tighter"
              href="/"
              style={{
                transformOrigin: 'center center',
                fontSize: isMobile ? '16px' : `calc(16px * ${logoScale})`,
              }}
            >
              Deepcrawl
            </Link>
          </div>
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
