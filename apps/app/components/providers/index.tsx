import { TailwindIndicator } from '@deepcrawl/ui/components/theme/tailwind-indicator';
import { TooltipProvider } from '@deepcrawl/ui/components/ui/tooltip';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';
import { QueryProviders } from './query.provider';
export type NavigationMode = 'sidebar' | 'header';

export async function Providers({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        enableSystem: true,
        attribute: 'class',
        enableColorScheme: true,
        defaultTheme: 'system',
        disableTransitionOnChange: true,
      }}
    >
      <TooltipProvider delayDuration={0}>
        <NuqsAdapter>
          <QueryProviders>{children}</QueryProviders>
        </NuqsAdapter>
      </TooltipProvider>
      <TailwindIndicator />
    </RootProvider>
  );
}
