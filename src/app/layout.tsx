import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ThemeToggle from '@/components/ui/theme-toggle';

export const metadata: Metadata = {
  title: 'Township Trader Toolkit',
  description: 'A digital toolkit for small-scale business owners.',
};

import ShopProviderWrapper from './ShopProviderWrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#50C878" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ShopProviderWrapper>
          {children}
          <ThemeToggle />
          <Toaster />
        </ShopProviderWrapper>
      </body>
    </html>
  );
}
