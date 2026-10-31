import { NextResponse } from 'next/server';
import { UnauthorizedAdminError } from '@/lib/auth/request-guard';
import { ADMIN_SECURITY_HEADERS } from '@/lib/security/csrf';
import { adminAuthService } from '@/services/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await adminAuthService.requireAdminSession(request);
    return NextResponse.json(
      {
        ok: true,
        authenticated: true,
        session: {
          sessionId: session.sessionId,
          userId: session.userId,
          email: session.email,
          exp: session.exp,
        },
      },
      { status: 200, headers: ADMIN_SECURITY_HEADERS }
    );
  } catch (error) {
    if (error instanceof UnauthorizedAdminError) {
      return NextResponse.json(
        { ok: false, authenticated: false, error: error.message },
        { status: 401, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: false, authenticated: false, error: 'Session verification failed.' },
      { status: 401, headers: ADMIN_SECURITY_HEADERS }
    );
  }
}
