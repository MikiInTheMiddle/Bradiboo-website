import {CookieConsent} from '@/components/cookie-consent';
import type { Metadata } from 'next';
import './globals.css';
import './home.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Bradiboo — Structure Wireframe',
  description: 'Prototipo navigabile della struttura del nuovo sito Bradiboo.',
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
