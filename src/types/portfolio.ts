export type IonIconName =
  | 'chevron-down'
  | 'mail-outline'
  | 'phone-portrait-outline'
  | 'calendar-outline'
  | 'location-outline'
  | 'logo-github'
  | 'logo-linkedin'
  | 'logo-facebook'
  | 'close-outline'
  | 'book-outline'
  | 'eye-outline'
  | 'paper-plane';

export type PortfolioPageSlug =
  | 'about'
  | 'resume'
  | 'portfolio'
  | 'blog'
  | 'contact';

export type PublicationStatus = 'published' | 'draft';

export interface SiteSettingsDTO {
  id: string;
  siteTitle: string;
  siteDescription: string;
  faviconUrl: string;
  faviconPublicId?: string;
  defaultTheme: 'dark' | 'light';
  enableThemeToggle: boolean;
  enableThreeD: boolean;
  mapEmbedUrl: string;
  contactFormTitle: string;
  contactSubmitLabel: string;
  googleScriptWebhookUrl?: string;
  seoKeywords: string[];
  ogImageUrl?: string;
}

export interface ProfileDTO {
  id: string;
  fullName: string;
  professionalTitle: string;
  avatarUrl: string;
  avatarPublicId?: string;
  avatarAlt: string;
  email: string;
  phone: string;
  phoneHref: string;
  birthdayDisplay: string;
  birthdayDateTime: string;
  location: string;
  showContactsLabel: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  servicesHeading: string;
  testimonialsHeading: string;
  clientsHeading: string;
  resumeHeading: string;
  educationHeading: string;
  experienceHeading: string;
  skillsHeading: string;
  portfolioHeading: string;
  blogHeading: string;
  contactHeading: string;
}

export interface SocialLinkDTO {
  id: string;
  platform: string;
  url: string;
  iconName: IonIconName;
  displayOrder: number;
  visible: boolean;
}

export interface NavigationItemDTO {
  id: string;
  label: string;
  slug: PortfolioPageSlug;
  displayOrder: number;
  visible: boolean;
  isDefault: boolean;
}

export interface ServiceDTO {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  iconPublicId?: string;
  iconAlt: string;
  displayOrder: number;
  visible: boolean;
}

export interface TestimonialDTO {
  id: string;
  clientName: string;
  company?: string;
  designation?: string;
  avatarUrl: string;
  avatarPublicId?: string;
  avatarAlt: string;
  text: string;
  dateDisplay: string;
  dateISO: string;
  displayOrder: number;
  status: PublicationStatus;
}

export interface ClientLogoDTO {
  id: string;
  name: string;
  logoUrl: string;
  logoPublicId?: string;
  logoAlt: string;
  websiteUrl: string;
  displayOrder: number;
  visible: boolean;
}

export interface EducationDTO {
  id: string;
  institution: string;
  degree?: string;
  department?: string;
  dateRange: string;
  description: string;
  logoUrl?: string;
  logoPublicId?: string;
  displayOrder: number;
  visible: boolean;
}

export interface ExperienceDTO {
  id: string;
  position: string;
  company?: string;
  employmentType?: string;
  location?: string;
  dateRange: string;
  isCurrent?: boolean;
  description: string;
  responsibilities?: string[];
  technologies?: string[];
  logoUrl?: string;
  logoPublicId?: string;
  displayOrder: number;
  visible: boolean;
}

export interface SkillDTO {
  id: string;
  name: string;
  category: string;
  percentageValue: number;
  percentageLabel: string;
  iconName?: string;
  displayOrder: number;
  visible: boolean;
}

export interface AchievementDTO {
  id: string;
  title: string;
  issuer: string;
  dateDisplay: string;
  description: string;
  certificateImageUrl?: string;
  certificatePublicId?: string;
  verificationUrl?: string;
  displayOrder: number;
  status: PublicationStatus;
}

export interface ProjectDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  filterCategory: string;
  shortDescription?: string;
  fullDescription?: string;
  thumbnailUrl: string;
  thumbnailPublicId?: string;
  thumbnailAlt: string;
  gallery?: string[];
  technologies?: string[];
  liveUrl: string;
  githubUrl?: string;
  featured: boolean;
  displayOrder: number;
  status: PublicationStatus;
}

export interface BlogPostDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedDateDisplay: string;
  publishedDateISO: string;
  excerpt: string;
  content?: string;
  bannerUrl: string;
  bannerPublicId?: string;
  bannerAlt: string;
  externalUrl: string;
  displayOrder: number;
  status: PublicationStatus;
}

export interface ContactMessageDTO {
  id: string;
  fullname: string;
  email: string;
  message: string;
  isRead: boolean;
  ipHash?: string;
  createdAt: string;
}

export interface MediaAssetDTO {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  folder: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  altText: string;
  createdAt: string;
}

export interface PortfolioDataDTO {
  siteSettings: SiteSettingsDTO;
  profile: ProfileDTO;
  socialLinks: SocialLinkDTO[];
  navigationItems: NavigationItemDTO[];
  services: ServiceDTO[];
  testimonials: TestimonialDTO[];
  clients: ClientLogoDTO[];
  education: EducationDTO[];
  experience: ExperienceDTO[];
  skills: SkillDTO[];
  achievements: AchievementDTO[];
  projects: ProjectDTO[];
  projectCategories: string[];
  blogPosts: BlogPostDTO[];
}
