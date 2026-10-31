import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'tamjid_admin_session';

function hasUnexpiredSessionTokenFormat(rawToken: string | undefined): boolean {
  if (!rawToken) {
    return false;
  }

  const parts = rawToken.trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  try {
    const base64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const parsed = JSON.parse(json) as {
      sessionId?: unknown;
      userId?: unknown;
      exp?: unknown;
    };
    return (
      typeof parsed.sessionId === 'string' &&
      typeof parsed.userId === 'string' &&
      typeof parsed.exp === 'number' &&
      parsed.exp > Date.now()
    );
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const bearerHeader = request.headers.get('authorization');
  const bearerToken = bearerHeader?.startsWith('Bearer ')
    ? bearerHeader.slice('Bearer '.length).trim()
    : undefined;

  const hasValidTokenShape = hasUnexpiredSessionTokenFormat(
    cookieToken ?? bearerToken
  );

  // Protect /api/admin/* at edge layer (routes also independently verify signature + DB session)
  if (pathname.startsWith('/api/admin')) {
    if (!hasValidTokenShape) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized admin API request.' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'X-Robots-Tag': 'noindex, nofollow',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
          },
        }
      );
    }
  }

  // Protect /admin/* pages
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';

    if (pathname === '/admin') {
      const target = hasValidTokenShape ? '/admin/dashboard' : '/admin/login';
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (!isLoginPage && !hasValidTokenShape) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isLoginPage && hasValidTokenShape) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/auth')
  ) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate'
    );
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/:path*'],
};
