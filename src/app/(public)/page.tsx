import React from 'react';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { getCachedPublicPortfolioData } from '@/lib/cache/portfolio-cache';
import { buildPortfolioStructuredData } from '@/lib/seo/structured-data';

export default async function HomePage() {
  const data = await getCachedPublicPortfolioData();
  const structuredData = buildPortfolioStructuredData(data);

  return (
    <>
      <script
        type="application/ld+json"
        data-json-ld="portfolio"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <PortfolioShell data={data} />
    </>
  );
}
