import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Special_Elite, Oswald } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { STUDIO_NAME, STUDIO_TAGLINE } from '@/lib/constants';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-special',
  display: 'swap',
});

const oswald = Oswald({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `InkQuest | ${STUDIO_NAME}`,
    template: `%s | InkQuest`,
  },
  description: `${STUDIO_TAGLINE} Hunt QR codes around Skopje. Unlock tattoo designs. Claim real discounts at ${STUDIO_NAME}.`,
  applicationName: 'InkQuest',
  keywords: ['tattoo', 'Skopje', 'QR code', 'ink', 'gamification', 'Macedonia', 'Tattoo Skin Art'],
  authors: [{ name: STUDIO_NAME }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'InkQuest',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'InkQuest',
    title: `InkQuest | ${STUDIO_NAME}`,
    description: STUDIO_TAGLINE,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${specialElite.variable} ${oswald.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
      </head>
      <body className="bg-ink-950 text-ink-100 antialiased overscroll-none">
        {children}
      </body>
    </html>
  );
}
