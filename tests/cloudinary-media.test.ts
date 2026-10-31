import mongoose from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as postSignUploadRoute } from '@/app/api/uploads/sign/route';
import {
  DELETE as deleteAssetRoute,
  GET as getAssetsRoute,
  POST as postRegisterAssetRoute,
} from '@/app/api/uploads/assets/route';
import {
  ADMIN_SESSION_COOKIE_NAME,
  createSignedSessionCookieValue,
} from '@/lib/auth/request-guard';
import {
  buildCloudinaryImageUrl,
  buildResponsiveSrcSet,
  createSignedUploadPayload,
  MAX_IMAGE_BYTES,
  MediaValidationError,
  signCloudinaryParams,
} from '@/lib/cloudinary';
import { disconnectFromDatabase } from '@/lib/mongodb/connection';
import {
  AchievementModel,
  AdminSessionModel,
  AdminUserModel,
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

describe('Phase 4 — Cloudinary Media Management', () => {
  const TEST_SESSION_SECRET = 'test-admin-secret-key-for-phase-4';

  function createValidAuthCookieHeader(): string {
    const token = createSignedSessionCookieValue(
      {
        sessionId: 'sess-123',
        userId: 'admin-1',
        email: 'admin@tamjid.ca',
        exp: Date.now() + 60 * 60 * 1000,
      },
      TEST_SESSION_SECRET
    );
    return `${ADMIN_SESSION_COOKIE_NAME}=${token}`;
  }

  beforeEach(async () => {
    vi.restoreAllMocks();
    await disconnectFromDatabase();

    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/tamjid-phase4-test';
    process.env.ADMIN_SESSION_SECRET = TEST_SESSION_SECRET;
    process.env.CLOUDINARY_CLOUD_NAME = 'tamjid-cloud';
    process.env.CLOUDINARY_API_KEY = '1234567890';
    process.env.CLOUDINARY_API_SECRET = 'cloudinary-super-secret';

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
    attachInMemoryStoreToModel(AdminUserModel);
    attachInMemoryStoreToModel(AdminSessionModel);
  });

  afterEach(async () => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 0,
      configurable: true,
    });
    vi.restoreAllMocks();
    await disconnectFromDatabase();
  });

  describe('1. Server-Side Upload Signature & File Constraints', () => {
    it('computes deterministic parameter signatures and builds signed upload payloads', () => {
      const payload = createSignedUploadPayload(
        {
          folder: 'portfolio/projects',
          fileName: 'dashboard-preview.webp',
          mimeType: 'image/webp',
          bytes: 250000,
          customPublicId: 'dashboard_v2',
        },
        {
          cloudName: 'demo-cloud',
          apiKey: 'api-key-99',
          apiSecret: 'secret-xyz',
        },
        1700000000
      );

      expect(payload.cloudName).toBe('demo-cloud');
      expect(payload.apiKey).toBe('api-key-99');
      expect(payload.folder).toBe('portfolio/projects');
      expect(payload.resourceType).toBe('image');
      expect(payload.publicId).toBe('dashboard_v2');
      expect(payload.uploadUrl).toBe(
        'https://api.cloudinary.com/v1_1/demo-cloud/image/upload'
      );

      const expectedSig = signCloudinaryParams(
        {
          folder: 'portfolio/projects',
          public_id: 'dashboard_v2',
          timestamp: 1700000000,
        },
        'secret-xyz'
      );
      expect(payload.signature).toBe(expectedSig);
    });

    it('rejects unsupported MIME types, mismatched extensions, and oversized files', () => {
      // Unsupported MIME
      expect(() =>
        createSignedUploadPayload({
          folder: 'portfolio/projects',
          fileName: 'malware.exe',
          mimeType: 'application/x-msdownload',
          bytes: 1024,
        })
      ).toThrow(MediaValidationError);

      // Extension mismatch
      expect(() =>
        createSignedUploadPayload({
          folder: 'portfolio/profile',
          fileName: 'avatar.png',
          mimeType: 'image/jpeg',
          bytes: 2048,
        })
      ).toThrow(MediaValidationError);

      // Oversized image (>10MB)
      expect(() =>
        createSignedUploadPayload({
          folder: 'portfolio/profile',
          fileName: 'huge-photo.jpg',
          mimeType: 'image/jpeg',
          bytes: MAX_IMAGE_BYTES + 100,
        })
      ).toThrow(MediaValidationError);
    });
  });

  describe('2. Responsive Cloudinary URL & SrcSet Helpers', () => {
    it('preserves local static asset paths while optimizing Cloudinary URLs and publicIds', () => {
      // Local path untouched
      expect(
        buildCloudinaryImageUrl('/assets/images/my-avatar.jpg', { width: 240 })
      ).toBe('/assets/images/my-avatar.jpg');
      expect(
        buildResponsiveSrcSet('/assets/images/my-avatar.jpg')
      ).toBeUndefined();

      // Full Cloudinary URL transformed
      const rawUrl =
        'https://res.cloudinary.com/tamjid-cloud/image/upload/v1700000/portfolio/projects/orizon.png';
      const transformed = buildCloudinaryImageUrl(rawUrl, {
        width: 640,
        crop: 'limit',
      });
      expect(transformed).toBe(
        'https://res.cloudinary.com/tamjid-cloud/image/upload/f_auto,q_auto,c_limit,w_640/v1700000/portfolio/projects/orizon.png'
      );

      // Public ID transformed
      const fromPublicId = buildCloudinaryImageUrl(
        'portfolio/profile/tamjid-avatar',
        { width: 240, cloudName: 'tamjid-cloud' }
      );
      expect(fromPublicId).toBe(
        'https://res.cloudinary.com/tamjid-cloud/image/upload/f_auto,q_auto,c_limit,w_240/portfolio/profile/tamjid-avatar'
      );

      const srcSet = buildResponsiveSrcSet(rawUrl, [320, 640]);
      expect(srcSet).toContain('w_320/v1700000/portfolio/projects/orizon.png 320w');
      expect(srcSet).toContain('w_640/v1700000/portfolio/projects/orizon.png 640w');
    });
  });

  describe('3. Upload & Media Asset Route Handlers (Auth + Reference-Safe Deletion)', () => {
    it('blocks unauthenticated requests to /api/uploads/sign and /api/uploads/assets with 401', async () => {
      const unauthSignReq = new Request('http://localhost:3000/api/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: 'portfolio/projects',
          fileName: 'shot.webp',
          mimeType: 'image/webp',
          bytes: 50000,
        }),
      });
      const signRes = await postSignUploadRoute(unauthSignReq);
      expect(signRes.status).toBe(401);

      const unauthListReq = new Request(
        'http://localhost:3000/api/uploads/assets',
        { method: 'GET' }
      );
      const listRes = await getAssetsRoute(unauthListReq);
      expect(listRes.status).toBe(401);
    });

    it('signs uploads, registers assets, tracks entity references, blocks in-use deletion (409), and deletes unused assets cleanly', async () => {
      const cookieHeader = createValidAuthCookieHeader();

      // 1. Request signed upload payload
      const signReq = new Request('http://localhost:3000/api/uploads/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          folder: 'portfolio/projects',
          fileName: 'project-banner.webp',
          mimeType: 'image/webp',
          bytes: 120000,
        }),
      });
      const signRes = await postSignUploadRoute(signReq);
      expect(signRes.status).toBe(200);
      const signBody = (await signRes.json()) as {
        ok: boolean;
        upload: { signature: string; folder: string };
      };
      expect(signBody.ok).toBe(true);
      expect(signBody.upload.folder).toBe('portfolio/projects');
      expect(signBody.upload.signature).toHaveLength(64);

      // 2. Register uploaded MediaAsset
      const registerReq = new Request(
        'http://localhost:3000/api/uploads/assets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,
          },
          body: JSON.stringify({
            publicId: 'portfolio/projects/project-banner',
            url: 'http://res.cloudinary.com/tamjid-cloud/image/upload/portfolio/projects/project-banner.webp',
            secureUrl:
              'https://res.cloudinary.com/tamjid-cloud/image/upload/portfolio/projects/project-banner.webp',
            folder: 'portfolio/projects',
            resourceType: 'image',
            format: 'webp',
            width: 1280,
            height: 720,
            bytes: 120000,
            altText: 'Project Banner',
          }),
        }
      );
      const registerRes = await postRegisterAssetRoute(registerReq);
      expect(registerRes.status).toBe(201);

      // 3. Reference the asset in a Project
      const project = await portfolioService.createProject({
        title: 'Cloud Native App',
        slug: 'cloud-native-app',
        category: 'Web development',
        filterCategory: 'web development',
        thumbnailUrl:
          'https://res.cloudinary.com/tamjid-cloud/image/upload/portfolio/projects/project-banner.webp',
        thumbnailPublicId: 'portfolio/projects/project-banner',
        thumbnailAlt: 'Cloud Native App',
        liveUrl: 'https://example.com',
        featured: true,
        displayOrder: 1,
        status: 'published',
      });

      // 4. List assets and verify referencedBy includes 'Project'
      const listReq = new Request(
        'http://localhost:3000/api/uploads/assets?folder=portfolio/projects',
        {
          method: 'GET',
          headers: { Cookie: cookieHeader },
        }
      );
      const listRes = await getAssetsRoute(listReq);
      expect(listRes.status).toBe(200);
      const listBody = (await listRes.json()) as {
        ok: boolean;
        assets: Array<{ publicId: string; referencedBy: string[] }>;
      };
      expect(listBody.assets).toHaveLength(1);
      expect(listBody.assets[0]?.referencedBy).toContain('Project');

      // 5. Attempt to delete while referenced -> 409 Conflict
      const blockedDeleteReq = new Request(
        'http://localhost:3000/api/uploads/assets',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,
          },
          body: JSON.stringify({
            publicId: 'portfolio/projects/project-banner',
          }),
        }
      );
      const blockedDeleteRes = await deleteAssetRoute(blockedDeleteReq);
      expect(blockedDeleteRes.status).toBe(409);

      // 6. Remove project reference, mock Cloudinary remote destroy, and delete asset -> 200 OK
      await portfolioService.deleteProject(project.id);
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ result: 'ok' }), { status: 200 })
      );

      const cleanDeleteReq = new Request(
        'http://localhost:3000/api/uploads/assets',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,
          },
          body: JSON.stringify({
            publicId: 'portfolio/projects/project-banner',
          }),
        }
      );
      const cleanDeleteRes = await deleteAssetRoute(cleanDeleteReq);
      expect(cleanDeleteRes.status).toBe(200);
      const deletePayload = (await cleanDeleteRes.json()) as {
        ok: boolean;
        deleted: boolean;
        remoteDestroyed: boolean;
      };
      expect(deletePayload.ok).toBe(true);
      expect(deletePayload.deleted).toBe(true);
      expect(deletePayload.remoteDestroyed).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
