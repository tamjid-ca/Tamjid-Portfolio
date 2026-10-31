import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/(public)/page';
import {
  PATCH as patchPortfolioReorder,
  POST as postPortfolioItem,
  PUT as putPortfolioItem,
} from '@/app/api/admin/portfolio/route';
import { PATCH as patchAdminMessage } from '@/app/api/admin/messages/route';
import { POST as postUploadSign } from '@/app/api/uploads/sign/route';
import { createSignedSessionCookieValue } from '@/lib/auth/request-guard';
import { disconnectFromDatabase } from '@/lib/mongodb/connection';
import { stripMongoOperators } from '@/lib/security/sanitize';
import {
  AchievementModel,
  AdminSessionModel,
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

  return records;
}

describe('Phase 10 — Production Regression, Architecture & Security Audit', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    process.env.ADMIN_SESSION_SECRET =
      'phase10-test-secret-key-at-least-32-chars';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/tamjid-phase10-test';

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
    attachInMemoryStoreToModel(AdminSessionModel);

    await seedDatabase({
      uri: 'mongodb://127.0.0.1:27017/tamjid-phase10-test',
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

  it('preserves all V1 CSS custom properties and 5 responsive breakpoints in src/app/globals.css', () => {
    const cssPath = path.join(process.cwd(), 'src/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const requiredTokens = [
      '--smoky-black',
      '--eerie-black-1',
      '--eerie-black-2',
      '--onyx',
      '--jet',
      '--orange-yellow-crayola',
      '--vegas-gold',
      '--border-gradient-onyx',
      '--bg-gradient-onyx',
      '--bg-gradient-jet',
      '--text-gradient-yellow',
      '--fs-1',
      '--fs-2',
      '--fs-3',
      '--fs-4',
      '--fs-5',
      '--fs-6',
      '--fs-7',
      '--fs-8',
      '--shadow-1',
      '--shadow-2',
      '--shadow-3',
      '--shadow-4',
      '--shadow-5',
    ];

    for (const token of requiredTokens) {
      expect(cssContent).toContain(token);
    }

    const requiredBreakpoints = [
      '@media (min-width: 450px)',
      '@media (min-width: 580px)',
      '@media (min-width: 768px)',
      '@media (min-width: 1024px)',
      '@media (min-width: 1250px)',
    ];

    for (const bp of requiredBreakpoints) {
      expect(cssContent).toContain(bp);
    }

    expect(cssContent).toContain('[data-theme="light"]');
  });

  it('enforces strict clean architecture layering so no UI component imports Mongoose or database modules', () => {
    const componentsDir = path.join(process.cwd(), 'src/components');

    const walkFiles = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const results: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...walkFiles(fullPath));
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const componentFiles = walkFiles(componentsDir);
    expect(componentFiles.length).toBeGreaterThan(10);

    for (const file of componentFiles) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).not.toMatch(/from\s+['"]mongoose['"]/);
      expect(source).not.toMatch(/from\s+['"]@\/models/);
      expect(source).not.toMatch(/from\s+['"]@\/lib\/mongodb/);
    }
  });

  it('blocks NoSQL operator injection, XSS payloads, and cross-origin CSRF mutations', async () => {
    // 1. NoSQL operator stripping
    const maliciousInput = {
      fullname: 'Attacker',
      email: { $ne: null, $gt: '' },
      'nested.dotted.key': 'dropped',
      nested: {
        $where: 'sleep(5000)',
        safe: 'kept',
      },
    };
    const sanitized = stripMongoOperators(maliciousInput);
    expect(sanitized).toEqual({
      fullname: 'Attacker',
      email: {},
      nested: {
        safe: 'kept',
      },
    });

    // 2. XSS rejection in contact form
    await expect(
      contactService.submitContactMessage({
        fullname: '<script>alert(1)</script>',
        email: 'attacker@example.com',
        message: 'Hello world',
      })
    ).rejects.toThrow();

    // 3. Cross-origin CSRF rejection across protected mutation endpoints
    const validCookie = createSignedSessionCookieValue({
      sessionId: 'sess-csrf-test',
      userId: 'admin-1',
      email: 'admin@tamjid.dev',
      exp: Date.now() + 3600_000,
    });

    const csrfAdminPortfolioRes = await postPortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Host: 'localhost:3000',
          Origin: 'https://evil-attacker.example',
          Cookie: `tamjid_admin_session=${validCookie}`,
        },
        body: JSON.stringify({ entity: 'projects', payload: {} }),
      })
    );
    expect(csrfAdminPortfolioRes.status).toBe(403);

    const csrfMessagesRes = await patchAdminMessage(
      new Request('http://localhost:3000/api/admin/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Host: 'localhost:3000',
          Origin: 'https://evil-attacker.example',
          Cookie: `tamjid_admin_session=${validCookie}`,
        },
        body: JSON.stringify({ id: 'msg-1', isRead: true }),
      })
    );
    expect(csrfMessagesRes.status).toBe(403);

    const csrfUploadSignRes = await postUploadSign(
      new Request('http://localhost:3000/api/uploads/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Host: 'localhost:3000',
          Origin: 'https://evil-attacker.example',
          Cookie: `tamjid_admin_session=${validCookie}`,
        },
        body: JSON.stringify({ folder: 'tamjid-portfolio/projects' }),
      })
    );
    expect(csrfUploadSignRes.status).toBe(403);
  });

  it('propagates authenticated Admin CMS mutations (create, draft toggle, reorder, profile update) to public HomePage', async () => {
    const validCookie = createSignedSessionCookieValue({
      sessionId: 'sess-e2e-admin',
      userId: 'admin-1',
      email: 'admin@tamjid.dev',
      exp: Date.now() + 3600_000,
    });

    const adminHeaders = {
      'Content-Type': 'application/json',
      Host: 'localhost:3000',
      Origin: 'http://localhost:3000',
      Cookie: `tamjid_admin_session=${validCookie}`,
    };

    // 1. Update Profile via PUT /api/admin/portfolio
    const putProfileRes = await putPortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          entity: 'profile',
          payload: {
            ...V1_PORTFOLIO_SEED_DATA.profile,
            professionalTitle: 'Full-Stack & AI Innovator',
          },
        }),
      })
    );
    expect(putProfileRes.status).toBe(200);

    // 2. Create a new published Project via POST /api/admin/portfolio
    const postProjectRes = await postPortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          entity: 'projects',
          payload: {
            title: 'Quantum Vision Engine',
            slug: 'quantum-vision-engine',
            category: 'Web development',
            filterCategory: 'web development',
            thumbnailUrl: '/assets/images/project-1.jpg',
            thumbnailAlt: 'Quantum Vision Engine',
            liveUrl: 'https://example.com/quantum',
            featured: true,
            displayOrder: 0,
            status: 'published',
          },
        }),
      })
    );
    expect(postProjectRes.status).toBe(201);

    // 3. Create a draft Project that must NOT appear publicly
    const postDraftRes = await postPortfolioItem(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          entity: 'projects',
          payload: {
            title: 'Stealth Internal Prototype',
            slug: 'stealth-internal-prototype',
            category: 'Applications',
            filterCategory: 'applications',
            thumbnailUrl: '/assets/images/project-2.png',
            thumbnailAlt: 'Stealth Internal Prototype',
            liveUrl: '#',
            featured: false,
            displayOrder: 1,
            status: 'draft',
          },
        }),
      })
    );
    expect(postDraftRes.status).toBe(201);

    // 4. Reorder Skills via PATCH /api/admin/portfolio
    const existingSkills = await SkillModel.find({}).lean<
      Array<{ _id: mongoose.Types.ObjectId; name: string }>
    >();
    const reversedSkillIds = [...existingSkills]
      .reverse()
      .map((s) => String(s._id));

    const reorderRes = await patchPortfolioReorder(
      new Request('http://localhost:3000/api/admin/portfolio', {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({
          action: 'reorder',
          collection: 'skills',
          orderedIds: reversedSkillIds,
        }),
      })
    );
    expect(reorderRes.status).toBe(200);

    // 5. Render public HomePage and verify live reflection
    const pageElement = await HomePage();
    const { container } = render(pageElement);

    expect(screen.getByText('Full-Stack & AI Innovator')).toBeInTheDocument();

    // Navigate to Portfolio tab
    const navButtons = container.querySelectorAll('[data-nav-link]');
    const portfolioBtn = Array.from(navButtons).find(
      (btn) => btn.textContent?.trim() === 'Portfolio'
    );
    fireEvent.click(portfolioBtn!);

    expect(screen.getByText('Quantum Vision Engine')).toBeInTheDocument();
    expect(
      screen.queryByText('Stealth Internal Prototype')
    ).not.toBeInTheDocument();

    // Navigate to Resume tab and verify reordered Skills (WordPress now first)
    const resumeBtn = Array.from(navButtons).find(
      (btn) => btn.textContent?.trim() === 'Resume'
    );
    fireEvent.click(resumeBtn!);

    const skillHeadings = container.querySelectorAll(
      '.skills-item .title-wrapper h5'
    );
    expect(skillHeadings[0]?.textContent).toBe('WordPress');
  });
});
