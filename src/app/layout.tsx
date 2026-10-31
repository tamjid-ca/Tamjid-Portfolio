import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { buildThemeInitScript } from '@/components/theme/theme-script';
import { getCachedPublicPortfolioData } from '@/lib/cache/portfolio-cache';
import { getCanonicalSiteUrl } from '@/lib/seo/structured-data';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const { siteSettings, profile } = await getCachedPublicPortfolioData();
  const siteUrl = getCanonicalSiteUrl();
  const ogImage = siteSettings.ogImageUrl || profile.avatarUrl;

  return {
    metadataBase: new URL(siteUrl),
    title: siteSettings.siteTitle,
    description: siteSettings.siteDescription,
    keywords: siteSettings.seoKeywords,
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: siteSettings.faviconUrl,
      shortcut: siteSettings.faviconUrl,
    },
    openGraph: {
      title: siteSettings.siteTitle,
      description: siteSettings.siteDescription,
      url: siteUrl,
      siteName: siteSettings.siteTitle,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: siteSettings.siteTitle,
      description: siteSettings.siteDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { siteSettings } = await getCachedPublicPortfolioData();

  return (
    <html
      lang="en"
      className={poppins.variable}
      data-theme={siteSettings.defaultTheme}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: buildThemeInitScript(
              siteSettings.defaultTheme,
              siteSettings.enableThemeToggle
            ),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
