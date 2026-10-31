# Tamjid Portfolio V2 — Project Context

## 1. Project Overview
- **Original Repository:** `https://github.com/tamjid-ca/Tamjid-Portfolio`
- **Live Reference:** `https://tamjid-portfolio.vercel.app/`
- **Starting Branch:** `main` (Commit `2da903fb089de501c39068d215f2ad941e1a6ba9`)
- **Target Branch:** `version2`
- **Migration Objectives:** Transform the existing static HTML/CSS/JS portfolio for **MD. Tamjid Hossain** into a production-ready, maintainable, fully dynamic, database-driven Next.js (App Router) application with MongoDB (Mongoose), Cloudinary media management, a secure Admin CMS, Dark (default) + Light themes, and subtle Three.js / WebGL motion enhancements while preserving the original website's 1:1 visual identity.
- **Technology Stack:**
  - **Frontend:** Next.js 15.5 (App Router), React 19, TypeScript 5.8, preserved native CSS (`src/app/globals.css` with semantic theme custom properties), Three.js / React Three Fiber / Drei, Lucide React (Admin CMS), custom inline Ionicons v5.5.2 SVG renderer (`src/components/ui/IonIcon.tsx`).
  - **Backend & Data:** Next.js Route Handlers & Server Actions, MongoDB, Mongoose 8.x, Zod 3.24 validation, Argon2id / `crypto.scrypt` password hashing, signed `HttpOnly` session cookies (`AdminSession` store).
  - **Media:** Cloudinary server-signed uploads, responsive URL transformations, reference-checked deletion (`MediaAsset` store).
  - **Testing:** Vitest 3.2, React Testing Library, JSDOM, Headless Chrome visual regression.
- **Current Implementation Status:** **Phase 4 Completed** (Cloudinary server-side parameter signing, strict MIME/extension/size validation, responsive URL & `srcSet` transformation helpers, `cloudinaryMediaService` with reference-checked deletion and remote destroy, authenticated `/api/uploads/sign` and `/api/uploads/assets` endpoints, and 28/28 passing tests). Ready to begin **Phase 5 — Admin Authentication and Authorization**.

---

## 2. Original Website
- **Original Design Reference:** `@codewithsadee` vCard Dark Portfolio customized for **MD. Tamjid Hossain** (`index.html` [1,123 lines], `assets/css/style.css` [1,882 lines], `assets/js/script.js` [211 lines]).
- **Existing Sections:**
  1. **Sidebar (`aside.sidebar`):** Avatar (`my-avatar.jpg`), Name (`MD. Tamjid Hossain`), Title pill (`IT enthusiast`), collapsible `"Show Contacts"` drawer (`Email`, `Phone`, `Birthday`, `Location`), Social links (`GitHub`, `LinkedIn`, `Facebook`).
  2. **Navbar (`nav.navbar`):** Tab navigation switching `<article data-page="...">` views (`About`, `Resume`, `Portfolio`, `Blog`, `Contact`).
  3. **About (`article.about`):** 2 biography paragraphs, `"What i'm doing"` services grid (4 cards), `"Testimonials"` horizontal snap-carousel (4 cards) + click-to-open Testimonial Modal (`icon-quote.svg`), `"Clients"` horizontal grayscale logo strip (6 items).
  4. **Resume (`article.resume`):** `"Education"` timeline (3 items: `ALCA` `2021 — 2026` + 2 empty rows), `"Experience"` timeline (3 items: `Creative director`, `Art director`, `Web designer`), `"My skills"` progress card (`Python` 80%, `HTML` 70%, `JavaScript` 60% label / 90% bar, `WordPress` 50%).
  5. **Portfolio (`article.portfolio`):** Category filter (`All`, `Web design`, `Applications`, `Web development`) with desktop button bar + mobile custom select dropdown, and 9 project cards (`Finance`, `Orizon`, `Fundo`, `Brawlhalla`, `DSM.`, `MetaSpark`, `Summary`, `Task Manager`, `Arrival`).
  6. **Blog (`article.blog`):** 4 blog post cards (`Design conferences in 2022`, `Design`, `Oct 15, 2023`).
  7. **Contact (`article.contact`):** Embedded Google Maps `<iframe>` (Skyview Ranch, Calgary, AB, Canada, styled with `grayscale(1) invert(1)`) and Contact Form (`fullname`, `email`, `message`, `Send Message` button).
- **Responsive Behavior:** 5 `@media` min-width breakpoints (`450px`, `580px`, `768px`, `1024px`, `1250px`).
- **Design Preservation Decisions:**
  - All original CSS rules and custom properties preserved in `src/app/globals.css`.
  - `.info_more-btn span:not(.ion-icon)` scoped so the mobile `chevron-down` `<IonIcon />` span remains visible below `580px` while text `"Show Contacts"` appears at `>=580px`.

---

## 3. Architecture
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/api/public/{contact,portfolio}`, `src/app/api/uploads/{sign,assets}`, `src/components/portfolio`, `src/components/ui`, `src/lib/{auth,cache,cloudinary,mongodb,security,validation}`, `src/models`, `src/repositories`, `src/services`, `src/seed`, `src/types`, `tests`).
- **Component & Data Layer Architecture:**
  - `src/lib/cloudinary/cloudinary.ts` & `src/lib/cloudinary/url.ts`: Server-side Cloudinary parameter signing (`signCloudinaryParams`, `createSignedUploadPayload`), MIME/extension/size validation (`validateUploadFileConstraints`), and responsive image URL transformation (`buildCloudinaryImageUrl`, `buildResponsiveSrcSet`).
  - `src/services/media-service.ts`: `cloudinaryMediaService` orchestrating signed upload creation, `MediaAsset` registration, asset listing with `referencedBy`, and reference-checked deletion (`409 Conflict` when in use) plus remote Cloudinary destroy.
  - `src/lib/auth/request-guard.ts`: HMAC-SHA256 timing-safe admin session token verification (`verifyAdminRequest`, `createSignedSessionCookieValue`).
  - `src/app/api/uploads/sign/route.ts` & `src/app/api/uploads/assets/route.ts`: Authenticated upload signing and media asset CRUD route handlers.

---

## 4. Engineering Decisions
- **Decision 1 — Preserve Native CSS Rules over Full Tailwind Rewrite:** Kept all `1,882` lines of `assets/css/style.css` in `src/app/globals.css` with `.ion-icon` selector parity.
- **Decision 2 — Inline Ionicons SVG Component:** Replaced external `unpkg.com` runtime scripts with `src/components/ui/IonIcon.tsx`, rendering crisp SVGs synchronously during SSR.
- **Decision 3 — TypeScript Incremental Build Cache in `/tmp`:** Configured `"tsBuildInfoFile": "/tmp/tsconfig.tsbuildinfo"` in `tsconfig.json` so `npm run typecheck` executes cleanly inside sandboxed environments.
- **Decision 4 — Deterministic Seed Keys & Natural Slugs for Idempotent Seeding:** Added `singletonKey: 'default'` on `SiteSettings`/`Profile` and `seedKey` (plus `slug` on `NavigationItem`, `Project`, `BlogPost`) so `seedDatabase()` can run repeatedly without creating duplicate documents.
- **Decision 5 — Decoupled Cache Tag Revalidation (`src/lib/cache/revalidate.ts`):** Separated tag constants and `revalidatePortfolioCache()` into `src/lib/cache/revalidate.ts` to avoid circular imports.
- **Decision 6 — Zero-Dependency Native Crypto Cloudinary Signing & URL Transform:** Used Node's built-in `crypto` module for Cloudinary SHA-256/SHA-1 parameter signing and pure string URL transformation (`src/lib/cloudinary/url.ts`), avoiding heavy client/server SDK bloat and keeping `CLOUDINARY_API_SECRET` strictly server-only.

---

## 5. Phase Tracker
- **Current Phase:** Phase 4 Completed (Stopped at Phase 4 gate awaiting `continue with context.md` for Phase 5)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup (`fdf2ce7`)
  - [x] **Phase 1:** Next.js Foundation (`f5932b5`)
  - [x] **Phase 2:** MongoDB and Backend Foundation (`02c832f`)
  - [x] **Phase 3:** Dynamic Public Portfolio (`5b0eee6`)
  - [x] **Phase 4:** Cloudinary Integration
- **Pending Phases:**
  - [ ] **Phase 5:** Admin Authentication and Authorization (Argon2/scrypt, `AdminUser` & `AdminSession` models, login rate limiting, CSRF verification, `/api/auth/*`, route guards, security headers)
  - [ ] **Phase 6:** Complete Admin CMS (Full CRUD dashboard for all collections, inbox, ordering, preview)
  - [ ] **Phase 7:** Dark/Light Theme (Dark default + harmonized Light mode tokens + persistence)
  - [ ] **Phase 8:** Three.js and Motion Enhancement (Lazy-loaded 3D ambient scene + reduced-motion fallback)
  - [ ] **Phase 9:** Performance, SEO and Accessibility (Metadata, sitemap, robots, CWV, WCAG audit)
  - [ ] **Phase 10:** Comprehensive QA and Security Audit (Full test suite + QA/Security/Performance/Deployment docs)
  - [ ] **Phase 11:** Production Readiness (Final verification & production readiness report)
- **Blocked Tasks:** None.

---

## 6. Completed Implementation
- **Phase 0 Deliverables:** `docs/INITIAL_AUDIT.md`, `docs/DESIGN_INVENTORY.md`, `docs/CONTENT_INVENTORY.md`, `docs/ARCHITECTURE_PLAN.md`, `docs/screenshots/baseline/*`, `AGENTS.md`, `.agents/skills/*`, `plugins/tamjid-portfolio-engineering/`.
- **Phase 1 Deliverables:** Next.js 15 App Router foundation, `src/app/globals.css`, `src/components/ui/IonIcon.tsx`, `src/components/portfolio/*`, `tests/portfolio-foundation.test.tsx`.
- **Phase 2 Deliverables:** `src/lib/mongodb/connection.ts`, `src/lib/security/sanitize.ts`, `src/lib/validation/portfolio-schemas.ts`, `src/models/*` (15 models), `src/repositories/*`, `src/services/*`, `src/seed/{seed-database,cli}.ts`, `tests/mongodb-data-layer.test.ts`.
- **Phase 3 Deliverables:** `src/lib/cache/{revalidate,portfolio-cache}.ts`, `src/app/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/api/public/portfolio/route.ts`, `tests/dynamic-public-portfolio.test.tsx`.
- **Phase 4 Deliverables:**
  - Cloudinary Signing & Validation: `src/lib/cloudinary/cloudinary.ts`, `src/lib/cloudinary/url.ts`, `src/lib/cloudinary/index.ts`.
  - Media Domain Service: `src/services/media-service.ts`.
  - Admin Request Guard: `src/lib/auth/request-guard.ts`.
  - Upload & Media API Routes: `src/app/api/uploads/sign/route.ts`, `src/app/api/uploads/assets/route.ts`.
  - Responsive Image URL Integration: `src/components/portfolio/{Sidebar,AboutSection,PortfolioSection,BlogSection}.tsx`.
  - Phase 4 Tests: `tests/cloudinary-media.test.ts`.

---

## 7. Testing
- **Phase 4 Verification Executed:**
  - **Unit, Component & Integration Tests (`npm test`):** `4` test files passed, `28/28` tests passed:
    - `tests/portfolio-foundation.test.tsx` (`7/7` passed)
    - `tests/mongodb-data-layer.test.ts` (`12/12` passed)
    - `tests/dynamic-public-portfolio.test.tsx` (`4/4` passed)
    - `tests/cloudinary-media.test.ts` (`5/5` passed: deterministic parameter signing, MIME/extension/size rejection, responsive URL & `srcSet` generation, `401` unauthenticated upload rejection, `201` asset registration, `referencedBy` tracking, `409 Conflict` in-use deletion block, and `200 OK` remote + DB deletion once unreferenced).
  - **TypeScript (`npm run typecheck`):** Passed (`tsc --noEmit` -> 0 errors).
  - **ESLint (`npm run lint`):** Passed (`eslint src tests` -> 0 errors, 0 warnings).
  - **Production Build (`npm run build`):** Passed (`Next.js 15.5.28` build succeeded cleanly).

---

## 8. Git History
- **Active Branch:** `version2`
- **Starting Commit (`main`):** `2da903fb089de501c39068d215f2ad941e1a6ba9`
- **Phase Commit References:**
  - **Phase 0:** `fdf2ce7b5d219beebe0c498ac0ce93e6dd76f23f` (`docs: add project audit and design inventory`)
  - **Phase 1:** `f5932b592d2d749f051c8009bd59a8255624aded` (`feat: implement nextjs application foundation`)
  - **Phase 2:** `02c832f` (`feat: add mongodb data layer`)
  - **Phase 3:** `5b0eee6` (`feat: implement dynamic portfolio sections`)
  - **Phase 4:** Committed at end of Phase 4 (`feat: integrate cloudinary media management`)
- **Uncommitted Changes:** None after Phase 4 commit.

---

## 9. Antigravity Configuration
- **Global Installed Plugins:** `ponytail` (`v5.3.2`)
- **Project Custom Plugin:** `tamjid-portfolio-engineering` (`plugins/tamjid-portfolio-engineering/plugin.json`)
- **Workspace Skills:** All 9 custom skills active under `.agents/skills/`.

---

## 10. Environment
- **Required Environment Variables (Names Only):**
  - `MONGODB_URI` (Present in local `.env`)
  - `ADMIN_SESSION_SECRET`
  - `ADMIN_INITIAL_EMAIL`
  - `ADMIN_INITIAL_PASSWORD`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `NEXT_PUBLIC_SITE_URL`

---

## 11. Outstanding Issues
- None blocking.

---

## 12. Next Actions
- **Next Phase:** **PHASE 5 — Admin Authentication and Authorization**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Read `.agents/skills/secure-admin-cms/SKILL.md`.
  2. Implement `AdminUser` and `AdminSession` Mongoose models (`src/models/AdminUser.ts`, `src/models/AdminSession.ts`) with TTL index on `expiresAt` and lockout counters (`failedLoginAttempts`, `lockedUntil`).
  3. Implement password hashing (`crypto.scrypt` with random salt and timing-safe comparison), login rate limiting (`src/lib/auth/rate-limiter.ts`), CSRF origin verification (`src/lib/security/csrf.ts`), and `adminAuthService` (`src/services/auth-service.ts`) supporting initial admin provisioning (`seedAdminUser`), login, logout, session validation (`requireAdminSession`), and account lockout after repeated failures.
  4. Implement `/api/auth/login/route.ts`, `/api/auth/logout/route.ts`, and `/api/auth/session/route.ts` setting `HttpOnly`, `Secure` (in production), `SameSite=Lax` session cookies.
  5. Implement Next.js `src/middleware.ts` for `/admin/*` route protection and security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).
  6. Write and execute Phase 5 authentication & security tests (`tests/admin-auth.test.ts`).
  7. Update `context.md` and commit Phase 5 (`feat: add secure admin authentication`).

---

## 13. User Feedback
- `2026-10-30`: User issued `continue with context.md` to proceed from Phase 3 to Phase 4. Completed Phase 4 and stopped at the Phase 4 gate awaiting `continue with context.md`.
