import { connectToDatabase } from '@/lib/mongodb/connection';
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
    await connectToDatabase({ strict: true });

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
    return siteSettingsRepository.upsert(validated);
  },

  async updateProfile(rawInput: unknown): Promise<ProfileDTO> {
    const validated = validateAndSanitize(profileInputSchema, rawInput);
    return profileRepository.upsert(validated);
  },

  async createSocialLink(rawInput: unknown): Promise<SocialLinkDTO> {
    const validated = validateAndSanitize(socialLinkInputSchema, rawInput);
    return socialLinkRepository.create(validated);
  },

  async updateSocialLink(
    id: string,
    rawInput: unknown
  ): Promise<SocialLinkDTO | null> {
    const validated = validateAndSanitize(
      socialLinkInputSchema.partial(),
      rawInput
    );
    return socialLinkRepository.updateById(id, validated);
  },

  async deleteSocialLink(id: string): Promise<boolean> {
    return socialLinkRepository.deleteById(id);
  },

  async createNavigationItem(rawInput: unknown): Promise<NavigationItemDTO> {
    const validated = validateAndSanitize(navigationItemInputSchema, rawInput);
    return navigationItemRepository.create(validated);
  },

  async updateNavigationItem(
    id: string,
    rawInput: unknown
  ): Promise<NavigationItemDTO | null> {
    const validated = validateAndSanitize(
      navigationItemInputSchema.partial(),
      rawInput
    );
    return navigationItemRepository.updateById(id, validated);
  },

  async createService(rawInput: unknown): Promise<ServiceDTO> {
    const validated = validateAndSanitize(serviceInputSchema, rawInput);
    return serviceRepository.create(validated);
  },

  async updateService(
    id: string,
    rawInput: unknown
  ): Promise<ServiceDTO | null> {
    const validated = validateAndSanitize(
      serviceInputSchema.partial(),
      rawInput
    );
    return serviceRepository.updateById(id, validated);
  },

  async deleteService(id: string): Promise<boolean> {
    return serviceRepository.deleteById(id);
  },

  async createTestimonial(rawInput: unknown): Promise<TestimonialDTO> {
    const validated = validateAndSanitize(testimonialInputSchema, rawInput);
    return testimonialRepository.create(validated);
  },

  async updateTestimonial(
    id: string,
    rawInput: unknown
  ): Promise<TestimonialDTO | null> {
    const validated = validateAndSanitize(
      testimonialInputSchema.partial(),
      rawInput
    );
    return testimonialRepository.updateById(id, validated);
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    return testimonialRepository.deleteById(id);
  },

  async createClientLogo(rawInput: unknown): Promise<ClientLogoDTO> {
    const validated = validateAndSanitize(clientLogoInputSchema, rawInput);
    return clientLogoRepository.create(validated);
  },

  async updateClientLogo(
    id: string,
    rawInput: unknown
  ): Promise<ClientLogoDTO | null> {
    const validated = validateAndSanitize(
      clientLogoInputSchema.partial(),
      rawInput
    );
    return clientLogoRepository.updateById(id, validated);
  },

  async deleteClientLogo(id: string): Promise<boolean> {
    return clientLogoRepository.deleteById(id);
  },

  async createEducation(rawInput: unknown): Promise<EducationDTO> {
    const validated = validateAndSanitize(educationInputSchema, rawInput);
    return educationRepository.create(validated);
  },

  async updateEducation(
    id: string,
    rawInput: unknown
  ): Promise<EducationDTO | null> {
    const validated = validateAndSanitize(
      educationInputSchema.partial(),
      rawInput
    );
    return educationRepository.updateById(id, validated);
  },

  async deleteEducation(id: string): Promise<boolean> {
    return educationRepository.deleteById(id);
  },

  async createExperience(rawInput: unknown): Promise<ExperienceDTO> {
    const validated = validateAndSanitize(experienceInputSchema, rawInput);
    return experienceRepository.create(validated);
  },

  async updateExperience(
    id: string,
    rawInput: unknown
  ): Promise<ExperienceDTO | null> {
    const validated = validateAndSanitize(
      experienceInputSchema.partial(),
      rawInput
    );
    return experienceRepository.updateById(id, validated);
  },

  async deleteExperience(id: string): Promise<boolean> {
    return experienceRepository.deleteById(id);
  },

  async createSkill(rawInput: unknown): Promise<SkillDTO> {
    const validated = validateAndSanitize(skillInputSchema, rawInput);
    return skillRepository.create(validated);
  },

  async updateSkill(id: string, rawInput: unknown): Promise<SkillDTO | null> {
    const validated = validateAndSanitize(skillInputSchema.partial(), rawInput);
    return skillRepository.updateById(id, validated);
  },

  async deleteSkill(id: string): Promise<boolean> {
    return skillRepository.deleteById(id);
  },

  async createAchievement(rawInput: unknown): Promise<AchievementDTO> {
    const validated = validateAndSanitize(achievementInputSchema, rawInput);
    return achievementRepository.create(validated);
  },

  async updateAchievement(
    id: string,
    rawInput: unknown
  ): Promise<AchievementDTO | null> {
    const validated = validateAndSanitize(
      achievementInputSchema.partial(),
      rawInput
    );
    return achievementRepository.updateById(id, validated);
  },

  async deleteAchievement(id: string): Promise<boolean> {
    return achievementRepository.deleteById(id);
  },

  async createProject(rawInput: unknown): Promise<ProjectDTO> {
    const validated = validateAndSanitize(projectInputSchema, rawInput);
    return projectRepository.create({
      ...validated,
      filterCategory: validated.filterCategory.toLowerCase(),
    });
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
    return projectRepository.updateById(id, validated);
  },

  async deleteProject(id: string): Promise<boolean> {
    return projectRepository.deleteById(id);
  },

  async reorderProjects(rawInput: unknown): Promise<void> {
    const { orderedIds } = validateAndSanitize(
      reorderItemsInputSchema,
      rawInput
    );
    await projectRepository.reorder(orderedIds);
  },

  async createBlogPost(rawInput: unknown): Promise<BlogPostDTO> {
    const validated = validateAndSanitize(blogPostInputSchema, rawInput);
    return blogPostRepository.create(validated);
  },

  async updateBlogPost(
    id: string,
    rawInput: unknown
  ): Promise<BlogPostDTO | null> {
    const validated = validateAndSanitize(
      blogPostInputSchema.partial(),
      rawInput
    );
    return blogPostRepository.updateById(id, validated);
  },

  async deleteBlogPost(id: string): Promise<boolean> {
    return blogPostRepository.deleteById(id);
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
