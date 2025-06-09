import { ThemeToggle } from '@deepcrawl/ui/components/theme/toggle';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { SidebarTrigger } from '@deepcrawl/ui/components/ui/sidebar';

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-1 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-semibold text-base">DeepCrawl Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
