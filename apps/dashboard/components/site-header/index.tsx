import type { NavigationMode } from '@/lib/types';
import type { Session } from '@deepcrawl/auth/types';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { SidebarTrigger } from '@deepcrawl/ui/components/ui/sidebar';
import { cn } from '@deepcrawl/ui/lib/utils';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { LayoutToggle } from '../layout-toggle';
import { UserDropdown } from '../user/user-dropdown';

export async function SiteHeader({
  user,
  deviceSessions,
  className,
}: {
  user: Session['user'];
  deviceSessions: Session[];
  className?: string;
}) {
  const cookieStore = await cookies();
  const navigationMode =
    (cookieStore.get('navigation:mode')?.value as NavigationMode) || 'sidebar';

  return (
    <header
      className={cn(
        'z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-in-out max-sm:h-16 sm:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
        navigationMode === 'header' &&
          '!h-12 border-none bg-background-subtle px-3 pt-2 pb-0',
        className,
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        {navigationMode === 'sidebar' && (
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
        {navigationMode === 'header' && (
          <Link href="/" className="font-semibold text-base tracking-tight">
            Deepcrawl
          </Link>
        )}
        {user && (
          <div className="ml-auto flex items-center gap-2">
            <LayoutToggle currentMode={navigationMode} />
            <UserDropdown user={user} deviceSessions={deviceSessions} />
          </div>
        )}
      </div>
    </header>
  );
}
