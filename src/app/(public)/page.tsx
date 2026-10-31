import React from 'react';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { getCachedPublicPortfolioData } from '@/lib/cache/portfolio-cache';

export default async function HomePage() {
  const data = await getCachedPublicPortfolioData();
  return <PortfolioShell data={data} />;
}
