# Tamjid Portfolio V2 — Security Review & Audit Report

## 1. Authentication & Password Security
- **Salted `crypto.scrypt` Password Hashing (`src/lib/auth/password.ts`):**
  - Admin passwords are hashed with a cryptographically random 16-byte salt using Node's `crypto.scrypt` (`N = 16384`, `r = 8`, `p = 1`, 64-byte key length).
  - Password verification uses `crypto.timingSafeEqual` to prevent timing side-channel attacks.
  - Plaintext passwords are never logged or persisted, and `passwordHash` is excluded from `AdminUserDTO`.
- **No Public Registration:**
  - No public signup endpoint exists. The initial admin account is provisioned exclusively via server-side environment variables (`ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD`) through `adminAuthService.ensureInitialAdminUser()`.

---

## 2. Session Management & Dual-Layer Authorization
- **Signed `HttpOnly` Session Cookies (`src/lib/auth/request-guard.ts`):**
  - Session tokens are signed with HMAC-SHA256 using `ADMIN_SESSION_SECRET` and delivered via `Set-Cookie: tamjid_admin_session=...; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure (in production)`.
- **Server-Revocable Database Sessions (`src/models/AdminSession.ts`):**
  - Every issued token is hashed with SHA-256 (`tokenHash`) and stored in `AdminSessionModel` with a MongoDB TTL index (`expiresAt`) and `revokedAt` timestamp.
  - Logging out via `POST /api/auth/logout` clears the browser cookie and marks `revokedAt = new Date()` in MongoDB so captured tokens are immediately invalidated server-side.
- **Independent Server Authorization (`adminAuthService.requireAdminSession`):**
  - Every handler in `/api/admin/portfolio`, `/api/admin/messages`, `/api/uploads/sign`, and `/api/uploads/assets`, as well as `/admin/dashboard` and `/admin/[section]` Server Components, independently verifies both the HMAC cookie signature and the active `AdminSession` record in MongoDB rather than relying solely on Edge Middleware.

---

## 3. Brute-Force Protection & Rate Limiting
- **Sliding-Window Rate Limiter (`src/lib/auth/rate-limiter.ts`):**
  - Tracks failed login attempts per IP and email (`MAX_LOGIN_ATTEMPTS = 5` within a 15-minute window, enforcing a 15-minute temporary lockout returning `429 Too Many Requests` with `Retry-After`).
- **Database Account Lockout (`src/models/AdminUser.ts`):**
  - Persists `failedLoginAttempts` and `lockedUntil` on the `AdminUser` document so lockouts survive serverless cold starts.

---

## 4. CSRF, NoSQL Injection & XSS Defenses
- **CSRF Origin Verification (`src/lib/security/csrf.ts`):**
  - `verifyCsrfOrigin(request)` inspects `Origin` against `Host` / `X-Forwarded-Host` / `NEXT_PUBLIC_SITE_URL` on all `POST`, `PUT`, `PATCH`, and `DELETE` requests, rejecting cross-origin mutations with `403 Forbidden`.
- **Recursive NoSQL Operator Stripping (`src/lib/security/sanitize.ts`):**
  - `stripMongoOperators()` recursively removes any object key starting with `$` or containing `.` before Zod validation and Mongoose persistence.
- **Strict Zod Input Validation (`src/lib/validation/portfolio-schemas.ts`):**
  - Every external payload (Admin CRUD, Contact form, Auth login, Media upload signing) is validated with Zod schemas that enforce string length bounds, URL protocol whitelisting (`http:`, `https:`, `/`, `mailto:`, `tel:`), and reject `<script>` / `javascript:` injection vectors.

---

## 5. Media Upload Security & Reference Integrity
- **Server-Only Upload Signatures (`src/lib/cloudinary/cloudinary.ts`):**
  - `CLOUDINARY_API_SECRET` never leaves the server. `/api/uploads/sign` requires an authenticated admin session, validates folder prefixes (`tamjid-portfolio/*`) and allowed image formats (`jpg`, `jpeg`, `png`, `webp`, `avif`, `gif`, `svg`) with a 10 MB cap.
- **Reference-Checked Media Deletion (`src/services/portfolio-service.ts`):**
  - `deleteMediaAssetSafely()` scans `SiteSettings`, `Profile`, `Service`, `Testimonial`, `ClientLogo`, `Project`, and `BlogPost` documents before allowing deletion, returning `409 Conflict` (`MediaAssetInUseError`) if the asset is still referenced.

---

## 6. Security Headers & Indexing Isolation
- `src/middleware.ts` and `ADMIN_SECURITY_HEADERS` enforce on all `/admin/*` and `/api/admin/*` routes:
  - `Cache-Control: no-store, no-cache, must-revalidate`
  - `X-Robots-Tag: noindex, nofollow`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- `src/app/robots.ts` explicitly disallows `/admin`, `/admin/`, `/api`, and `/api/`.
