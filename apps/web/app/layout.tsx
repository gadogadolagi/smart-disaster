import { Toaster } from '@/components/ui/sonner';
import { InstallPrompt, OfflineIndicator } from '@/components/pwa';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Providers from './providers';
import { PWARegister } from './pwa-register';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'UHTP Smart-Disaster',
  description: 'Sistem cerdas untuk pelaporan dan monitoring bencana alam',
  icons: '././uhtpsmartdisaster.jpeg',
  manifest: '/manifest.webmanifest',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Disaster',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Smart Disaster" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          {children}
          <Toaster />
          <InstallPrompt />
          <OfflineIndicator />
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}
