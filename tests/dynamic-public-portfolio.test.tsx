import mongoose from 'mongoose';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/(public)/page';
import { generateMetadata } from '@/app/layout';
import { GET as getPublicPortfolioRoute } from '@/app/api/public/portfolio/route';
import {
  PORTFOLIO_CACHE_TAGS,
  revalidatePortfolioCache,
} from '@/lib/cache/portfolio-cache';
import { disconnectFromDatabase } from '@/lib/mongodb/connection';
import {
  AchievementModel,
  BlogPostModel,
  ClientLogoModel,
  ContactMessageModel,
  EducationModel,
  ExperienceModel,
  MediaAssetModel,
  NavigationItemModel,
  ProfileModel,
  ProjectModel,
  ServiceModel,
  SiteSettingsModel,
  SkillModel,
  SocialLinkModel,
  TestimonialModel,
} from '@/models';
import { seedDatabase } from '@/seed/seed-database';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';
import { portfolioService } from '@/services/portfolio-service';

type StoredRecord = Record<string, unknown> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

function matchesFilter(
  record: StoredRecord,
  filter: Record<string, unknown>
): boolean {
  for (const [key, expected] of Object.entries(filter)) {
    if (key === '_id') {
      if (String(record._id) !== String(expected)) {
        return false;
      }
      continue;
    }
    if (record[key] !== expected) {
      return false;
    }
  }
  return true;
}

function attachInMemoryStoreToModel<TDoc>(model: mongoose.Model<TDoc>) {
  const records = new Map<string, StoredRecord>();
  const untypedModel = model as unknown as Record<
    string,
    (...args: unknown[]) => unknown
  >;

  vi.spyOn(untypedModel, 'find').mockImplementation(((
    filter: Record<string, unknown> = {}
  ) => {
    let list = Array.from(records.values()).filter((doc) =>
      matchesFilter(doc, filter)
    );
    const chain = {
      sort(sortSpec: Record<string, 1 | -1>) {
        list = [...list].sort((a, b) => {
          for (const [field, dir] of Object.entries(sortSpec)) {
            const av = a[field] as number | Date | string;
            const bv = b[field] as number | Date | string;
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
          }
          return 0;
        });
        return chain;
      },
      async lean() {
        return list.map((item) => ({ ...item }));
      },
    };
    return chain;
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'findOne').mockImplementation(((
    filter: Record<string, unknown> = {}
  ) => {
    const found =
      Array.from(records.values()).find((doc) => matchesFilter(doc, filter)) ??
      null;
    return {
      async lean() {
        return found ? { ...found } : null;
      },
    };
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'findById').mockImplementation(((id: unknown) => {
    const found = records.get(String(id)) ?? null;
    return {
      async lean() {
        return found ? { ...found } : null;
      },
    };
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'create').mockImplementation((async (
    docInput: Record<string, unknown>
  ) => {
    const instance = new model(docInput);
    const validationErr = instance.validateSync();
    if (validationErr) {
      throw validationErr;
    }
    const plain = instance.toObject() as unknown as StoredRecord;
    const now = new Date();
    plain._id = plain._id ?? new mongoose.Types.ObjectId();
    plain.createdAt = plain.createdAt ?? now;
    plain.updatedAt = now;
    records.set(String(plain._id), plain);
    return {
      toObject() {
        return { ...plain };
      },
    };
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'findOneAndUpdate').mockImplementation(((
    filter: Record<string, unknown>,
    update: { $set?: Record<string, unknown> },
    options?: { upsert?: boolean }
  ) => {
    let existing =
      Array.from(records.values()).find((doc) => matchesFilter(doc, filter)) ??
      null;
    const patch = update.$set ?? update;

    if (!existing && options?.upsert) {
      const instance = new model({ ...filter, ...patch });
      const validationErr = instance.validateSync();
      if (validationErr) {
        throw validationErr;
      }
      const now = new Date();
      existing = {
        ...(instance.toObject() as unknown as StoredRecord),
        _id: new mongoose.Types.ObjectId(),
        createdAt: now,
        updatedAt: now,
      };
      records.set(String(existing._id), existing);
    } else if (existing) {
      existing = {
        ...existing,
        ...patch,
        updatedAt: new Date(),
      };
      records.set(String(existing._id), existing);
    }

    return {
      async lean() {
        return existing ? { ...existing } : null;
      },
    };
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'findByIdAndUpdate').mockImplementation(((
    id: unknown,
    update: { $set?: Record<string, unknown> }
  ) => {
    const key = String(id);
    const existing = records.get(key) ?? null;
    const patch = update.$set ?? update;
    let updated: StoredRecord | null = null;
    if (existing) {
      updated = {
        ...existing,
        ...patch,
        updatedAt: new Date(),
      };
      records.set(key, updated);
    }
    const thenable = {
      async lean() {
        return updated ? { ...updated } : null;
      },
      then(resolve: (val: unknown) => unknown) {
        return Promise.resolve(updated).then(resolve);
      },
    };
    return thenable;
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'findByIdAndDelete').mockImplementation(((
    id: unknown
  ) => {
    const key = String(id);
    const existing = records.get(key) ?? null;
    if (existing) {
      records.delete(key);
    }
    return {
      async lean() {
        return existing ? { ...existing } : null;
      },
    };
  }) as (...args: unknown[]) => unknown);

  return records;
}

describe('Phase 3 — Dynamic Public Portfolio', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await disconnectFromDatabase();
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/tamjid-phase3-test';
    vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 1,
      configurable: true,
    });

    attachInMemoryStoreToModel(SiteSettingsModel);
    attachInMemoryStoreToModel(ProfileModel);
    attachInMemoryStoreToModel(SocialLinkModel);
    attachInMemoryStoreToModel(NavigationItemModel);
    attachInMemoryStoreToModel(ServiceModel);
    attachInMemoryStoreToModel(TestimonialModel);
    attachInMemoryStoreToModel(ClientLogoModel);
    attachInMemoryStoreToModel(EducationModel);
    attachInMemoryStoreToModel(ExperienceModel);
    attachInMemoryStoreToModel(SkillModel);
    attachInMemoryStoreToModel(AchievementModel);
    attachInMemoryStoreToModel(ProjectModel);
    attachInMemoryStoreToModel(BlogPostModel);
    attachInMemoryStoreToModel(ContactMessageModel);
    attachInMemoryStoreToModel(MediaAssetModel);

    await seedDatabase({
      uri: 'mongodb://127.0.0.1:27017/tamjid-phase3-test',
    });
  });

  afterEach(async () => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 0,
      configurable: true,
    });
    vi.restoreAllMocks();
    await disconnectFromDatabase();
  });

  it('generates dynamic SEO metadata from database SiteSettings', async () => {
    const initialMeta = await generateMetadata();
    expect(initialMeta.title).toBe('MD. Tamjid Hossain');

    await portfolioService.updateSiteSettings({
      ...V1_PORTFOLIO_SEED_DATA.siteSettings,
      siteTitle: 'Tamjid — Full-Stack & Python Portfolio',
      siteDescription: 'Dynamic description from MongoDB.',
      ogImageUrl: 'https://res.cloudinary.com/demo/image/upload/og-banner.png',
    });

    const updatedMeta = await generateMetadata();
    expect(updatedMeta.title).toBe('Tamjid — Full-Stack & Python Portfolio');
    expect(updatedMeta.description).toBe('Dynamic description from MongoDB.');
    expect(updatedMeta.openGraph?.title).toBe(
      'Tamjid — Full-Stack & Python Portfolio'
    );
  });

  it('serves the public portfolio snapshot via GET /api/public/portfolio with cache headers', async () => {
    const response = await getPublicPortfolioRoute();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    const payload = (await response.json()) as {
      ok: boolean;
      databaseConnected: boolean;
      data: typeof V1_PORTFOLIO_SEED_DATA;
    };
    expect(payload.ok).toBe(true);
    expect(payload.databaseConnected).toBe(true);
    expect(payload.data.profile.fullName).toBe('MD. Tamjid Hossain');
    expect(payload.data.projects).toHaveLength(9);
  });

  it('renders server-fetched dynamic database updates across all public sections and respects draft/visibility rules', async () => {
    // 1. Update Profile and add a published Achievement + custom Experience + new published Project + draft BlogPost
    await portfolioService.updateProfile({
      ...V1_PORTFOLIO_SEED_DATA.profile,
      professionalTitle: 'Python & Flutter Builder',
    });

    await portfolioService.createAchievement({
      title: 'Regional Robotics Winner',
      issuer: 'Calgary STEM',
      dateDisplay: '2025',
      description: 'First place in autonomous robotics challenge.',
      displayOrder: 1,
      status: 'published',
    });

    await portfolioService.createAchievement({
      title: 'Draft Unpublished Award',
      issuer: 'Internal',
      dateDisplay: '2026',
      description: 'Should not appear on public site.',
      displayOrder: 2,
      status: 'draft',
    });

    await portfolioService.createExperience({
      position: 'Junior Developer',
      company: 'ALCA Tech Club',
      location: 'Calgary',
      dateRange: '2024 — Present',
      isCurrent: true,
      description: 'Leading student coding workshops.',
      displayOrder: 0,
      visible: true,
    });

    await portfolioService.createProject({
      title: 'Flutter Weather Hub',
      slug: 'flutter-weather-hub',
      category: 'Mobile Apps',
      filterCategory: 'mobile apps',
      thumbnailUrl: '/assets/images/my-avatar.jpg',
      thumbnailAlt: 'flutter weather hub',
      liveUrl: 'https://example.com/weather',
      featured: true,
      displayOrder: 0,
      status: 'published',
    });

    await portfolioService.createBlogPost({
      title: 'Secret Draft Post',
      slug: 'secret-draft-post',
      category: 'Engineering',
      publishedDateDisplay: 'Oct 30, 2026',
      publishedDateISO: '2026-10-30',
      excerpt: 'Draft excerpt that should stay hidden.',
      bannerUrl: '/assets/images/my-avatar.jpg',
      bannerAlt: 'Draft',
      externalUrl: '#',
      displayOrder: 0,
      status: 'draft',
    });

    // 2. Render the async HomePage Server Component
    const pageElement = await HomePage();
    const { container } = render(pageElement);

    // Verify dynamic profile title in Sidebar
    expect(screen.getByText('Python & Flutter Builder')).toBeInTheDocument();

    // Navigate to Resume tab and verify new Experience & published Achievement (and exclusion of draft Achievement)
    const navButtons = container.querySelectorAll('[data-nav-link]');
    const resumeBtn = Array.from(navButtons).find(
      (btn) => btn.textContent?.trim() === 'Resume'
    );
    fireEvent.click(resumeBtn!);

    expect(
      screen.getByText('Junior Developer — ALCA Tech Club — Calgary')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Regional Robotics Winner — Calgary STEM')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Draft Unpublished Award/)
    ).not.toBeInTheDocument();

    // Navigate to Portfolio tab and verify new project + dynamic "Mobile Apps" filter category
    const portfolioBtn = Array.from(navButtons).find(
      (btn) => btn.textContent?.trim() === 'Portfolio'
    );
    fireEvent.click(portfolioBtn!);

    expect(screen.getByText('Flutter Weather Hub')).toBeInTheDocument();
    const filterButtons = container.querySelectorAll('[data-filter-btn]');
    const mobileAppsFilterBtn = Array.from(filterButtons).find(
      (btn) => btn.textContent?.trim() === 'Mobile Apps'
    );
    expect(mobileAppsFilterBtn).toBeDefined();
    fireEvent.click(mobileAppsFilterBtn!);

    const activeProjects = container.querySelectorAll(
      '.project-item.active .project-title'
    );
    expect(activeProjects).toHaveLength(1);
    expect(activeProjects[0]?.textContent).toBe('Flutter Weather Hub');

    // Verify Draft Blog Post is excluded from public Blog section
    expect(screen.queryByText('Secret Draft Post')).not.toBeInTheDocument();
  });

  it('computes cache revalidation tags including portfolio-public and granular section tags', () => {
    const result = revalidatePortfolioCache([
      PORTFOLIO_CACHE_TAGS.PROJECTS,
      PORTFOLIO_CACHE_TAGS.PROFILE,
    ]);
    expect(result.tags).toEqual([
      'portfolio-public',
      'portfolio-projects',
      'portfolio-profile',
    ]);
  });
});
