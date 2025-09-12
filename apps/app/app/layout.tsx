import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import '@deepcrawl/ui/globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/components/providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        {/* Theme color matches bg-background from globals.css */}
        <meta
          content="#ffffff"
          media="(prefers-color-scheme: light)"
          name="theme-color"
        />
        <meta
          content="#000000"
          media="(prefers-color-scheme: dark)"
          name="theme-color"
        />
        {/* Status bar style for iOS */}
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="yes" name="mobile-web-app-capable" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
