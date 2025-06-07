import { Geist, Geist_Mono } from 'next/font/google';

import '@deepcrawl/ui/globals.css';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-svh flex-col">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
