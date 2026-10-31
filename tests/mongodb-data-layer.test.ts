import mongoose from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as postContactRoute } from '@/app/api/public/contact/route';
import {
  connectToDatabase,
  DatabaseConfigurationError,
  disconnectFromDatabase,
  getDatabaseStatus,
} from '@/lib/mongodb/connection';
import { escapeRegex, stripMongoOperators } from '@/lib/security/sanitize';
import {
  blogPostInputSchema,
  contactMessageInputSchema,
  educationInputSchema,
  experienceInputSchema,
  navigationItemInputSchema,
  profileInputSchema,
  projectInputSchema,
  serviceInputSchema,
  siteSettingsInputSchema,
  skillInputSchema,
  socialLinkInputSchema,
  testimonialInputSchema,
  validateAndSanitize,
} from '@/lib/validation/portfolio-schemas';
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
import { contactService } from '@/services/contact-service';
import {
  deriveProjectCategories,
  MediaAssetInUseError,
  portfolioService,
} from '@/services/portfolio-service';

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

  vi.spyOn(untypedModel, 'findOneAndDelete').mockImplementation(((
    filter: Record<string, unknown>
  ) => {
    const existing =
      Array.from(records.values()).find((doc) => matchesFilter(doc, filter)) ??
      null;
    if (existing) {
      records.delete(String(existing._id));
    }
    return {
      async lean() {
        return existing ? { ...existing } : null;
      },
    };
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'exists').mockImplementation((async (
    filter: Record<string, unknown>
  ) => {
    const hit = Array.from(records.values()).find((doc) =>
      matchesFilter(doc, filter)
    );
    return hit ? { _id: hit._id } : null;
  }) as (...args: unknown[]) => unknown);

  return records;
}

describe('Phase 2 — MongoDB and Backend Foundation', () => {
  const originalEnvUri = process.env.MONGODB_URI;

  beforeEach(async () => {
    vi.restoreAllMocks();
    await disconnectFromDatabase();
  });

  afterEach(async () => {
    process.env.MONGODB_URI = originalEnvUri;
    vi.restoreAllMocks();
    await disconnectFromDatabase();
  });

  describe('1. MongoDB Connection Manager', () => {
    it('returns null gracefully when MONGODB_URI is absent in non-strict mode', async () => {
      delete process.env.MONGODB_URI;
      const conn = await connectToDatabase({ strict: false });
      expect(conn).toBeNull();
      expect(getDatabaseStatus().connected).toBe(false);
    });

    it('throws DatabaseConfigurationError when MONGODB_URI is absent in strict mode', async () => {
      delete process.env.MONGODB_URI;
      await expect(connectToDatabase({ strict: true })).rejects.toThrow(
        DatabaseConfigurationError
      );
    });

    it('caches and reuses the Mongoose connection instance across calls', async () => {
      const connectSpy = vi
        .spyOn(mongoose, 'connect')
        .mockResolvedValue(mongoose);
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 1,
        configurable: true,
      });

      const first = await connectToDatabase({
        uri: 'mongodb://127.0.0.1:27017/tamjid-test',
        strict: true,
      });
      const second = await connectToDatabase({
        uri: 'mongodb://127.0.0.1:27017/tamjid-test',
        strict: true,
      });

      expect(first).toBe(mongoose);
      expect(second).toBe(mongoose);
      expect(connectSpy).toHaveBeenCalledTimes(1);

      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 0,
        configurable: true,
      });
    });
  });

  describe('2. Input Sanitization & Zod Schemas', () => {
    it('strips MongoDB operator keys ($ne, $gt, $where), dotted keys, and null bytes recursively', () => {
      const maliciousPayload = {
        fullname: 'Alice\u0000',
        email: 'alice@example.com',
        $where: 'this.password.length > 0',
        'nested.operator': 'blocked',
        nested: {
          $ne: null,
          safeField: 'kept',
        },
        items: [{ $gt: 5, label: 'valid' }],
      };

      const cleaned = stripMongoOperators(maliciousPayload);
      expect(cleaned).toEqual({
        fullname: 'Alice',
        email: 'alice@example.com',
        nested: {
          safeField: 'kept',
        },
        items: [{ label: 'valid' }],
      });
      expect(escapeRegex('c++ (web) [test]?')).toBe(
        'c\\+\\+ \\(web\\) \\[test\\]\\?'
      );
    });

    it('validates all V1 seed entities against their Zod schemas without errors', () => {
      expect(() =>
        validateAndSanitize(
          siteSettingsInputSchema,
          V1_PORTFOLIO_SEED_DATA.siteSettings
        )
      ).not.toThrow();
      expect(() =>
        validateAndSanitize(profileInputSchema, V1_PORTFOLIO_SEED_DATA.profile)
      ).not.toThrow();

      for (const link of V1_PORTFOLIO_SEED_DATA.socialLinks) {
        expect(() =>
          validateAndSanitize(socialLinkInputSchema, link)
        ).not.toThrow();
      }
      for (const nav of V1_PORTFOLIO_SEED_DATA.navigationItems) {
        expect(() =>
          validateAndSanitize(navigationItemInputSchema, nav)
        ).not.toThrow();
      }
      for (const service of V1_PORTFOLIO_SEED_DATA.services) {
        expect(() =>
          validateAndSanitize(serviceInputSchema, service)
        ).not.toThrow();
      }
      for (const testimonial of V1_PORTFOLIO_SEED_DATA.testimonials) {
        expect(() =>
          validateAndSanitize(testimonialInputSchema, testimonial)
        ).not.toThrow();
      }
      for (const edu of V1_PORTFOLIO_SEED_DATA.education) {
        expect(() =>
          validateAndSanitize(educationInputSchema, edu)
        ).not.toThrow();
      }
      for (const exp of V1_PORTFOLIO_SEED_DATA.experience) {
        expect(() =>
          validateAndSanitize(experienceInputSchema, exp)
        ).not.toThrow();
      }
      for (const skill of V1_PORTFOLIO_SEED_DATA.skills) {
        expect(() =>
          validateAndSanitize(skillInputSchema, skill)
        ).not.toThrow();
      }
      for (const project of V1_PORTFOLIO_SEED_DATA.projects) {
        expect(() =>
          validateAndSanitize(projectInputSchema, project)
        ).not.toThrow();
      }
      for (const post of V1_PORTFOLIO_SEED_DATA.blogPosts) {
        expect(() =>
          validateAndSanitize(blogPostInputSchema, post)
        ).not.toThrow();
      }
    });

    it('rejects dangerous URLs and invalid payloads via Zod validation', () => {
      expect(() =>
        validateAndSanitize(socialLinkInputSchema, {
          platform: 'XSS',
          url: 'javascript:alert(1)',
          iconName: 'logo-github',
          displayOrder: 1,
          visible: true,
        })
      ).toThrow();

      expect(() =>
        validateAndSanitize(skillInputSchema, {
          name: 'Invalid Skill',
          category: 'Web',
          percentageValue: 150,
          percentageLabel: '150%',
          displayOrder: 1,
          visible: true,
        })
      ).toThrow();

      expect(() =>
        validateAndSanitize(contactMessageInputSchema, {
          fullname: { $ne: '' },
          email: 'not-an-email',
          message: 'Hello',
        })
      ).toThrow();
    });
  });

  describe('3. Mongoose Models & Schema Indexes', () => {
    it('validates documents and registers compound indexes across all 15 models', () => {
      const models = [
        SiteSettingsModel,
        ProfileModel,
        SocialLinkModel,
        NavigationItemModel,
        ServiceModel,
        TestimonialModel,
        ClientLogoModel,
        EducationModel,
        ExperienceModel,
        SkillModel,
        AchievementModel,
        ProjectModel,
        BlogPostModel,
        ContactMessageModel,
        MediaAssetModel,
      ];
      expect(models).toHaveLength(15);

      const projectIndexes = ProjectModel.schema.indexes();
      expect(projectIndexes.length).toBeGreaterThanOrEqual(2);

      const contactIndexes = ContactMessageModel.schema.indexes();
      expect(contactIndexes).toEqual(
        expect.arrayContaining([[{ isRead: 1, createdAt: -1 }, expect.any(Object)]])
      );

      // Verify V1 empty Education placeholder item passes Mongoose schema validation
      const placeholderEdu = new EducationModel(
        V1_PORTFOLIO_SEED_DATA.education[1]
      );
      expect(placeholderEdu.validateSync()).toBeUndefined();

      // Verify V1 JavaScript skill (value 90, label "60%") passes Mongoose schema validation
      const jsSkill = new SkillModel(V1_PORTFOLIO_SEED_DATA.skills[2]);
      expect(jsSkill.validateSync()).toBeUndefined();
      expect(jsSkill.percentageValue).toBe(90);
      expect(jsSkill.percentageLabel).toBe('60%');
    });
  });

  describe('4. Idempotent Seeding, Repositories & Services', () => {
    let stores: Record<string, Map<string, StoredRecord>>;

    beforeEach(() => {
      vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 1,
        configurable: true,
      });

      stores = {
        siteSettings: attachInMemoryStoreToModel(SiteSettingsModel),
        profile: attachInMemoryStoreToModel(ProfileModel),
        socialLinks: attachInMemoryStoreToModel(SocialLinkModel),
        navigationItems: attachInMemoryStoreToModel(NavigationItemModel),
        services: attachInMemoryStoreToModel(ServiceModel),
        testimonials: attachInMemoryStoreToModel(TestimonialModel),
        clients: attachInMemoryStoreToModel(ClientLogoModel),
        education: attachInMemoryStoreToModel(EducationModel),
        experience: attachInMemoryStoreToModel(ExperienceModel),
        skills: attachInMemoryStoreToModel(SkillModel),
        achievements: attachInMemoryStoreToModel(AchievementModel),
        projects: attachInMemoryStoreToModel(ProjectModel),
        blogPosts: attachInMemoryStoreToModel(BlogPostModel),
        contactMessages: attachInMemoryStoreToModel(ContactMessageModel),
        mediaAssets: attachInMemoryStoreToModel(MediaAssetModel),
      };
    });

    afterEach(() => {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 0,
        configurable: true,
      });
    });

    it('seeds all V1 portfolio entities idempotently without duplicating records on repeated runs', async () => {
      const firstRun = await seedDatabase({
        uri: 'mongodb://127.0.0.1:27017/tamjid-seed-test',
      });
      const secondRun = await seedDatabase({
        uri: 'mongodb://127.0.0.1:27017/tamjid-seed-test',
      });

      expect(firstRun).toEqual(secondRun);
      expect(stores.siteSettings.size).toBe(1);
      expect(stores.profile.size).toBe(1);
      expect(stores.socialLinks.size).toBe(3);
      expect(stores.navigationItems.size).toBe(5);
      expect(stores.services.size).toBe(4);
      expect(stores.testimonials.size).toBe(4);
      expect(stores.clients.size).toBe(6);
      expect(stores.education.size).toBe(3);
      expect(stores.experience.size).toBe(3);
      expect(stores.skills.size).toBe(4);
      expect(stores.projects.size).toBe(9);
      expect(stores.blogPosts.size).toBe(4);

      const publicData = await portfolioService.getPublicPortfolioData();
      expect(publicData.profile.fullName).toBe('MD. Tamjid Hossain');
      expect(publicData.profile.location).toBe('Canda');
      expect(publicData.profile.birthdayDisplay).toBe('March 19, 2015');
      expect(publicData.profile.birthdayDateTime).toBe('1982-06-23');
      expect(publicData.education).toHaveLength(3);
      expect(publicData.education[1]?.institution).toBe('');
      expect(publicData.skills[2]?.percentageValue).toBe(90);
      expect(publicData.skills[2]?.percentageLabel).toBe('60%');
      expect(publicData.projects).toHaveLength(9);
      expect(publicData.projectCategories).toEqual([
        'All',
        'Web design',
        'Applications',
        'Web development',
      ]);
    });

    it('supports full service CRUD, draft vs published filtering, and project reordering', async () => {
      await seedDatabase({
        uri: 'mongodb://127.0.0.1:27017/tamjid-crud-test',
      });

      // Create a draft project
      const createdDraft = await portfolioService.createProject({
        title: 'Quantum Engine',
        slug: 'quantum-engine',
        category: 'AI Systems',
        filterCategory: 'AI Systems',
        thumbnailUrl: '/assets/images/my-avatar.jpg',
        thumbnailAlt: 'quantum engine',
        liveUrl: 'https://example.com',
        featured: false,
        displayOrder: 10,
        status: 'draft',
      });

      expect(createdDraft.filterCategory).toBe('ai systems');

      // Public query excludes draft project
      const publicData = await portfolioService.getPublicPortfolioData();
      expect(publicData.projects).toHaveLength(9);

      // Admin query includes draft project
      const adminData = await portfolioService.getAdminPortfolioData();
      expect(adminData.projects).toHaveLength(10);

      // Publish the draft project
      const published = await portfolioService.updateProject(createdDraft.id, {
        status: 'published',
      });
      expect(published?.status).toBe('published');

      const publicAfterPublish =
        await portfolioService.getPublicPortfolioData();
      expect(publicAfterPublish.projects).toHaveLength(10);
      expect(
        deriveProjectCategories(publicAfterPublish.projects)
      ).toContain('AI Systems');

      // Reorder projects so the newly created project is first
      const reorderedIds = [
        createdDraft.id,
        ...publicAfterPublish.projects
          .filter((p) => p.id !== createdDraft.id)
          .map((p) => p.id),
      ];
      await portfolioService.reorderProjects({ orderedIds: reorderedIds });

      const reorderedPublic = await portfolioService.getPublicPortfolioData();
      expect(reorderedPublic.projects[0]?.id).toBe(createdDraft.id);
      expect(reorderedPublic.projects[0]?.displayOrder).toBe(1);

      // Delete the project
      const deleted = await portfolioService.deleteProject(createdDraft.id);
      expect(deleted).toBe(true);
      expect((await portfolioService.getPublicPortfolioData()).projects).toHaveLength(
        9
      );
    });

    it('enforces reference-safe media deletion when a MediaAsset is still used by content', async () => {
      await seedDatabase({
        uri: 'mongodb://127.0.0.1:27017/tamjid-media-test',
      });

      const asset = await portfolioService.registerMediaAsset({
        publicId: 'tamjid-portfolio/projects/hero-shot',
        url: 'http://res.cloudinary.com/demo/image/upload/tamjid-portfolio/projects/hero-shot.webp',
        secureUrl:
          'https://res.cloudinary.com/demo/image/upload/tamjid-portfolio/projects/hero-shot.webp',
        folder: 'tamjid-portfolio/projects',
        resourceType: 'image',
        format: 'webp',
        width: 1200,
        height: 800,
        bytes: 84210,
        altText: 'Hero shot',
      });

      const projectUsingAsset = await portfolioService.createProject({
        title: 'Referenced Project',
        slug: 'referenced-project',
        category: 'Web development',
        filterCategory: 'web development',
        thumbnailUrl: asset.secureUrl,
        thumbnailPublicId: asset.publicId,
        thumbnailAlt: 'Referenced',
        liveUrl: '#',
        featured: false,
        displayOrder: 10,
        status: 'published',
      });

      await expect(
        portfolioService.deleteMediaAssetSafely(asset.publicId)
      ).rejects.toThrow(MediaAssetInUseError);

      // Remove the project referencing the asset, then delete asset cleanly
      await portfolioService.deleteProject(projectUsingAsset.id);
      const removed = await portfolioService.deleteMediaAssetSafely(
        asset.publicId
      );
      expect(removed).toBe(true);
    });

    it('persists validated contact messages through contactService and POST /api/public/contact', async () => {
      const request = new Request('http://localhost:3000/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: 'Jane Doe',
          email: 'JANE@example.com',
          message: 'Interested in collaborating on a Python project!',
          $where: 'malicious()',
        }),
      });

      const response = await postContactRoute(request);
      expect(response.status).toBe(200);
      const payload = (await response.json()) as {
        ok: boolean;
        persisted: boolean;
        id: string;
      };
      expect(payload.ok).toBe(true);
      expect(payload.persisted).toBe(true);
      expect(stores.contactMessages.size).toBe(1);

      // Verify invalid contact submission returns 400
      const invalidReq = new Request(
        'http://localhost:3000/api/public/contact',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullname: '',
            email: 'bad-email',
            message: '',
          }),
        }
      );
      const invalidRes = await postContactRoute(invalidReq);
      expect(invalidRes.status).toBe(400);
    });

    it('falls back to V1 seed data when database is disconnected', async () => {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 0,
        configurable: true,
      });
      delete process.env.MONGODB_URI;

      const fallbackData = await portfolioService.getPublicPortfolioData();
      expect(fallbackData.profile.fullName).toBe('MD. Tamjid Hossain');
      expect(fallbackData.projects).toHaveLength(9);

      const fallbackContact = await contactService.submitContactMessage({
        fullname: 'Offline Visitor',
        email: 'visitor@example.com',
        message: 'Testing offline fallback',
      });
      expect(fallbackContact.persisted).toBe(false);
      expect(fallbackContact.message.fullname).toBe('Offline Visitor');
    });
  });
});
