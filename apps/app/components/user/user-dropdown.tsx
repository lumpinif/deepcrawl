'use client';

import type {
  LDSUser,
  ListDeviceSessions,
  Session,
} from '@deepcrawl/auth/types';
import { GitHubIcon } from '@deepcrawl/ui/components/icons/provider-icons';
import { ThemeGroupToggle } from '@deepcrawl/ui/components/theme/toggle';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@deepcrawl/ui/components/ui/avatar';
import { buttonVariants } from '@deepcrawl/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@deepcrawl/ui/components/ui/popover';
import { Skeleton } from '@deepcrawl/ui/components/ui/skeleton';
import { useIsMac } from '@deepcrawl/ui/hooks/use-is-mac';
import { IconBook } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { ChevronsDownUpIcon, ChevronsUpDownIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { NavigationMode } from '@/components/providers';
import { useSetActiveSession } from '@/hooks/auth.hooks';
import { getAppRoute } from '@/lib/navigation-config';
import {
  deviceSessionsQueryOptionsClient,
  sessionQueryOptionsClient,
} from '@/query/query-options.client';
import { LayoutViewToggle } from '../layout-toggle';

export function UserDropdownSkeleton() {
  return (
    <div className="ml-2 flex items-center">
      <Skeleton className="size-6 rounded-full" />
    </div>
  );
}

function UserAvatar({ user }: { user: Session['user'] | LDSUser | undefined }) {
  return (
    <Avatar className="size-6 cursor-pointer rounded-full ring-0 ring-transparent">
      <AvatarImage alt={user?.name} src={user?.image || ''} />
      <AvatarFallback className="rounded-full">
        {user?.name?.charAt(0).toUpperCase() ||
          user?.email?.charAt(0).toUpperCase() || (
            <Skeleton className="size-6 rounded-full" />
          )}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserDropdown({
  session,
  redirectLogout,
  navigationMode,
  deviceSessions: deviceSessionsProps,
  enableLayoutViewToggle = true,
}: {
  session: Session;
  redirectLogout?: string;
  deviceSessions: ListDeviceSessions;
  navigationMode?: NavigationMode;
  enableLayoutViewToggle?: boolean;
}) {
  const router = useRouter();
  const isMac = useIsMac();

  const { data: currentSession } = useQuery(
    sessionQueryOptionsClient({ init: session }),
  );
  const { data: deviceSessionsQuery } = useQuery(
    deviceSessionsQueryOptionsClient({ init: deviceSessionsProps }),
  );

  const { mutate: setActiveSession } = useSetActiveSession();
  const [selectOpen, setSelectOpen] = useState(false);

  // Use React Query data if available (fresh), fallback to server props (SSR/initial load)
  const deviceSessions = deviceSessionsQuery ?? deviceSessionsProps;

  // Determine current user: prioritize React Query session
  const user = currentSession?.user;

  // Filter to show only other accounts (not current user) - following Better Auth demo pattern
  const otherSessions = deviceSessions
    ? deviceSessions.filter((s) => s.user.id !== user?.id)
    : [];

  // Calculate hasMultipleSessions based on other sessions
  const hasMultipleSessions = otherSessions.length > 0;

  const handleHoverToPrefetchAccount = useCallback(() => {
    router.prefetch(getAppRoute('/account'));
  }, [router]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none ring-0 ring-transparent">
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-xs rounded-xl bg-background-subtle px-1.5 dark:text-muted-foreground"
        side="bottom"
        sideOffset={12}
      >
        <DropdownMenuGroup>
          <Popover
            onOpenChange={setSelectOpen}
            open={hasMultipleSessions ? selectOpen : false}
          >
            <PopoverTrigger
              asChild
              className="group/popover data-[variant=destructive]:*:[svg]:!text-destructive relative flex w-full cursor-default select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 hover:[&:not([disabled])]:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0"
              disabled={!hasMultipleSessions}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar user={user} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || <Skeleton className="h-3 w-1/2" />}
                    </span>
                    <span className="truncate font-medium text-xs">
                      {user?.email || <Skeleton className="h-3 w-full" />}
                    </span>
                  </div>
                </div>
                {hasMultipleSessions ? (
                  selectOpen ? (
                    <ChevronsDownUpIcon className="size-4 opacity-50 group-hover/popover:opacity-100" />
                  ) : (
                    <ChevronsUpDownIcon className="size-4 opacity-50 group-hover/popover:opacity-100" />
                  )
                ) : undefined}
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="flex w-(--radix-dropdown-menu-trigger-width) min-w-xs flex-col gap-2 rounded-lg bg-background-subtle p-2"
              side="left"
              sideOffset={12}
            >
              <DropdownMenuLabel className="px-2 text-muted-foreground text-xs">
                Switch Account
              </DropdownMenuLabel>
              {otherSessions.map((sessionData, i) => (
                <button
                  className="flex items-center gap-2 rounded-sm px-1 py-1.5 text-left text-sm outline-none hover:bg-accent"
                  key={sessionData.session.id || i}
                  onClick={() => {
                    setActiveSession(sessionData.session.token);
                  }}
                  type="button"
                >
                  <UserAvatar user={sessionData.user} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {sessionData.user.name}
                    </span>
                    <span className="truncate text-xs">
                      {sessionData.user.email}
                    </span>
                  </div>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              className="flex w-full items-center justify-between"
              href={getAppRoute('/app')}
            >
              Dashboard
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            onFocus={handleHoverToPrefetchAccount}
            onMouseEnter={handleHoverToPrefetchAccount}
            onMouseOver={handleHoverToPrefetchAccount}
            onPointerEnter={handleHoverToPrefetchAccount}
          >
            <Link href={getAppRoute('/account')}>Account Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="hover:bg-background dark:hover:bg-transparent dark:hover:text-muted-foreground"
          >
            <div className="flex w-full justify-between">
              <span>Command Menu</span>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none flex h-5 select-none items-center justify-center gap-1 rounded border bg-background px-1 font-medium font-sans text-[0.7rem] text-muted-foreground [&_svg:not([class*='size-'])]:size-3">
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className="pointer-events-none flex aspect-square h-5 select-none items-center justify-center gap-1 rounded border bg-background px-1 font-medium font-sans text-[0.7rem] text-muted-foreground [&_svg:not([class*='size-'])]:size-3">
                  K
                </kbd>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="hover:bg-background dark:hover:bg-transparent dark:hover:text-muted-foreground"
          >
            <div className="flex w-full justify-between">
              <span>Theme</span>
              <ThemeGroupToggle />
            </div>
          </DropdownMenuItem>

          {navigationMode && enableLayoutViewToggle && (
            <DropdownMenuItem
              asChild
              className="hover:!bg-transparent dark:hover:bg-transparent dark:hover:text-muted-foreground"
            >
              <div className="flex w-full flex-col items-start">
                <span>Customize dashboard layout</span>
                <LayoutViewToggle currentMode={navigationMode} />
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <Link href="/docs">
          <DropdownMenuItem className="flex w-full items-center justify-between">
            Docs
            <IconBook />
          </DropdownMenuItem>
        </Link>

        <a
          href="https://github.com/lumpinif/deepcrawl"
          rel="noopener noreferrer"
          target="_blank"
        >
          <DropdownMenuItem className="flex w-full items-center justify-between">
            Github
            <GitHubIcon />
          </DropdownMenuItem>
        </a>

        <DropdownMenuSeparator />

        <Link
          className={buttonVariants({ className: 'my-2 w-full' })}
          href={`/logout${redirectLogout ? `?redirect=${redirectLogout}` : ''}`}
        >
          Log out
          <LogOut />
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
