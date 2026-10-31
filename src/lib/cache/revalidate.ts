import { revalidatePath, revalidateTag } from 'next/cache';

export const PORTFOLIO_CACHE_TAGS = {
  PUBLIC: 'portfolio-public',
  SETTINGS: 'portfolio-settings',
  PROFILE: 'portfolio-profile',
  ABOUT: 'portfolio-about',
  RESUME: 'portfolio-resume',
  PROJECTS: 'portfolio-projects',
  BLOG: 'portfolio-blog',
} as const;

export type PortfolioCacheTag =
  (typeof PORTFOLIO_CACHE_TAGS)[keyof typeof PORTFOLIO_CACHE_TAGS];

/**
 * Revalidates public portfolio cache tags and root path (`/`) after Admin CMS mutations.
 */
export function revalidatePortfolioCache(
  extraTags: PortfolioCacheTag[] = []
): { revalidated: boolean; tags: string[] } {
  const tagsToRevalidate = Array.from(
    new Set<string>([PORTFOLIO_CACHE_TAGS.PUBLIC, ...extraTags])
  );

  try {
    for (const tag of tagsToRevalidate) {
      revalidateTag(tag);
    }
    revalidatePath('/');
    return { revalidated: true, tags: tagsToRevalidate };
  } catch {
    // Safe fallback when invoked outside Next.js request context (e.g., CLI or unit tests)
    return { revalidated: false, tags: tagsToRevalidate };
  }
}
