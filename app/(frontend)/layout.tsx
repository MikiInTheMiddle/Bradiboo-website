import {Suspense} from 'react';
import {NavigationProgress} from '@/components/navigation-progress';
import {CookieConsent} from '@/components/cookie-consent';
import type { Metadata } from 'next';
import {getSiteSettings} from '@/lib/cms';
import {siteIcons} from '@/lib/site-icons';
import './globals.css';
import './home.css';

export async function generateMetadata():Promise<Metadata>{
 const settings=await getSiteSettings();
 const favicon=typeof settings.favicon==='object'?settings.favicon:undefined;
 return {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')),
  title: 'Bradiboo',
  description: 'Il mondo di Bradiboo: personaggi, storie e video.',
  icons:siteIcons(favicon),
 };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body><Suspense fallback={null}><NavigationProgress/></Suspense><CookieConsent>{children}</CookieConsent></body>
    </html>
  );
}
