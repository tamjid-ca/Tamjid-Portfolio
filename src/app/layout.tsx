import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { getCachedPublicPortfolioData } from '@/lib/cache/portfolio-cache';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const { siteSettings } = await getCachedPublicPortfolioData();

  return {
    title: siteSettings.siteTitle,
    description: siteSettings.siteDescription,
    keywords: siteSettings.seoKeywords,
    icons: {
      icon: siteSettings.faviconUrl,
      shortcut: siteSettings.faviconUrl,
    },
    openGraph: {
      title: siteSettings.siteTitle,
      description: siteSettings.siteDescription,
      type: 'website',
      ...(siteSettings.ogImageUrl
        ? { images: [{ url: siteSettings.ogImageUrl }] }
        : {}),
    },
  };
}

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
