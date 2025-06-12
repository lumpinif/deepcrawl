import type { Session } from '@deepcrawl/auth/types';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { SidebarTrigger } from '@deepcrawl/ui/components/ui/sidebar';
import { UserDropdown } from '../user/user-dropdown';

export function SiteHeader({
  user,
  deviceSessions,
}: { user: Session['user']; deviceSessions: Session[] }) {
  return (
    <header className="z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-1 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-semibold text-base">Dashboard</h1>
        {user && (
          <div className="ml-auto flex items-center gap-2">
            <UserDropdown user={user} deviceSessions={deviceSessions} />
          </div>
        )}
      </div>
    </header>
  );
}
