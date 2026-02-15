import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AnalyticsScripts } from '@/components/shared/analytics-scripts';
import { StructuredData } from '@/components/shared/structured-data';
import './globals.css';

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Solana Quest - Your Adventure into Solana Development',
    template: '%s | Solana Quest',
  },
  description:
    'An RPG-themed learning platform that transforms Solana development education into an epic quest. Level up your skills, earn on-chain credentials, and join the builder community.',
  keywords: [
    'Solana',
    'blockchain',
    'development',
    'learning',
    'web3',
    'Rust',
    'Anchor',
    'DeFi',
    'NFT',
    'education',
  ],
  authors: [{ name: 'Superteam Brazil' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Solana Quest',
  },
  openGraph: {
    title: 'Solana Quest - Your Adventure into Solana Development',
    description:
      'Level up your Solana development skills through interactive quests, earn XP, and collect on-chain credentials.',
    type: 'website',
    siteName: 'Solana Quest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solana Quest',
    description: 'Your RPG adventure into Solana development',
  },
};

export const viewport: Viewport = {
  themeColor: '#9945FF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          {/* Skip to content link for accessibility (Lighthouse a11y) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
          >
            Skip to main content
          </a>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1" role="main">{children}</main>
            <Footer />
          </div>
          <AnalyticsScripts />
        </Providers>
      </body>
    </html>
  );
}
