import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { TooManyLoginAttemptsError } from '@/lib/auth/rate-limiter';
import { formatAdminSessionSetCookie } from '@/lib/auth/request-guard';
import {
  ADMIN_SECURITY_HEADERS,
  CsrfValidationError,
  verifyCsrfOrigin,
} from '@/lib/security/csrf';
import {
  adminAuthService,
  InvalidCredentialsError,
} from '@/services/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    verifyCsrfOrigin(request);
    const body: unknown = await request.json();
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0];
    const ipAddress = forwardedFor?.trim() || '127.0.0.1';
    const userAgent = request.headers.get('user-agent')?.trim() || undefined;

    const result = await adminAuthService.login(body, {
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json(
      {
        ok: true,
        user: result.user,
      },
      {
        status: 200,
        headers: {
          ...ADMIN_SECURITY_HEADERS,
          'Set-Cookie': formatAdminSessionSetCookie(result.cookieValue),
        },
      }
    );

    return response;
  } catch (error) {
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
          error: error.issues[0]?.message ?? 'Invalid login credentials.',
        },
        { status: 400, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    if (error instanceof TooManyLoginAttemptsError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            ...ADMIN_SECURITY_HEADERS,
            'Retry-After': String(error.retryAfterSeconds),
          },
        }
      );
    }

    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401, headers: ADMIN_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Authentication service unavailable.' },
      { status: 500, headers: ADMIN_SECURITY_HEADERS }
    );
  }
}
