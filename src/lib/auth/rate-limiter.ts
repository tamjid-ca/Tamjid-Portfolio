export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitBucket {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const loginRateLimitStore = new Map<string, RateLimitBucket>();

export class TooManyLoginAttemptsError extends Error {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(
      `Too many failed login attempts. Please try again in ${retryAfterSeconds} seconds.`
    );
    this.name = 'TooManyLoginAttemptsError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function checkLoginRateLimit(key: string, now = Date.now()): void {
  const normalizedKey = key.trim().toLowerCase();
  const bucket = loginRateLimitStore.get(normalizedKey);
  if (!bucket) {
    return;
  }

  if (bucket.lockedUntil && now < bucket.lockedUntil) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.lockedUntil - now) / 1000)
    );
    throw new TooManyLoginAttemptsError(retryAfterSeconds);
  }

  if (now - bucket.firstAttemptAt >= LOGIN_LOCKOUT_WINDOW_MS) {
    loginRateLimitStore.delete(normalizedKey);
  }
}

export function recordFailedLoginAttempt(
  key: string,
  now = Date.now()
): { attempts: number; lockedUntil: number | null } {
  const normalizedKey = key.trim().toLowerCase();
  const existing = loginRateLimitStore.get(normalizedKey);

  if (!existing || now - existing.firstAttemptAt >= LOGIN_LOCKOUT_WINDOW_MS) {
    const fresh: RateLimitBucket = {
      attempts: 1,
      firstAttemptAt: now,
      lockedUntil: null,
    };
    loginRateLimitStore.set(normalizedKey, fresh);
    return { attempts: 1, lockedUntil: null };
  }

  existing.attempts += 1;
  if (existing.attempts >= MAX_LOGIN_ATTEMPTS) {
    existing.lockedUntil = now + LOGIN_LOCKOUT_WINDOW_MS;
  }
  loginRateLimitStore.set(normalizedKey, existing);
  return {
    attempts: existing.attempts,
    lockedUntil: existing.lockedUntil,
  };
}

export function clearLoginRateLimit(key: string): void {
  loginRateLimitStore.delete(key.trim().toLowerCase());
}

export function resetAllLoginRateLimits(): void {
  loginRateLimitStore.clear();
}
