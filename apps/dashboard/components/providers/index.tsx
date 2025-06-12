import { TailwindIndicator } from '@deepcrawl/ui/components/theme/tailwind-indicator';
import { SidebarProvider } from '@deepcrawl/ui/components/ui/sidebar';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { QueryProviders } from './query.provider';

export async function Providers({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar:state')?.value;
  const sidebarWidth = cookieStore.get('sidebar:width')?.value;

  let defaultSidebarOpen = false;
  if (sidebarState) {
    defaultSidebarOpen = sidebarState === 'true';
  }

  return (
    <NextThemesProvider
      enableSystem
      attribute="class"
      enableColorScheme
      defaultTheme="system"
      disableTransitionOnChange
    >
      <SidebarProvider
        defaultWidth={sidebarWidth}
        defaultOpen={defaultSidebarOpen}
      >
        <QueryProviders>{children}</QueryProviders>
      </SidebarProvider>
      <TailwindIndicator />
    </NextThemesProvider>
  );
}
