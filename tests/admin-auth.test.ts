import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as postLoginRoute } from '@/app/api/auth/login/route';
import { POST as postLogoutRoute } from '@/app/api/auth/logout/route';
import { GET as getSessionRoute } from '@/app/api/auth/session/route';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { resetAllLoginRateLimits } from '@/lib/auth/rate-limiter';
import {
  ADMIN_SESSION_COOKIE_NAME,
  createSignedSessionCookieValue,
} from '@/lib/auth/request-guard';
import { disconnectFromDatabase } from '@/lib/mongodb/connection';
import { middleware } from '@/middleware';
import { AdminSessionModel, AdminUserModel } from '@/models';
import { adminAuthService } from '@/services/auth-service';

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

    const thenable = {
      async lean() {
        return existing ? { ...existing } : null;
      },
      then(resolve: (val: unknown) => unknown) {
        return Promise.resolve(existing).then(resolve);
      },
    };
    return thenable;
  }) as (...args: unknown[]) => unknown);

  vi.spyOn(untypedModel, 'findByIdAndUpdate').mockImplementation(((
    id: unknown,
    update: { $set?: Record<string, unknown> }
  ) => {
    const key = String(id);
    const existing = records.get(key) ?? null;
    const patch = update.$set ?? update;
    let updated: StoredRecord | null = null;
    if (existing) {
      updated = {
        ...existing,
        ...patch,
        updatedAt: new Date(),
      };
      records.set(key, updated);
    }
    const thenable = {
      async lean() {
        return updated ? { ...updated } : null;
      },
      then(resolve: (val: unknown) => unknown) {
        return Promise.resolve(updated).then(resolve);
      },
    };
    return thenable;
  }) as (...args: unknown[]) => unknown);

  return records;
}

describe('Phase 5 — Admin Authentication and Authorization', () => {
  const TEST_SECRET = 'phase-5-super-secret-session-signing-key';
  const ADMIN_EMAIL = 'admin@tamjid.ca';
  const ADMIN_PASSWORD = 'Strong#Password2026!';

  beforeEach(async () => {
    vi.restoreAllMocks();
    resetAllLoginRateLimits();
    await disconnectFromDatabase();

    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/tamjid-phase5-test';
    process.env.ADMIN_SESSION_SECRET = TEST_SECRET;
    process.env.ADMIN_INITIAL_EMAIL = ADMIN_EMAIL;
    process.env.ADMIN_INITIAL_PASSWORD = ADMIN_PASSWORD;

    vi.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 1,
      configurable: true,
    });

    attachInMemoryStoreToModel(AdminUserModel);
    attachInMemoryStoreToModel(AdminSessionModel);
  });

  afterEach(async () => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 0,
      configurable: true,
    });
    resetAllLoginRateLimits();
    vi.restoreAllMocks();
    await disconnectFromDatabase();
  });

  it('hashes passwords with unique salts and verifies them using constant-time scrypt comparison', async () => {
    const hash1 = await hashPassword(ADMIN_PASSWORD);
    const hash2 = await hashPassword(ADMIN_PASSWORD);

    expect(hash1).not.toBe(hash2);
    expect(hash1.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword(ADMIN_PASSWORD, hash1)).toBe(true);
    expect(await verifyPassword('WrongPassword', hash1)).toBe(false);
    expect(await verifyPassword(ADMIN_PASSWORD, 'malformed-hash')).toBe(false);
  });

  it('logs in valid admin credentials, sets HttpOnly cookie, validates session, and revokes session on logout', async () => {
    await adminAuthService.ensureInitialAdminUser();

    const loginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Host: 'localhost:3000',
        Origin: 'http://localhost:3000',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const loginRes = await postLoginRoute(loginReq);
    expect(loginRes.status).toBe(200);
    const setCookie = loginRes.headers.get('Set-Cookie') ?? '';
    expect(setCookie).toContain(`${ADMIN_SESSION_COOKIE_NAME}=`);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');

    const cookiePair = setCookie.split(';')[0]!;

    // Verify session via GET /api/auth/session
    const sessionReq = new Request('http://localhost:3000/api/auth/session', {
      method: 'GET',
      headers: { Cookie: cookiePair },
    });
    const sessionRes = await getSessionRoute(sessionReq);
    expect(sessionRes.status).toBe(200);
    const sessionBody = (await sessionRes.json()) as {
      ok: boolean;
      authenticated: boolean;
      session: { email: string };
    };
    expect(sessionBody.authenticated).toBe(true);
    expect(sessionBody.session.email).toBe(ADMIN_EMAIL);

    // Logout via POST /api/auth/logout -> revokes session in DB
    const logoutReq = new Request('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: cookiePair,
        Host: 'localhost:3000',
        Origin: 'http://localhost:3000',
      },
    });
    const logoutRes = await postLogoutRoute(logoutReq);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers.get('Set-Cookie')).toContain('Max-Age=0');

    // Reusing the revoked session cookie now returns 401 Unauthorized
    const afterLogoutRes = await getSessionRoute(sessionReq);
    expect(afterLogoutRes.status).toBe(401);
  });

  it('enforces brute-force login rate limiting and temporary account lockout after 5 failed attempts', async () => {
    await adminAuthService.ensureInitialAdminUser();

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const badReq = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.0.113.42',
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: 'WrongPassword!',
        }),
      });
      const badRes = await postLoginRoute(badReq);
      expect(badRes.status).toBe(401);
    }

    // 5th failed attempt triggers 429 lockout
    const fifthReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.42',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: 'WrongPassword!',
      }),
    });
    const fifthRes = await postLoginRoute(fifthReq);
    expect(fifthRes.status).toBe(429);
    expect(fifthRes.headers.get('Retry-After')).toBeTruthy();

    // Even valid password from same IP/account is blocked while locked out
    const blockedValidReq = new Request(
      'http://localhost:3000/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.0.113.42',
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        }),
      }
    );
    const blockedValidRes = await postLoginRoute(blockedValidReq);
    expect(blockedValidRes.status).toBe(429);
  });

  it('blocks cross-origin state-changing requests via CSRF origin check (403 Forbidden)', async () => {
    const csrfReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Host: 'localhost:3000',
        Origin: 'https://malicious-site.example',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const csrfRes = await postLoginRoute(csrfReq);
    expect(csrfRes.status).toBe(403);
  });

  it('protects /admin/* and /api/admin/* routes in Next.js middleware and attaches security headers', () => {
    // 1. Unauthenticated /admin/dashboard -> redirects to /admin/login?next=/admin/dashboard
    const unauthPageReq = new NextRequest(
      'http://localhost:3000/admin/dashboard'
    );
    const unauthPageRes = middleware(unauthPageReq);
    expect(unauthPageRes.status).toBe(307);
    expect(unauthPageRes.headers.get('location')).toBe(
      'http://localhost:3000/admin/login?next=%2Fadmin%2Fdashboard'
    );

    // 2. Unauthenticated /api/admin/projects -> 401 JSON
    const unauthApiReq = new NextRequest(
      'http://localhost:3000/api/admin/projects'
    );
    const unauthApiRes = middleware(unauthApiReq);
    expect(unauthApiRes.status).toBe(401);
    expect(unauthApiRes.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');

    // 3. Authenticated /admin/login -> redirects to /admin/dashboard
    const validToken = createSignedSessionCookieValue(
      {
        sessionId: 'sess-999',
        userId: 'user-1',
        email: ADMIN_EMAIL,
        exp: Date.now() + 3600 * 1000,
      },
      TEST_SECRET
    );
    const authLoginReq = new NextRequest('http://localhost:3000/admin/login', {
      headers: {
        Cookie: `${ADMIN_SESSION_COOKIE_NAME}=${validToken}`,
      },
    });
    const authLoginRes = middleware(authLoginReq);
    expect(authLoginRes.status).toBe(307);
    expect(authLoginRes.headers.get('location')).toBe(
      'http://localhost:3000/admin/dashboard'
    );
  });
});
