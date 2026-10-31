import crypto from 'crypto';
import { verifyCsrfOrigin } from '@/lib/security/csrf';

export const ADMIN_SESSION_COOKIE_NAME = 'tamjid_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export class UnauthorizedAdminError extends Error {
  constructor(message = 'Unauthorized admin request.') {
    super(message);
    this.name = 'UnauthorizedAdminError';
  }
}

export interface SignedAdminTokenPayload {
  sessionId: string;
  userId: string;
  email: string;
  exp: number;
}

function getSigningSecret(): string {
  const secret = (process.env.ADMIN_SESSION_SECRET ?? '').trim();
  if (!secret) {
    throw new UnauthorizedAdminError(
      'ADMIN_SESSION_SECRET is not configured on the server.'
    );
  }
  return secret;
}

export function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function createSignedSessionCookieValue(
  payload: SignedAdminTokenPayload,
  secretOverride?: string
): string {
  const secret = (secretOverride ?? getSigningSecret()).trim();
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url'
  );
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifySignedSessionCookieValue(
  cookieValue: string,
  secretOverride?: string
): SignedAdminTokenPayload {
  const secret = (secretOverride ?? getSigningSecret()).trim();
  const parts = cookieValue.trim().split('.');
  if (parts.length !== 2) {
    throw new UnauthorizedAdminError('Malformed admin session token.');
  }

  const [encodedPayload, providedSignature] = parts as [string, string];
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  const providedBuf = Buffer.from(providedSignature, 'utf8');
  const expectedBuf = Buffer.from(expectedSignature, 'utf8');

  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    throw new UnauthorizedAdminError('Invalid admin session signature.');
  }

  let parsed: SignedAdminTokenPayload;
  try {
    parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as SignedAdminTokenPayload;
  } catch {
    throw new UnauthorizedAdminError('Invalid admin session payload.');
  }

  if (
    !parsed ||
    typeof parsed.sessionId !== 'string' ||
    typeof parsed.userId !== 'string' ||
    typeof parsed.email !== 'string' ||
    typeof parsed.exp !== 'number'
  ) {
    throw new UnauthorizedAdminError('Incomplete admin session payload.');
  }

  if (Date.now() >= parsed.exp) {
    throw new UnauthorizedAdminError('Admin session has expired.');
  }

  return parsed;
}

export function extractSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') ?? '';
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const pair of cookies) {
      if (pair.startsWith(`${ADMIN_SESSION_COOKIE_NAME}=`)) {
        const value = pair.slice(`${ADMIN_SESSION_COOKIE_NAME}=`.length).trim();
        if (value) {
          return decodeURIComponent(value);
        }
      }
    }
  }

  const authHeader = request.headers.get('authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim();
    if (bearer) {
      return bearer;
    }
  }

  return null;
}

export function verifyAdminRequest(
  request: Request,
  secretOverride?: string
): SignedAdminTokenPayload {
  verifyCsrfOrigin(request);
  const token = extractSessionTokenFromRequest(request);
  if (!token) {
    throw new UnauthorizedAdminError('Missing admin session credentials.');
  }
  return verifySignedSessionCookieValue(token, secretOverride);
}

export function formatAdminSessionSetCookie(
  cookieValue: string,
  maxAgeSeconds = ADMIN_SESSION_TTL_SECONDS
): string {
  const secureAttr = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(
    cookieValue
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureAttr}`;
}

export function formatClearedAdminSessionSetCookie(): string {
  const secureAttr = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ADMIN_SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureAttr}`;
}
