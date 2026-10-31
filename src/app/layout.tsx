import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: V1_PORTFOLIO_SEED_DATA.siteSettings.siteTitle,
  description: V1_PORTFOLIO_SEED_DATA.siteSettings.siteDescription,
  keywords: V1_PORTFOLIO_SEED_DATA.siteSettings.seoKeywords,
  icons: {
    icon: V1_PORTFOLIO_SEED_DATA.siteSettings.faviconUrl,
    shortcut: V1_PORTFOLIO_SEED_DATA.siteSettings.faviconUrl,
  },
  openGraph: {
    title: V1_PORTFOLIO_SEED_DATA.siteSettings.siteTitle,
    description: V1_PORTFOLIO_SEED_DATA.siteSettings.siteDescription,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
