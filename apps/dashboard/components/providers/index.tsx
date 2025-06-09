import { TailwindIndicator } from '@deepcrawl/ui/components/theme/tailwind-indicator';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { QueryProviders } from './query.provider';
import { SidebarProvider } from './sidebar.provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      enableSystem
      attribute="class"
      enableColorScheme
      defaultTheme="system"
      disableTransitionOnChange
    >
      <SidebarProvider>
        <QueryProviders>{children}</QueryProviders>
      </SidebarProvider>
      <TailwindIndicator />
    </NextThemesProvider>
  );
}
