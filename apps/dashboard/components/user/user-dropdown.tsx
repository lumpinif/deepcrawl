'use client';

import { ChevronsDownUpIcon, ChevronsUpDownIcon, LogOut } from 'lucide-react';

import type { Session } from '@deepcrawl/auth/types';
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

import { useAuthSession } from '@/hooks/auth.hooks';
import { authClient } from '@/lib/auth.client';
import { ThemeGroupToggle } from '@deepcrawl/ui/components/theme/toggle';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@deepcrawl/ui/components/ui/popover';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  deviceSessions,
}: { user: Session['user']; deviceSessions: Session[] }) {
  const router = useRouter();
  const { data: currentSession } = useAuthSession();
  const [selectOpen, setSelectOpen] = useState(false);

  const hasMultipleSessions = deviceSessions.length > 1;
  const user = currentSession?.user ?? userProp;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none ring-0 ring-transparent">
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl dark:bg-background-subtle dark:text-muted-foreground dark:backdrop-blur-sm"
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
              // biome-ignore lint/nursery/useSortedClasses: <explanation>
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
              className="flex w-(--radix-dropdown-menu-trigger-width) min-w-56 flex-col gap-2 rounded-lg bg-background-subtle p-2 backdrop-blur-sm"
            >
              <DropdownMenuLabel className="px-2 text-muted-foreground text-xs">
                Switch Account
              </DropdownMenuLabel>
              {deviceSessions
                .filter((s) => s.user.id !== user.id)
                .map((u, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      authClient.multiSession.setActive({
                        sessionToken: u.session.token,
                      });
                      router.refresh();
                    }}
                    className="flex items-center gap-2 rounded-sm px-1 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <UserAvatar user={u.user} />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {u.user.name}
                      </span>
                      <span className="truncate text-xs">{u.user.email}</span>
                    </div>
                  </button>
                ))}
            </PopoverContent>
          </Popover>
        </DropdownMenuGroup>

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
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
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
