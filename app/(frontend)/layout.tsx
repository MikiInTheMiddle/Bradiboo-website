import {CookieConsent} from '@/components/cookie-consent';
import type { Metadata } from 'next';
import './globals.css';
import './home.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')),
  title: 'Bradiboo',
  description: 'Il mondo di Bradiboo: personaggi, storie e video.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body><CookieConsent>{children}</CookieConsent></body>
    </html>
  );
}
