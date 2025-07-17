'use client';

import type { Session } from '@deepcrawl/auth/types';
import { ThemeGroupToggle } from '@deepcrawl/ui/components/theme/toggle';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@deepcrawl/ui/components/ui/avatar';
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
import { ChevronsDownUpIcon, ChevronsUpDownIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import {
  useAuthSession,
  useDeviceSessions,
  useSetActiveSession,
} from '@/hooks/auth.hooks';

function UserAvatar({ user }: { user: Session['user'] }) {
  return (
    <Avatar className="h-8 w-8 cursor-pointer rounded-full ring-0 ring-transparent">
      <AvatarImage src={user.image || ''} alt={user.name} />
      <AvatarFallback className="rounded-full">
        {user.name?.charAt(0).toUpperCase() ||
          user.email?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserDropdown({
  user: userProp,
  deviceSessions: deviceSessionsProps,
}: {
  user: Session['user'];
  deviceSessions: Session[];
}) {
  const router = useRouter();
  const { data: currentSession } = useAuthSession();
  const { data: deviceSessionsQuery } = useDeviceSessions();
  const { mutate: setActiveSession } = useSetActiveSession();
  const [selectOpen, setSelectOpen] = useState(false);

  // Use React Query data if available (fresh), fallback to server props (SSR/initial load)
  const deviceSessions = deviceSessionsQuery ?? deviceSessionsProps;

  // Determine current user: prioritize React Query session, fallback to server props
  const user = currentSession?.user ?? userProp;

  // Filter to show only other accounts (not current user) - following Better Auth demo pattern
  const otherSessions = deviceSessions
    ? deviceSessions.filter((s) => s.user.id !== user?.id)
    : [];

  // Calculate hasMultipleSessions based on other sessions
  const hasMultipleSessions = otherSessions.length > 0;

  const handleHoverToPrefetchAccount = useCallback(() => {
    router.prefetch('/account');
  }, [router]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none ring-0 ring-transparent">
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl dark:text-muted-foreground"
      >
        <DropdownMenuLabel className="text-xs">
          Current Account
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <Popover
            onOpenChange={setSelectOpen}
            open={hasMultipleSessions ? selectOpen : false}
          >
            <PopoverTrigger
              asChild
              disabled={!hasMultipleSessions}
              // biome-ignore lint/nursery/useSortedClasses: false positive
              className="group/popover w-full focus:bg-accent justify-between hover:[&:not([disabled])]:bg-accent
              focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar user={user} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
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
              side="left"
              align="start"
              sideOffset={12}
              className="flex w-(--radix-dropdown-menu-trigger-width) min-w-56 flex-col gap-2 rounded-lg p-2"
            >
              <DropdownMenuLabel className="px-2 text-muted-foreground text-xs">
                Switch Account
              </DropdownMenuLabel>
              {otherSessions.map((sessionData, i) => (
                <button
                  type="button"
                  key={sessionData.session.id || i}
                  onClick={() => {
                    setActiveSession(sessionData.session.token);
                  }}
                  className="flex items-center gap-2 rounded-sm px-1 py-1.5 text-left text-sm outline-none hover:bg-accent"
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

        {/* 
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              href="/login"
              className="flex w-full items-center justify-between"
            >
              Add Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup> */}

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            onFocus={handleHoverToPrefetchAccount}
            onMouseOver={handleHoverToPrefetchAccount}
            onMouseEnter={handleHoverToPrefetchAccount}
            onPointerEnter={handleHoverToPrefetchAccount}
          >
            <Link href={'/account'}>Account Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="hover:bg-background dark:hover:bg-transparent dark:hover:text-muted-foreground"
          >
            <div className="flex w-full justify-between">
              <span>Theme</span>
              <ThemeGroupToggle />
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <Link href="/logout">
          <DropdownMenuItem>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
