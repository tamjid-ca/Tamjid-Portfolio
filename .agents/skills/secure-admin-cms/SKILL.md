---
name: secure-admin-cms
description: >-
  Use this skill when implementing admin authentication, session management,
  rate limiting, CSRF protection, or Admin CMS CRUD interfaces and endpoints.
---

# Secure Admin CMS Skill

## When to Use
- Implementing `src/lib/auth/`, `src/lib/security/`, `/api/auth/*`, `/api/admin/*`, or `/admin/*` UI pages.
- Reviewing security of admin mutations, password storage, and session cookies.

## Required Inputs
- `docs/ARCHITECTURE_PLAN.md`
- `docs/CONTENT_INVENTORY.md`

## Step-by-Step Workflow
1. **Password Security:** Hash admin passwords using Argon2id (or salted high-cost `crypto.scrypt` with timing-safe comparison `crypto.timingSafeEqual`). Never store plaintext passwords or expose password hashes in DTOs.
2. **Server-Revocable Sessions:** Issue signed session tokens stored in `HttpOnly`, `Secure` (in production), `SameSite=Lax`, `Path=/` cookies backed by a hashed `AdminSession` record in MongoDB with expiration and revocation support.
3. **Brute-Force & Rate Limiting:** Enforce IP and account-level rate limiting on `/api/auth/login` (e.g., max 5 failed attempts per 15-minute window before temporary lockout).
4. **Independent Server Authorization:** Call `requireAdminSession()` inside every `/api/admin/*` handler and Server Action before parsing or mutating data. Verify CSRF `Origin`/`Host` headers on all state-changing requests.
5. **Complete Content Control:** Ensure every editable field identified in `docs/CONTENT_INVENTORY.md` has a validated form, loading/empty/error states, confirmation modal for deletions, and immediate public cache invalidation upon save.

## Quality Checklist
- [ ] No public registration endpoint exists.
- [ ] Every `/api/admin/*` route returns `401 Unauthorized` when called without a valid session.
- [ ] Destructive operations require explicit confirmation in the UI and reference checks on the server.
- [ ] Admin responses include `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.

## Common Mistakes
- Relying only on `middleware.ts` to protect `/admin` while leaving `/api/admin/*` or Server Actions unguarded.
- Returning verbose stack traces or internal database errors to unauthenticated callers.

## Verification Requirements
- Automated tests verify valid/invalid login, rate-limit lockout, session expiration/revocation, CSRF checks, and `401` enforcement across all admin endpoints.
