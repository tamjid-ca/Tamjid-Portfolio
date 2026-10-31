import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UnauthorizedAdminError } from '@/lib/auth/request-guard';
import { MediaValidationError } from '@/lib/cloudinary/cloudinary';
import { CsrfValidationError } from '@/lib/security/csrf';
import { adminAuthService } from '@/services/auth-service';
import { cloudinaryMediaService } from '@/services/media-service';
import { MediaAssetInUseError } from '@/services/portfolio-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder')?.trim() || undefined;
    const assets = await cloudinaryMediaService.listAssets({ folder });

    return NextResponse.json(
      { ok: true, assets },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    if (error instanceof UnauthorizedAdminError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to list media assets.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body: unknown = await request.json();
    const asset = await cloudinaryMediaService.registerAsset(body);

    return NextResponse.json(
      { ok: true, asset },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    if (error instanceof UnauthorizedAdminError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (error instanceof CsrfValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message ?? 'Invalid media asset payload.',
        },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (error instanceof MediaValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to register media asset.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body = (await request.json()) as { publicId?: unknown };
    const publicId =
      typeof body?.publicId === 'string' ? body.publicId.trim() : '';

    if (!publicId) {
      return NextResponse.json(
        { ok: false, error: 'publicId is required.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const result = await cloudinaryMediaService.deleteAsset(publicId);
    return NextResponse.json(
      {
        ok: true,
        deleted: result.deleted,
        remoteDestroyed: result.remoteDestroyed,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    if (error instanceof UnauthorizedAdminError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (error instanceof CsrfValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (error instanceof MediaAssetInUseError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          references: error.references,
        },
        { status: 409, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (error instanceof MediaValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to delete media asset.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
