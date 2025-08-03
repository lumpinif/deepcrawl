import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import '@deepcrawl/ui/globals.css';
import { Providers } from '@/components/providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Theme color matches bg-background from globals.css */}
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000000"
          media="(prefers-color-scheme: dark)"
        />
        {/* Status bar style for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        suppressHydrationWarning
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
