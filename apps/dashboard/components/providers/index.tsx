'use client';

import { queryClient } from '@/components/providers/query.client';
import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack';
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { authClient } from '@/lib/auth.client';
import { useRouter } from 'next/navigation';
import { TailwindIndicator } from '../theme/tailwind-indicator';

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthQueryProvider>
        <NextThemesProvider
          enableSystem
          attribute="class"
          enableColorScheme
          defaultTheme="system"
          disableTransitionOnChange
        >
          <AuthUIProviderTanstack
            Link={Link}
            persistClient={false}
            navigate={router.push}
            authClient={authClient}
            replace={router.replace}
            additionalFields={{
              age: {
                label: 'Age',
                placeholder: 'Your age',
                description: 'Enter your age',
                required: false,
                type: 'number',
              },
            }}
            settingsFields={['age']}
            settingsURL="/dashboard/settings"
            onSessionChange={() => router.refresh()}
          >
            {children}
          </AuthUIProviderTanstack>
          <Toaster />
          <TailwindIndicator />
        </NextThemesProvider>
      </AuthQueryProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
