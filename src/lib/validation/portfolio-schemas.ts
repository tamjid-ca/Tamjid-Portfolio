import { z } from 'zod';
import { stripMongoOperators } from '@/lib/security/sanitize';

export const ionIconNameSchema = z.enum([
  'chevron-down',
  'mail-outline',
  'phone-portrait-outline',
  'calendar-outline',
  'location-outline',
  'logo-github',
  'logo-linkedin',
  'logo-facebook',
  'close-outline',
  'book-outline',
  'eye-outline',
  'paper-plane',
  'sunny-outline',
  'moon-outline',
]);

export const portfolioPageSlugSchema = z.enum([
  'about',
  'resume',
  'portfolio',
  'blog',
  'contact',
]);

export const publicationStatusSchema = z.enum(['published', 'draft']);

const safeUrlOrPathSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (val) =>
      val === '' ||
      val === '#' ||
      val.startsWith('/') ||
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('mailto:') ||
      val.startsWith('tel:'),
    {
      message:
        'Must be a valid relative path (/...), anchor (#), or http(s)/mailto/tel URL.',
    }
  );

export const siteSettingsInputSchema = z.object({
  siteTitle: z.string().trim().min(1).max(160),
  siteDescription: z.string().trim().min(1).max(600),
  faviconUrl: safeUrlOrPathSchema,
  faviconPublicId: z.string().trim().max(255).optional(),
  defaultTheme: z.enum(['dark', 'light']).default('dark'),
  enableThemeToggle: z.boolean().default(true),
  enableThreeD: z.boolean().default(true),
  mapEmbedUrl: safeUrlOrPathSchema,
  contactFormTitle: z.string().trim().min(1).max(120),
  contactSubmitLabel: z.string().trim().min(1).max(80),
  googleScriptWebhookUrl: safeUrlOrPathSchema.optional().default(''),
  seoKeywords: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  ogImageUrl: safeUrlOrPathSchema.optional(),
});

export const profileInputSchema = z.object({
  fullName: z.string().trim().min(1).max(140),
  professionalTitle: z.string().trim().min(1).max(140),
  avatarUrl: safeUrlOrPathSchema,
  avatarPublicId: z.string().trim().max(255).optional(),
  avatarAlt: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(1).max(60),
  phoneHref: safeUrlOrPathSchema,
  birthdayDisplay: z.string().trim().min(1).max(80),
  birthdayDateTime: z.string().trim().min(1).max(40),
  location: z.string().trim().min(1).max(120),
  showContactsLabel: z.string().trim().min(1).max(60),
  aboutHeading: z.string().trim().min(1).max(100),
  aboutParagraphs: z.array(z.string().trim().min(1).max(2000)).min(1).max(15),
  servicesHeading: z.string().trim().min(1).max(100),
  testimonialsHeading: z.string().trim().min(1).max(100),
  clientsHeading: z.string().trim().min(1).max(100),
  resumeHeading: z.string().trim().min(1).max(100),
  educationHeading: z.string().trim().min(1).max(100),
  experienceHeading: z.string().trim().min(1).max(100),
  skillsHeading: z.string().trim().min(1).max(100),
  portfolioHeading: z.string().trim().min(1).max(100),
  blogHeading: z.string().trim().min(1).max(100),
  contactHeading: z.string().trim().min(1).max(100),
});

export const socialLinkInputSchema = z.object({
  platform: z.string().trim().min(1).max(80),
  url: safeUrlOrPathSchema,
  iconName: ionIconNameSchema,
  displayOrder: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const navigationItemInputSchema = z.object({
  label: z.string().trim().min(1).max(60),
  slug: portfolioPageSlugSchema,
  displayOrder: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const serviceInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  iconUrl: safeUrlOrPathSchema,
  iconPublicId: z.string().trim().max(255).optional(),
  iconAlt: z.string().trim().min(1).max(120),
  displayOrder: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const testimonialInputSchema = z.object({
  clientName: z.string().trim().min(1).max(120),
  company: z.string().trim().max(120).optional(),
  designation: z.string().trim().max(120).optional(),
  avatarUrl: safeUrlOrPathSchema,
  avatarPublicId: z.string().trim().max(255).optional(),
  avatarAlt: z.string().trim().min(1).max(120),
  text: z.string().trim().min(1).max(2000),
  dateDisplay: z.string().trim().min(1).max(60),
  dateISO: z.string().trim().min(1).max(40),
  displayOrder: z.number().int().min(0).default(0),
  status: publicationStatusSchema.default('published'),
});

export const clientLogoInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  logoUrl: safeUrlOrPathSchema,
  logoPublicId: z.string().trim().max(255).optional(),
  logoAlt: z.string().trim().min(1).max(120),
  websiteUrl: safeUrlOrPathSchema,
  displayOrder: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const educationInputSchema = z.object({
  institution: z.string().trim().max(160),
  degree: z.string().trim().max(160).optional(),
  department: z.string().trim().max(160).optional(),
  dateRange: z.string().trim().max(80),
  description: z.string().trim().max(1200),
  logoUrl: safeUrlOrPathSchema.optional(),
  logoPublicId: z.string().trim().max(255).optional(),
  displayOrder: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const experienceInputSchema = z.object({
  position: z.string().trim().min(1).max(160),
  company: z.string().trim().max(160).optional(),
  employmentType: z.string().trim().max(80).optional(),
  location: z.string().trim().max(120).optional(),
  dateRange: z.string().trim().max(80),
  isCurrent: z.boolean().optional().default(false),
  description: z.string().trim().max(1500).default(''),
  responsibilities: z.array(z.string().trim().max(400)).max(20).optional(),
  technologies: z.array(z.string().trim().max(80)).max(30).optional(),
  logoUrl: safeUrlOrPathSchema.optional(),
  logoPublicId: z.string().trim().max(255).optional(),
  displayOrder: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const skillInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(100),
  percentageValue: z.number().min(0).max(100),
  percentageLabel: z.string().trim().min(1).max(20),
  iconName: z.string().trim().max(80).optional(),
  displayOrder: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const achievementInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  issuer: z.string().trim().min(1).max(160),
  dateDisplay: z.string().trim().min(1).max(80),
  description: z.string().trim().max(1000).default(''),
  certificateImageUrl: safeUrlOrPathSchema.optional(),
  certificatePublicId: z.string().trim().max(255).optional(),
  verificationUrl: safeUrlOrPathSchema.optional(),
  displayOrder: z.number().int().min(0).default(0),
  status: publicationStatusSchema.default('published'),
});

export const projectInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain lowercase letters, numbers, and hyphens.',
    }),
  category: z.string().trim().min(1).max(80),
  filterCategory: z.string().trim().min(1).max(80),
  shortDescription: z.string().trim().max(400).optional(),
  fullDescription: z.string().trim().max(4000).optional(),
  thumbnailUrl: safeUrlOrPathSchema,
  thumbnailPublicId: z.string().trim().max(255).optional(),
  thumbnailAlt: z.string().trim().min(1).max(160),
  gallery: z.array(safeUrlOrPathSchema).max(15).optional(),
  technologies: z.array(z.string().trim().max(80)).max(30).optional(),
  liveUrl: safeUrlOrPathSchema,
  githubUrl: safeUrlOrPathSchema.optional(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  status: publicationStatusSchema.default('published'),
});

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain lowercase letters, numbers, and hyphens.',
    }),
  category: z.string().trim().min(1).max(80),
  publishedDateDisplay: z.string().trim().min(1).max(60),
  publishedDateISO: z.string().trim().min(1).max(40),
  excerpt: z.string().trim().min(1).max(600),
  content: z.string().trim().max(25000).optional(),
  bannerUrl: safeUrlOrPathSchema,
  bannerPublicId: z.string().trim().max(255).optional(),
  bannerAlt: z.string().trim().min(1).max(160),
  externalUrl: safeUrlOrPathSchema,
  displayOrder: z.number().int().min(0).default(0),
  status: publicationStatusSchema.default('published'),
});

export const contactMessageInputSchema = z.object({
  fullname: z.string().trim().min(1, 'Full name is required.').max(140),
  email: z.string().trim().email('Valid email address is required.').max(200),
  message: z.string().trim().min(1, 'Message is required.').max(4000),
});

export const mediaAssetInputSchema = z.object({
  publicId: z.string().trim().min(1).max(255),
  url: safeUrlOrPathSchema,
  secureUrl: safeUrlOrPathSchema,
  folder: z.string().trim().min(1).max(180).default('tamjid-portfolio'),
  resourceType: z.enum(['image', 'video', 'raw']).default('image'),
  format: z.string().trim().min(1).max(40),
  width: z.number().int().nonnegative().optional(),
  height: z.number().int().nonnegative().optional(),
  bytes: z.number().int().nonnegative(),
  altText: z.string().trim().max(200).default(''),
});

export const reorderItemsInputSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1).max(100)).min(1).max(200),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
export type ProfileInput = z.infer<typeof profileInputSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkInputSchema>;
export type NavigationItemInput = z.infer<typeof navigationItemInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
export type ClientLogoInput = z.infer<typeof clientLogoInputSchema>;
export type EducationInput = z.infer<typeof educationInputSchema>;
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
export type SkillInput = z.infer<typeof skillInputSchema>;
export type AchievementInput = z.infer<typeof achievementInputSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageInputSchema>;
export type MediaAssetInput = z.infer<typeof mediaAssetInputSchema>;

/**
 * Strips any MongoDB operator keys (`$`, `.`) from `rawInput` and parses it
 * against the supplied Zod schema.
 */
export function validateAndSanitize<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  rawInput: unknown
): z.output<TSchema> {
  const sanitized = stripMongoOperators(rawInput);
  return schema.parse(sanitized);
}
