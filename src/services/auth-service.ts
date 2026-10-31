import crypto from 'crypto';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  LOGIN_LOCKOUT_WINDOW_MS,
  MAX_LOGIN_ATTEMPTS,
  recordFailedLoginAttempt,
  TooManyLoginAttemptsError,
} from '@/lib/auth/rate-limiter';
import {
  ADMIN_SESSION_TTL_SECONDS,
  createSignedSessionCookieValue,
  extractSessionTokenFromRequest,
  hashSessionToken,
  UnauthorizedAdminError,
  verifyAdminRequest,
  type SignedAdminTokenPayload,
} from '@/lib/auth/request-guard';
import { connectToDatabase } from '@/lib/mongodb/connection';
import { validateAndSanitize } from '@/lib/validation/portfolio-schemas';
import {
  AdminSessionModel,
  AdminUserModel,
  type AdminSessionDocument,
  type AdminUserDocument,
} from '@/models';

export const loginInputSchema = z.object({
  email: z.string().trim().email('Valid email is required.').max(200),
  password: z.string().min(1, 'Password is required.').max(256),
});

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid email or password.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export interface AdminUserDTO {
  id: string;
  email: string;
  role: 'admin';
  lastLoginAt: string | null;
}

export interface AdminLoginResult {
  user: AdminUserDTO;
  session: SignedAdminTokenPayload;
  cookieValue: string;
}

function serializeAdminUser(doc: {
  _id: unknown;
  email: string;
  role: 'admin';
  lastLoginAt?: Date | null;
}): AdminUserDTO {
  return {
    id: String(doc._id),
    email: doc.email,
    role: doc.role,
    lastLoginAt:
      doc.lastLoginAt instanceof Date ? doc.lastLoginAt.toISOString() : null,
  };
}

export const adminAuthService = {
  /**
   * Idempotently provisions the initial admin account from environment variables
   * (`ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD`) or explicit overrides.
   */
  async ensureInitialAdminUser(options?: {
    email?: string;
    password?: string;
  }): Promise<AdminUserDTO | null> {
    const email = (
      options?.email ??
      process.env.ADMIN_INITIAL_EMAIL ??
      ''
    )
      .trim()
      .toLowerCase();
    const password = options?.password ?? process.env.ADMIN_INITIAL_PASSWORD ?? '';

    if (!email || !password) {
      return null;
    }

    await connectToDatabase({ strict: false });
    const passwordHash = await hashPassword(password);

    const existing = await AdminUserModel.findOne({ email }).lean<
      AdminUserDocument | null
    >();
    if (existing) {
      return serializeAdminUser(existing);
    }

    const created = await AdminUserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          passwordHash,
          role: 'admin',
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean<AdminUserDocument>();

    return serializeAdminUser(created!);
  },

  async login(
    rawInput: unknown,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AdminLoginResult> {
    const validated = validateAndSanitize(loginInputSchema, rawInput);
    const normalizedEmail = validated.email.toLowerCase();
    const rateLimitKey = `${metadata?.ipAddress ?? 'unknown-ip'}:${normalizedEmail}`;

    checkLoginRateLimit(rateLimitKey);

    await connectToDatabase({ strict: false });

    // Provision initial admin if configured in env and not yet created
    if (
      process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase() ===
        normalizedEmail &&
      process.env.ADMIN_INITIAL_PASSWORD
    ) {
      await this.ensureInitialAdminUser();
    }

    const userDoc = await AdminUserModel.findOne({
      email: normalizedEmail,
    }).lean<AdminUserDocument | null>();

    if (!userDoc) {
      recordFailedLoginAttempt(rateLimitKey);
      throw new InvalidCredentialsError();
    }

    const now = Date.now();
    if (
      userDoc.lockedUntil &&
      new Date(userDoc.lockedUntil).getTime() > now
    ) {
      const retrySeconds = Math.max(
        1,
        Math.ceil((new Date(userDoc.lockedUntil).getTime() - now) / 1000)
      );
      throw new TooManyLoginAttemptsError(retrySeconds);
    }

    const isPasswordValid = await verifyPassword(
      validated.password,
      userDoc.passwordHash
    );

    if (!isPasswordValid) {
      recordFailedLoginAttempt(rateLimitKey);
      const nextFailures = (userDoc.failedLoginAttempts ?? 0) + 1;
      const lockedUntil =
        nextFailures >= MAX_LOGIN_ATTEMPTS
          ? new Date(now + LOGIN_LOCKOUT_WINDOW_MS)
          : null;

      await AdminUserModel.findByIdAndUpdate(userDoc._id, {
        $set: {
          failedLoginAttempts: nextFailures,
          lockedUntil,
        },
      });

      if (lockedUntil) {
        throw new TooManyLoginAttemptsError(
          Math.ceil(LOGIN_LOCKOUT_WINDOW_MS / 1000)
        );
      }
      throw new InvalidCredentialsError();
    }

    // Successful login: clear counters and create server-backed session
    clearLoginRateLimit(rateLimitKey);
    const loginTime = new Date(now);
    const updatedUser = await AdminUserModel.findByIdAndUpdate(
      userDoc._id,
      {
        $set: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: loginTime,
        },
      },
      { new: true }
    ).lean<AdminUserDocument | null>();

    const sessionId = crypto.randomUUID();
    const exp = now + ADMIN_SESSION_TTL_SECONDS * 1000;
    const tokenPayload: SignedAdminTokenPayload = {
      sessionId,
      userId: String(userDoc._id),
      email: userDoc.email,
      exp,
    };

    const cookieValue = createSignedSessionCookieValue(tokenPayload);
    const tokenHash = hashSessionToken(cookieValue);

    await AdminSessionModel.create({
      sessionId,
      tokenHash,
      userId: String(userDoc._id),
      email: userDoc.email,
      expiresAt: new Date(exp),
      revokedAt: null,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return {
      user: serializeAdminUser(updatedUser ?? userDoc),
      session: tokenPayload,
      cookieValue,
    };
  },

  async logout(request: Request): Promise<boolean> {
    const rawToken = extractSessionTokenFromRequest(request);
    if (!rawToken) {
      return false;
    }

    try {
      const payload = verifyAdminRequest(request);
      await connectToDatabase({ strict: false });
      await AdminSessionModel.findOneAndUpdate(
        { sessionId: payload.sessionId },
        { $set: { revokedAt: new Date() } }
      );
      return true;
    } catch {
      return false;
    }
  },

  async requireAdminSession(
    request: Request
  ): Promise<SignedAdminTokenPayload> {
    const payload = verifyAdminRequest(request);

    const conn = await connectToDatabase({ strict: false });
    if (conn) {
      const sessionDoc = await AdminSessionModel.findOne({
        sessionId: payload.sessionId,
      }).lean<AdminSessionDocument | null>();

      if (sessionDoc) {
        if (sessionDoc.revokedAt !== null) {
          throw new UnauthorizedAdminError('Admin session has been revoked.');
        }
        if (new Date(sessionDoc.expiresAt).getTime() <= Date.now()) {
          throw new UnauthorizedAdminError('Admin session has expired.');
        }
      }
    }

    return payload;
  },
};
