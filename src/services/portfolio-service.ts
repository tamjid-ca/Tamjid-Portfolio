import { connectToDatabase } from '@/lib/mongodb/connection';
import {
  PORTFOLIO_CACHE_TAGS,
  revalidatePortfolioCache,
} from '@/lib/cache/revalidate';
import {
  achievementInputSchema,
  blogPostInputSchema,
  clientLogoInputSchema,
  educationInputSchema,
  experienceInputSchema,
  mediaAssetInputSchema,
  navigationItemInputSchema,
  profileInputSchema,
  projectInputSchema,
  reorderItemsInputSchema,
  serviceInputSchema,
  siteSettingsInputSchema,
  skillInputSchema,
  socialLinkInputSchema,
  testimonialInputSchema,
  validateAndSanitize,
} from '@/lib/validation/portfolio-schemas';
import {
  achievementRepository,
  blogPostRepository,
  clientLogoRepository,
  educationRepository,
  experienceRepository,
  mediaAssetRepository,
  navigationItemRepository,
  profileRepository,
  projectRepository,
  serviceRepository,
  siteSettingsRepository,
  skillRepository,
  socialLinkRepository,
  testimonialRepository,
} from '@/repositories';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';
import type {
  AchievementDTO,
  BlogPostDTO,
  ClientLogoDTO,
  EducationDTO,
  ExperienceDTO,
  MediaAssetDTO,
  NavigationItemDTO,
  PortfolioDataDTO,
  ProfileDTO,
  ProjectDTO,
  ServiceDTO,
  SiteSettingsDTO,
  SkillDTO,
  SocialLinkDTO,
  TestimonialDTO,
} from '@/types/portfolio';

export class MediaAssetInUseError extends Error {
  public readonly references: string[];

  constructor(publicId: string, references: string[]) {
    super(
      `Cannot delete media asset "${publicId}" because it is still referenced by: ${references.join(', ')}`
    );
    this.name = 'MediaAssetInUseError';
    this.references = references;
  }
}

const CANONICAL_V1_CATEGORIES = [
  'All',
  'Web design',
  'Applications',
  'Web development',
];

export function deriveProjectCategories(projects: ProjectDTO[]): string[] {
  const seen = new Set<string>(['all']);
  const result: string[] = ['All'];

  for (const canonical of CANONICAL_V1_CATEGORIES.slice(1)) {
    const lower = canonical.toLowerCase();
    if (
      projects.some(
        (p) =>
          p.filterCategory.toLowerCase() === lower ||
          p.category.toLowerCase() === lower
      )
    ) {
      seen.add(lower);
      result.push(canonical);
    }
  }

  for (const project of projects) {
    const label = project.category.trim();
    const lower = label.toLowerCase();
    if (label && !seen.has(lower)) {
      seen.add(lower);
      result.push(label);
    }
  }

  return result.length > 1 ? result : [...CANONICAL_V1_CATEGORIES];
}

export function cloneSeedPortfolioData(): PortfolioDataDTO {
  return JSON.parse(JSON.stringify(V1_PORTFOLIO_SEED_DATA)) as PortfolioDataDTO;
}

export const portfolioService = {
  async getPublicPortfolioData(): Promise<PortfolioDataDTO> {
    const conn = await connectToDatabase({ strict: false });
    if (!conn) {
      return cloneSeedPortfolioData();
    }

    try {
      const [
        siteSettings,
        profile,
        socialLinks,
        navigationItems,
        services,
        testimonials,
        clients,
        education,
        experience,
        skills,
        achievements,
        projects,
        blogPosts,
      ] = await Promise.all([
        siteSettingsRepository.get(),
        profileRepository.get(),
        socialLinkRepository.findPublic(),
        navigationItemRepository.findPublic(),
        serviceRepository.findPublic(),
        testimonialRepository.findPublic(),
        clientLogoRepository.findPublic(),
        educationRepository.findPublic(),
        experienceRepository.findPublic(),
        skillRepository.findPublic(),
        achievementRepository.findPublic(),
        projectRepository.findPublic(),
        blogPostRepository.findPublic(),
      ]);

      if (!siteSettings || !profile) {
        return cloneSeedPortfolioData();
      }

      return {
        siteSettings,
        profile,
        socialLinks,
        navigationItems:
          navigationItems.length > 0
            ? navigationItems
            : cloneSeedPortfolioData().navigationItems,
        services,
        testimonials,
        clients,
        education,
        experience,
        skills,
        achievements,
        projects,
        projectCategories: deriveProjectCategories(projects),
        blogPosts,
      };
    } catch {
      return cloneSeedPortfolioData();
    }
  },

  async getAdminPortfolioData(): Promise<PortfolioDataDTO> {
    const conn = await connectToDatabase({ strict: false });
    if (!conn) {
      return cloneSeedPortfolioData();
    }

    const [
      siteSettings,
      profile,
      socialLinks,
      navigationItems,
      services,
      testimonials,
      clients,
      education,
      experience,
      skills,
      achievements,
      projects,
      blogPosts,
    ] = await Promise.all([
      siteSettingsRepository.get(),
      profileRepository.get(),
      socialLinkRepository.findAll(),
      navigationItemRepository.findAll(),
      serviceRepository.findAll(),
      testimonialRepository.findAll(),
      clientLogoRepository.findAll(),
      educationRepository.findAll(),
      experienceRepository.findAll(),
      skillRepository.findAll(),
      achievementRepository.findAll(),
      projectRepository.findAll(),
      blogPostRepository.findAll(),
    ]);

    const fallback = cloneSeedPortfolioData();

    return {
      siteSettings: siteSettings ?? fallback.siteSettings,
      profile: profile ?? fallback.profile,
      socialLinks,
      navigationItems,
      services,
      testimonials,
      clients,
      education,
      experience,
      skills,
      achievements,
      projects,
      projectCategories: deriveProjectCategories(projects),
      blogPosts,
    };
  },

  async updateSiteSettings(rawInput: unknown): Promise<SiteSettingsDTO> {
    const validated = validateAndSanitize(siteSettingsInputSchema, rawInput);
    const updated = await siteSettingsRepository.upsert(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.SETTINGS]);
    return updated;
  },

  async updateProfile(rawInput: unknown): Promise<ProfileDTO> {
    const validated = validateAndSanitize(profileInputSchema, rawInput);
    const updated = await profileRepository.upsert(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROFILE]);
    return updated;
  },

  async createSocialLink(rawInput: unknown): Promise<SocialLinkDTO> {
    const validated = validateAndSanitize(socialLinkInputSchema, rawInput);
    const created = await socialLinkRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROFILE]);
    return created;
  },

  async updateSocialLink(
    id: string,
    rawInput: unknown
  ): Promise<SocialLinkDTO | null> {
    const validated = validateAndSanitize(
      socialLinkInputSchema.partial(),
      rawInput
    );
    const updated = await socialLinkRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROFILE]);
    return updated;
  },

  async deleteSocialLink(id: string): Promise<boolean> {
    const deleted = await socialLinkRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROFILE]);
    }
    return deleted;
  },

  async createNavigationItem(rawInput: unknown): Promise<NavigationItemDTO> {
    const validated = validateAndSanitize(navigationItemInputSchema, rawInput);
    const created = await navigationItemRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.SETTINGS]);
    return created;
  },

  async updateNavigationItem(
    id: string,
    rawInput: unknown
  ): Promise<NavigationItemDTO | null> {
    const validated = validateAndSanitize(
      navigationItemInputSchema.partial(),
      rawInput
    );
    const updated = await navigationItemRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.SETTINGS]);
    return updated;
  },

  async deleteNavigationItem(id: string): Promise<boolean> {
    const deleted = await navigationItemRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.SETTINGS]);
    }
    return deleted;
  },

  async createService(rawInput: unknown): Promise<ServiceDTO> {
    const validated = validateAndSanitize(serviceInputSchema, rawInput);
    const created = await serviceRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    return created;
  },

  async updateService(
    id: string,
    rawInput: unknown
  ): Promise<ServiceDTO | null> {
    const validated = validateAndSanitize(
      serviceInputSchema.partial(),
      rawInput
    );
    const updated = await serviceRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    return updated;
  },

  async deleteService(id: string): Promise<boolean> {
    const deleted = await serviceRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    }
    return deleted;
  },

  async createTestimonial(rawInput: unknown): Promise<TestimonialDTO> {
    const validated = validateAndSanitize(testimonialInputSchema, rawInput);
    const created = await testimonialRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    return created;
  },

  async updateTestimonial(
    id: string,
    rawInput: unknown
  ): Promise<TestimonialDTO | null> {
    const validated = validateAndSanitize(
      testimonialInputSchema.partial(),
      rawInput
    );
    const updated = await testimonialRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    return updated;
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    const deleted = await testimonialRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    }
    return deleted;
  },

  async createClientLogo(rawInput: unknown): Promise<ClientLogoDTO> {
    const validated = validateAndSanitize(clientLogoInputSchema, rawInput);
    const created = await clientLogoRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    return created;
  },

  async updateClientLogo(
    id: string,
    rawInput: unknown
  ): Promise<ClientLogoDTO | null> {
    const validated = validateAndSanitize(
      clientLogoInputSchema.partial(),
      rawInput
    );
    const updated = await clientLogoRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    return updated;
  },

  async deleteClientLogo(id: string): Promise<boolean> {
    const deleted = await clientLogoRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.ABOUT]);
    }
    return deleted;
  },

  async createEducation(rawInput: unknown): Promise<EducationDTO> {
    const validated = validateAndSanitize(educationInputSchema, rawInput);
    const created = await educationRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return created;
  },

  async updateEducation(
    id: string,
    rawInput: unknown
  ): Promise<EducationDTO | null> {
    const validated = validateAndSanitize(
      educationInputSchema.partial(),
      rawInput
    );
    const updated = await educationRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return updated;
  },

  async deleteEducation(id: string): Promise<boolean> {
    const deleted = await educationRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    }
    return deleted;
  },

  async createExperience(rawInput: unknown): Promise<ExperienceDTO> {
    const validated = validateAndSanitize(experienceInputSchema, rawInput);
    const created = await experienceRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return created;
  },

  async updateExperience(
    id: string,
    rawInput: unknown
  ): Promise<ExperienceDTO | null> {
    const validated = validateAndSanitize(
      experienceInputSchema.partial(),
      rawInput
    );
    const updated = await experienceRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return updated;
  },

  async deleteExperience(id: string): Promise<boolean> {
    const deleted = await experienceRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    }
    return deleted;
  },

  async createSkill(rawInput: unknown): Promise<SkillDTO> {
    const validated = validateAndSanitize(skillInputSchema, rawInput);
    const created = await skillRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return created;
  },

  async updateSkill(id: string, rawInput: unknown): Promise<SkillDTO | null> {
    const validated = validateAndSanitize(skillInputSchema.partial(), rawInput);
    const updated = await skillRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return updated;
  },

  async deleteSkill(id: string): Promise<boolean> {
    const deleted = await skillRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    }
    return deleted;
  },

  async createAchievement(rawInput: unknown): Promise<AchievementDTO> {
    const validated = validateAndSanitize(achievementInputSchema, rawInput);
    const created = await achievementRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return created;
  },

  async updateAchievement(
    id: string,
    rawInput: unknown
  ): Promise<AchievementDTO | null> {
    const validated = validateAndSanitize(
      achievementInputSchema.partial(),
      rawInput
    );
    const updated = await achievementRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    return updated;
  },

  async deleteAchievement(id: string): Promise<boolean> {
    const deleted = await achievementRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.RESUME]);
    }
    return deleted;
  },

  async createProject(rawInput: unknown): Promise<ProjectDTO> {
    const validated = validateAndSanitize(projectInputSchema, rawInput);
    const created = await projectRepository.create({
      ...validated,
      filterCategory: validated.filterCategory.toLowerCase(),
    });
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROJECTS]);
    return created;
  },

  async updateProject(
    id: string,
    rawInput: unknown
  ): Promise<ProjectDTO | null> {
    const validated = validateAndSanitize(
      projectInputSchema.partial(),
      rawInput
    );
    if (validated.filterCategory) {
      validated.filterCategory = validated.filterCategory.toLowerCase();
    }
    const updated = await projectRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROJECTS]);
    return updated;
  },

  async deleteProject(id: string): Promise<boolean> {
    const deleted = await projectRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROJECTS]);
    }
    return deleted;
  },

  async reorderProjects(rawInput: unknown): Promise<void> {
    const { orderedIds } = validateAndSanitize(
      reorderItemsInputSchema,
      rawInput
    );
    await projectRepository.reorder(orderedIds);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.PROJECTS]);
  },

  async reorderCollection(
    collection:
      | 'socialLinks'
      | 'navigationItems'
      | 'services'
      | 'testimonials'
      | 'clients'
      | 'education'
      | 'experience'
      | 'skills'
      | 'achievements'
      | 'projects'
      | 'blogPosts',
    rawInput: unknown
  ): Promise<void> {
    const { orderedIds } = validateAndSanitize(
      reorderItemsInputSchema,
      rawInput
    );
    const repoMap = {
      socialLinks: socialLinkRepository,
      navigationItems: navigationItemRepository,
      services: serviceRepository,
      testimonials: testimonialRepository,
      clients: clientLogoRepository,
      education: educationRepository,
      experience: experienceRepository,
      skills: skillRepository,
      achievements: achievementRepository,
      projects: projectRepository,
      blogPosts: blogPostRepository,
    } as const;

    await repoMap[collection].reorder(orderedIds);
    revalidatePortfolioCache();
  },

  async createBlogPost(rawInput: unknown): Promise<BlogPostDTO> {
    const validated = validateAndSanitize(blogPostInputSchema, rawInput);
    const created = await blogPostRepository.create(validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.BLOG]);
    return created;
  },

  async updateBlogPost(
    id: string,
    rawInput: unknown
  ): Promise<BlogPostDTO | null> {
    const validated = validateAndSanitize(
      blogPostInputSchema.partial(),
      rawInput
    );
    const updated = await blogPostRepository.updateById(id, validated);
    revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.BLOG]);
    return updated;
  },

  async deleteBlogPost(id: string): Promise<boolean> {
    const deleted = await blogPostRepository.deleteById(id);
    if (deleted) {
      revalidatePortfolioCache([PORTFOLIO_CACHE_TAGS.BLOG]);
    }
    return deleted;
  },

  async registerMediaAsset(rawInput: unknown): Promise<MediaAssetDTO> {
    const validated = validateAndSanitize(mediaAssetInputSchema, rawInput);
    return mediaAssetRepository.upsertByPublicId(validated);
  },

  async deleteMediaAssetSafely(publicId: string): Promise<boolean> {
    const cleanedId = publicId.trim();
    if (!cleanedId) {
      return false;
    }
    const references =
      await mediaAssetRepository.findAssetReferences(cleanedId);
    if (references.length > 0) {
      throw new MediaAssetInUseError(cleanedId, references);
    }
    return mediaAssetRepository.deleteByPublicId(cleanedId);
  },
};
