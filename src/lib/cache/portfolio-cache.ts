import { unstable_cache } from 'next/cache';
import { portfolioService } from '@/services/portfolio-service';
import type { PortfolioDataDTO } from '@/types/portfolio';
import {
  PORTFOLIO_CACHE_TAGS,
  revalidatePortfolioCache,
  type PortfolioCacheTag,
} from './revalidate';

export {
  PORTFOLIO_CACHE_TAGS,
  revalidatePortfolioCache,
  type PortfolioCacheTag,
};

const ALL_PUBLIC_TAGS: PortfolioCacheTag[] = [
  PORTFOLIO_CACHE_TAGS.PUBLIC,
  PORTFOLIO_CACHE_TAGS.SETTINGS,
  PORTFOLIO_CACHE_TAGS.PROFILE,
  PORTFOLIO_CACHE_TAGS.ABOUT,
  PORTFOLIO_CACHE_TAGS.RESUME,
  PORTFOLIO_CACHE_TAGS.PROJECTS,
  PORTFOLIO_CACHE_TAGS.BLOG,
];

const cachedPublicPortfolioFetcher = unstable_cache(
  async (): Promise<PortfolioDataDTO> => {
    return portfolioService.getPublicPortfolioData();
  },
  ['tamjid-portfolio-public-v2'],
  {
    revalidate: 300,
    tags: ALL_PUBLIC_TAGS,
  }
);

/**
 * Fetches the public portfolio dataset through Next.js Data Cache (`unstable_cache`),
 * falling back to direct service execution when invoked outside Next.js request/cache runtime
 * (such as Vitest integration tests).
 */
export async function getCachedPublicPortfolioData(): Promise<PortfolioDataDTO> {
  try {
    return await cachedPublicPortfolioFetcher();
  } catch {
    return portfolioService.getPublicPortfolioData();
  }
}
