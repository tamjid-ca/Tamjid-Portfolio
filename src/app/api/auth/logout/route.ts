import { NextResponse } from 'next/server';
import { formatClearedAdminSessionSetCookie } from '@/lib/auth/request-guard';
import {
  ADMIN_SECURITY_HEADERS,
  CsrfValidationError,
  verifyCsrfOrigin,
} from '@/lib/security/csrf';
import { adminAuthService } from '@/services/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    verifyCsrfOrigin(request);
    await adminAuthService.logout(request);

    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          ...ADMIN_SECURITY_HEADERS,
          'Set-Cookie': formatClearedAdminSessionSetCookie(),
        },
      }
    );
  } catch (error) {
    if (error instanceof CsrfValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 403, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          ...ADMIN_SECURITY_HEADERS,
          'Set-Cookie': formatClearedAdminSessionSetCookie(),
        },
      }
    );
  }
}
