'use client';

import type { Session } from '@deepcrawl/auth/types';
import { GitHubIcon } from '@deepcrawl/ui/components/icons/provider-icons';
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
import { DeepcrawlLogo } from '../deepcrawl-logo';
import { LayoutToggle } from '../layout-toggle';
import { SearchTrigger } from '../search-trigger';
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
  enableGithubLink?: boolean;
  logoScale?: number;
  logoTransformY?: number;
  enableSearchDialog?: boolean;
}

export function SiteHeader({
  session,
  className,
  navigationMode,
  enableTitle = true,
  enableDocsLink = true,
  enableGithubLink = true,
  enableSearchDialog = true,
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
        'z-50 h-16 border-b bg-background px-4',
        'flex shrink-0 items-center gap-2',
        'transition-[width,height] ease-in-out sm:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
        navigationMode === 'header' &&
          '!h-13 border-none bg-background-subtle pt-4 pb-0',
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
            <DeepcrawlLogo
              className="font-semibold text-base tracking-tighter md:hidden"
              href="/"
            />
          </>
        )}

        {/* Logo */}
        {navigationMode === 'header' && enableTitle && (
          <div
            className={cn(
              'top-4 left-7 z-50 block bg-background-subtle max-sm:pl-3 sm:fixed',
              'transform-gpu transition-all duration-[50ms] ease-linear',
              logoTransformY >= 85 &&
                'top-2.5 text-muted-foreground hover:text-foreground',
            )}
          >
            <DeepcrawlLogo
              href="/"
              style={{
                transformOrigin: 'center center',
                fontSize: isMobile ? '16px' : `calc(16px * ${logoScale})`,
              }}
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {[
            enableSearchDialog && (
              <SearchTrigger
                className="!bg-background-subtle mr-1 h-8 w-48 max-sm:hidden"
                key="search"
                placeholder="Search docs..."
              />
            ),
            enableThemeToggle && <ThemeToggle key="theme" />,
            enableLayoutToggle && (
              <LayoutToggle currentMode={navigationMode} key="layout" />
            ),
            enableDocsLink && (
              <Tooltip key="docs">
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
            ),
            enableGithubLink && (
              <Button
                asChild
                className="text-muted-foreground"
                key="github"
                size="icon"
                variant="ghost"
              >
                <Link
                  className="font-medium text-muted-foreground text-sm hover:text-foreground"
                  href="https://github.com/lumpinif/deepcrawl"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <GitHubIcon className="size-[1.4rem]" />
                  <span className="sr-only">Github</span>
                </Link>
              </Button>
            ),
          ]
            .filter(Boolean)
            .flatMap((item, index, array) => [
              item,
              index < array.length - 1 && (
                <Separator
                  className="data-[orientation=vertical]:h-4"
                  key={`sep-${index}`}
                  orientation="vertical"
                />
              ),
            ])
            .filter(Boolean)}

          {(enableGithubLink ||
            enableThemeToggle ||
            enableLayoutToggle ||
            enableDocsLink) && (
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
