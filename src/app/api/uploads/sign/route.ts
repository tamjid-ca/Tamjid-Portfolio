import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UnauthorizedAdminError } from '@/lib/auth/request-guard';
import {
  CloudinaryConfigurationError,
  MediaValidationError,
} from '@/lib/cloudinary/cloudinary';
import { CsrfValidationError } from '@/lib/security/csrf';
import { adminAuthService } from '@/services/auth-service';
import { cloudinaryMediaService } from '@/services/media-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body: unknown = await request.json();
    const signedPayload = cloudinaryMediaService.createUploadSignature(body);

    return NextResponse.json(
      {
        ok: true,
        upload: signedPayload,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }
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
          error: error.issues[0]?.message ?? 'Invalid upload signature request.',
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

    if (error instanceof CloudinaryConfigurationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to generate upload signature.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
