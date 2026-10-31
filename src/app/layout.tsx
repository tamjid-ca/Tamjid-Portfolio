import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { buildThemeInitScript } from '@/components/theme/theme-script';
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
