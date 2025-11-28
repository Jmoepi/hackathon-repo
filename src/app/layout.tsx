import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { ReCaptchaProvider } from '@/components/recaptcha-provider';

export const metadata: Metadata = {
  title: 'TradaHub | Your Business, Your Pocket',
  description: 'The all-in-one business toolkit for entrepreneurs. Manage inventory, accept digital payments, track customers, and grow your business — anywhere.',
  keywords: ['small business', 'digital payments', 'inventory management', 'POS system', 'entrepreneur tools', 'Africa'],
  authors: [{ name: 'TradaHub Team' }],
  openGraph: {
    title: 'TradaHub | Your Business, Your Pocket',
    description: 'The all-in-one business toolkit for entrepreneurs everywhere.',
    type: 'website',
  },
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
        <meta name="theme-color" content="#10b981" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ReCaptchaProvider>
              <ShopProviderWrapper>
                {children}
                <Toaster />
              </ShopProviderWrapper>
            </ReCaptchaProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
