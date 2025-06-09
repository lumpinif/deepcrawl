import { SidebarProvider as SidebarProviderUI } from '@deepcrawl/ui/components/ui/sidebar';
import { cookies } from 'next/headers';

export async function SidebarProvider({
  children,
}: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar:state')?.value;
  const sidebarWidth = cookieStore.get('sidebar:width')?.value;

  let defaultSidebarOpen = false;
  if (sidebarState) {
    defaultSidebarOpen = sidebarState === 'true';
  }

  return (
    <SidebarProviderUI
      defaultWidth={sidebarWidth}
      defaultOpen={defaultSidebarOpen}
    >
      {children}
    </SidebarProviderUI>
  );
}
