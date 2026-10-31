import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UnauthorizedAdminError } from '@/lib/auth/request-guard';
import { revalidatePortfolioCache } from '@/lib/cache/revalidate';
import {
  ADMIN_SECURITY_HEADERS,
  CsrfValidationError,
} from '@/lib/security/csrf';
import { seedDatabase } from '@/seed/seed-database';
import { adminAuthService } from '@/services/auth-service';
import { contactService } from '@/services/contact-service';
import { cloudinaryMediaService } from '@/services/media-service';
import { portfolioService } from '@/services/portfolio-service';

export const dynamic = 'force-dynamic';

type CollectionEntityName =
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
  | 'blogPosts';

const COLLECTION_ENTITIES = new Set<CollectionEntityName>([
  'socialLinks',
  'navigationItems',
  'services',
  'testimonials',
  'clients',
  'education',
  'experience',
  'skills',
  'achievements',
  'projects',
  'blogPosts',
]);

function isCollectionEntity(val: unknown): val is CollectionEntityName {
  return (
    typeof val === 'string' &&
    COLLECTION_ENTITIES.has(val as CollectionEntityName)
  );
}

function handleAdminRouteError(error: unknown) {
  if (error instanceof UnauthorizedAdminError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 401, headers: ADMIN_SECURITY_HEADERS }
    );
  }

  if (error instanceof CsrfValidationError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 403, headers: ADMIN_SECURITY_HEADERS }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.issues[0]?.message ?? 'Validation failed.',
        issues: error.issues,
      },
      { status: 400, headers: ADMIN_SECURITY_HEADERS }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Admin operation failed.',
    },
    { status: 500, headers: ADMIN_SECURITY_HEADERS }
  );
}

export async function GET(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const [data, messages, mediaAssets] = await Promise.all([
      portfolioService.getAdminPortfolioData(),
      contactService.listMessages(),
      cloudinaryMediaService.listAssets(),
    ]);

    return NextResponse.json(
      {
        ok: true,
        data,
        messages,
        mediaAssets,
      },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleAdminRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body = (await request.json()) as {
      action?: string;
      entity?: string;
      payload?: unknown;
    };

    if (body.action === 'seed') {
      const summary = await seedDatabase();
      revalidatePortfolioCache();
      return NextResponse.json(
        { ok: true, summary },
        { status: 200, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    if (!isCollectionEntity(body.entity)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported collection entity.' },
        { status: 400, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    const createHandlers: Record<
      CollectionEntityName,
      (payload: unknown) => Promise<unknown>
    > = {
      socialLinks: (p) => portfolioService.createSocialLink(p),
      navigationItems: (p) => portfolioService.createNavigationItem(p),
      services: (p) => portfolioService.createService(p),
      testimonials: (p) => portfolioService.createTestimonial(p),
      clients: (p) => portfolioService.createClientLogo(p),
      education: (p) => portfolioService.createEducation(p),
      experience: (p) => portfolioService.createExperience(p),
      skills: (p) => portfolioService.createSkill(p),
      achievements: (p) => portfolioService.createAchievement(p),
      projects: (p) => portfolioService.createProject(p),
      blogPosts: (p) => portfolioService.createBlogPost(p),
    };

    const created = await createHandlers[body.entity](body.payload);
    return NextResponse.json(
      { ok: true, item: created },
      { status: 201, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleAdminRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body = (await request.json()) as {
      entity?: string;
      id?: string;
      payload?: unknown;
    };

    if (body.entity === 'siteSettings') {
      const updated = await portfolioService.updateSiteSettings(body.payload);
      return NextResponse.json(
        { ok: true, item: updated },
        { status: 200, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    if (body.entity === 'profile') {
      const updated = await portfolioService.updateProfile(body.payload);
      return NextResponse.json(
        { ok: true, item: updated },
        { status: 200, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    if (!isCollectionEntity(body.entity) || !body.id?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Valid entity and item id are required.' },
        { status: 400, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    const id = body.id.trim();
    const updateHandlers: Record<
      CollectionEntityName,
      (itemId: string, payload: unknown) => Promise<unknown>
    > = {
      socialLinks: (itemId, p) => portfolioService.updateSocialLink(itemId, p),
      navigationItems: (itemId, p) =>
        portfolioService.updateNavigationItem(itemId, p),
      services: (itemId, p) => portfolioService.updateService(itemId, p),
      testimonials: (itemId, p) =>
        portfolioService.updateTestimonial(itemId, p),
      clients: (itemId, p) => portfolioService.updateClientLogo(itemId, p),
      education: (itemId, p) => portfolioService.updateEducation(itemId, p),
      experience: (itemId, p) => portfolioService.updateExperience(itemId, p),
      skills: (itemId, p) => portfolioService.updateSkill(itemId, p),
      achievements: (itemId, p) =>
        portfolioService.updateAchievement(itemId, p),
      projects: (itemId, p) => portfolioService.updateProject(itemId, p),
      blogPosts: (itemId, p) => portfolioService.updateBlogPost(itemId, p),
    };

    const updated = await updateHandlers[body.entity](id, body.payload);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: 'Item not found.' },
        { status: 404, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, item: updated },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleAdminRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body = (await request.json()) as {
      action?: string;
      collection?: string;
      orderedIds?: unknown;
    };

    if (
      body.action !== 'reorder' ||
      !isCollectionEntity(body.collection) ||
      !Array.isArray(body.orderedIds)
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid reorder request.' },
        { status: 400, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    await portfolioService.reorderCollection(body.collection, {
      orderedIds: body.orderedIds,
    });

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleAdminRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body = (await request.json()) as {
      entity?: string;
      id?: string;
    };

    if (!isCollectionEntity(body.entity) || !body.id?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Valid entity and item id are required.' },
        { status: 400, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    const id = body.id.trim();
    const deleteHandlers: Record<
      CollectionEntityName,
      (itemId: string) => Promise<boolean>
    > = {
      socialLinks: (itemId) => portfolioService.deleteSocialLink(itemId),
      navigationItems: (itemId) =>
        portfolioService.deleteNavigationItem(itemId),
      services: (itemId) => portfolioService.deleteService(itemId),
      testimonials: (itemId) => portfolioService.deleteTestimonial(itemId),
      clients: (itemId) => portfolioService.deleteClientLogo(itemId),
      education: (itemId) => portfolioService.deleteEducation(itemId),
      experience: (itemId) => portfolioService.deleteExperience(itemId),
      skills: (itemId) => portfolioService.deleteSkill(itemId),
      achievements: (itemId) => portfolioService.deleteAchievement(itemId),
      projects: (itemId) => portfolioService.deleteProject(itemId),
      blogPosts: (itemId) => portfolioService.deleteBlogPost(itemId),
    };

    const deleted = await deleteHandlers[body.entity](id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: 'Item not found.' },
        { status: 404, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, deleted: true },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleAdminRouteError(error);
  }
}
