import { connectToDatabase } from '@/lib/mongodb/connection';
import {
  achievementRepository,
  blogPostRepository,
  clientLogoRepository,
  educationRepository,
  experienceRepository,
  navigationItemRepository,
  profileRepository,
  projectRepository,
  serviceRepository,
  siteSettingsRepository,
  skillRepository,
  socialLinkRepository,
  testimonialRepository,
} from '@/repositories';
import { adminAuthService } from '@/services/auth-service';
import { V1_PORTFOLIO_SEED_DATA } from './v1-portfolio-data';

export interface SeedResultSummary {
  siteSettingsSeeded: boolean;
  profileSeeded: boolean;
  counts: {
    socialLinks: number;
    navigationItems: number;
    services: number;
    testimonials: number;
    clients: number;
    education: number;
    experience: number;
    skills: number;
    achievements: number;
    projects: number;
    blogPosts: number;
  };
}

function stripId<T extends { id: string }>(item: T): Omit<T, 'id'> {
  const copy = { ...item };
  delete (copy as Partial<T>).id;
  return copy;
}

/**
 * Idempotently seeds all V1 Tamjid Portfolio entities into MongoDB.
 * Safe to run repeatedly without duplicating or fabricating records.
 */
export async function seedDatabase(options?: {
  uri?: string;
}): Promise<SeedResultSummary> {
  await connectToDatabase({ uri: options?.uri, strict: true });

  await siteSettingsRepository.upsert(
    stripId(V1_PORTFOLIO_SEED_DATA.siteSettings)
  );
  await profileRepository.upsert(stripId(V1_PORTFOLIO_SEED_DATA.profile));

  for (const item of V1_PORTFOLIO_SEED_DATA.socialLinks) {
    await socialLinkRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.navigationItems) {
    await navigationItemRepository.upsertBySeedKey(item.id, stripId(item), {
      slug: item.slug,
    });
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.services) {
    await serviceRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.testimonials) {
    await testimonialRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.clients) {
    await clientLogoRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.education) {
    await educationRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.experience) {
    await experienceRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.skills) {
    await skillRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.achievements) {
    await achievementRepository.upsertBySeedKey(item.id, stripId(item));
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.projects) {
    await projectRepository.upsertBySeedKey(item.id, stripId(item), {
      slug: item.slug,
    });
  }

  for (const item of V1_PORTFOLIO_SEED_DATA.blogPosts) {
    await blogPostRepository.upsertBySeedKey(item.id, stripId(item), {
      slug: item.slug,
    });
  }

  await adminAuthService.ensureInitialAdminUser();

  return {
    siteSettingsSeeded: true,
    profileSeeded: true,
    counts: {
      socialLinks: V1_PORTFOLIO_SEED_DATA.socialLinks.length,
      navigationItems: V1_PORTFOLIO_SEED_DATA.navigationItems.length,
      services: V1_PORTFOLIO_SEED_DATA.services.length,
      testimonials: V1_PORTFOLIO_SEED_DATA.testimonials.length,
      clients: V1_PORTFOLIO_SEED_DATA.clients.length,
      education: V1_PORTFOLIO_SEED_DATA.education.length,
      experience: V1_PORTFOLIO_SEED_DATA.experience.length,
      skills: V1_PORTFOLIO_SEED_DATA.skills.length,
      achievements: V1_PORTFOLIO_SEED_DATA.achievements.length,
      projects: V1_PORTFOLIO_SEED_DATA.projects.length,
      blogPosts: V1_PORTFOLIO_SEED_DATA.blogPosts.length,
    },
  };
}
