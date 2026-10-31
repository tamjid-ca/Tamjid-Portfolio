import React from 'react';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';

export default function HomePage() {
  return <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />;
}
