import { NextResponse } from 'next/server';
import { UnauthorizedAdminError } from '@/lib/auth/request-guard';
import {
  ADMIN_SECURITY_HEADERS,
  CsrfValidationError,
} from '@/lib/security/csrf';
import { adminAuthService } from '@/services/auth-service';
import { contactService } from '@/services/contact-service';

export const dynamic = 'force-dynamic';

function handleRouteError(error: unknown) {
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
  return NextResponse.json(
    { ok: false, error: 'Failed to process message operation.' },
    { status: 500, headers: ADMIN_SECURITY_HEADERS }
  );
}

export async function GET(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const messages = await contactService.listMessages();
    return NextResponse.json(
      { ok: true, messages },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body = (await request.json()) as {
      id?: string;
      isRead?: boolean;
    };

    if (!body.id?.trim() || typeof body.isRead !== 'boolean') {
      return NextResponse.json(
        { ok: false, error: 'Message id and boolean isRead are required.' },
        { status: 400, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    const updated = await contactService.markMessageReadState(
      body.id.trim(),
      body.isRead
    );
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: 'Message not found.' },
        { status: 404, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, message: updated },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await adminAuthService.requireAdminSession(request);
    const body = (await request.json()) as { id?: string };

    if (!body.id?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Message id is required.' },
        { status: 400, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    const deleted = await contactService.deleteMessage(body.id.trim());
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: 'Message not found.' },
        { status: 404, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true, deleted: true },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
