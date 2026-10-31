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
1. Hash admin passwords using Argon2id (or salted high-cost `crypto.scrypt` with `crypto.timingSafeEqual`).
2. Issue signed session tokens stored in `HttpOnly`, `Secure` (in production), `SameSite=Lax` cookies backed by a revocable `AdminSession` record.
3. Enforce IP and account-level rate limiting on `/api/auth/login`.
4. Call `requireAdminSession()` inside every `/api/admin/*` handler and Server Action before parsing or mutating data.
5. Ensure every editable field identified in `docs/CONTENT_INVENTORY.md` has a validated form and immediate public cache invalidation upon save.

## Quality Checklist
- [ ] No public registration endpoint exists.
- [ ] Every `/api/admin/*` route returns `401 Unauthorized` when called without a valid session.
- [ ] Admin responses include `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.

## Common Mistakes
- Relying only on `middleware.ts` to protect `/admin` while leaving `/api/admin/*` or Server Actions unguarded.

## Verification Requirements
- Automated tests verify valid/invalid login, rate-limit lockout, session expiration/revocation, CSRF checks, and `401` enforcement across all admin endpoints.
