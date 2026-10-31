# Tamjid Portfolio V2 — Project Context

## 1. Project Overview
- **Original Repository:** `https://github.com/tamjid-ca/Tamjid-Portfolio`
- **Live Reference:** `https://tamjid-portfolio.vercel.app/`
- **Starting Branch:** `main` (Commit `2da903fb089de501c39068d215f2ad941e1a6ba9`)
- **Target Branch:** `version2`
- **Migration Objectives:** Transform the existing static HTML/CSS/JS portfolio for **MD. Tamjid Hossain** into a production-ready, maintainable, fully dynamic, database-driven Next.js (App Router) application with MongoDB (Mongoose), Cloudinary media management, a secure Admin CMS, Dark (default) + Light themes, and subtle Three.js / WebGL motion enhancements while preserving the original website's 1:1 visual identity.
- **Technology Stack:**
  - **Frontend:** Next.js 15.5 (App Router), React 19, TypeScript 5.8, preserved native CSS (`src/app/globals.css` with semantic theme custom properties), Three.js / React Three Fiber / Drei, Lucide React (Admin CMS), custom inline Ionicons v5.5.2 SVG renderer (`src/components/ui/IonIcon.tsx`).
  - **Backend & Data:** Next.js Route Handlers & Server Actions, MongoDB, Mongoose 8.x, Zod 3.24 validation, salted `crypto.scrypt` password hashing, signed `HttpOnly` session cookies (`AdminSession` store).
  - **Media:** Cloudinary server-signed uploads, responsive URL transformations, reference-checked deletion (`MediaAsset` store).
  - **Testing:** Vitest 3.2, React Testing Library, JSDOM, Headless Chrome visual regression.
- **Current Implementation Status:** **Phase 5 Completed** (`AdminUser` & `AdminSession` Mongoose models, salted `crypto.scrypt` password hashing with constant-time verification, IP & account brute-force lockout rate limiting, CSRF origin verification, `adminAuthService` with server-revocable sessions, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session` endpoints, Next.js `src/middleware.ts` route protection & security headers, and 33/33 passing tests). Ready to begin **Phase 6 — Complete Admin CMS**.

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
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/api/auth/{login,logout,session}`, `src/app/api/public/{contact,portfolio}`, `src/app/api/uploads/{sign,assets}`, `src/components/portfolio`, `src/components/ui`, `src/lib/{auth,cache,cloudinary,mongodb,security,validation}`, `src/models`, `src/repositories`, `src/services`, `src/seed`, `src/types`, `src/middleware.ts`, `tests`).
- **Authentication & Security Layer Architecture:**
  - `src/models/AdminUser.ts` & `src/models/AdminSession.ts`: Stores admin credentials (`passwordHash`, `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`) and server-revocable sessions (`sessionId`, `tokenHash`, `expiresAt` with TTL index, `revokedAt`).
  - `src/lib/auth/password.ts`: Salted `crypto.scrypt` hashing (`hashPassword`) and constant-time comparison (`verifyPassword`).
  - `src/lib/auth/rate-limiter.ts`: Sliding-window brute-force rate limiter (`MAX_LOGIN_ATTEMPTS = 5`, `15m` lockout).
  - `src/lib/security/csrf.ts`: Same-origin CSRF verification (`verifyCsrfOrigin`) and `ADMIN_SECURITY_HEADERS`.
  - `src/services/auth-service.ts`: `adminAuthService` (`ensureInitialAdminUser`, `login`, `logout`, `requireAdminSession`).
  - `src/middleware.ts`: Edge protection for `/admin/*` and `/api/admin/*` plus `noindex, nofollow` and `X-Frame-Options: DENY` headers.

---

## 4. Engineering Decisions
- **Decision 1 — Preserve Native CSS Rules over Full Tailwind Rewrite:** Kept all `1,882` lines of `assets/css/style.css` in `src/app/globals.css` with `.ion-icon` selector parity.
- **Decision 2 — Inline Ionicons SVG Component:** Replaced external `unpkg.com` runtime scripts with `src/components/ui/IonIcon.tsx`, rendering crisp SVGs synchronously during SSR.
- **Decision 3 — TypeScript Incremental Build Cache in `/tmp`:** Configured `"tsBuildInfoFile": "/tmp/tsconfig.tsbuildinfo"` in `tsconfig.json` so `npm run typecheck` executes cleanly inside sandboxed environments.
- **Decision 4 — Deterministic Seed Keys & Natural Slugs for Idempotent Seeding:** Added `singletonKey: 'default'` on `SiteSettings`/`Profile` and `seedKey` (plus `slug` on `NavigationItem`, `Project`, `BlogPost`) so `seedDatabase()` can run repeatedly without creating duplicate documents.
- **Decision 5 — Decoupled Cache Tag Revalidation (`src/lib/cache/revalidate.ts`):** Separated tag constants and `revalidatePortfolioCache()` into `src/lib/cache/revalidate.ts` to avoid circular imports.
- **Decision 6 — Zero-Dependency Native Crypto Cloudinary Signing & URL Transform:** Used Node's built-in `crypto` module for Cloudinary SHA-256/SHA-1 parameter signing and pure string URL transformation (`src/lib/cloudinary/url.ts`).
- **Decision 7 — Dual-Layer Admin Session Security (Signed Cookie + Server-Revocable DB Session):** Combined HMAC-SHA256 signed `HttpOnly` cookies (for fast Edge Middleware checks) with server-backed `AdminSession` records in MongoDB verified by `adminAuthService.requireAdminSession()` on every API route and mutation, enabling instant server-side session revocation upon logout.

---

## 5. Phase Tracker
- **Current Phase:** Phase 5 Completed (Stopped at Phase 5 gate awaiting `continue with context.md` for Phase 6)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup (`fdf2ce7`)
  - [x] **Phase 1:** Next.js Foundation (`f5932b5`)
  - [x] **Phase 2:** MongoDB and Backend Foundation (`02c832f`)
  - [x] **Phase 3:** Dynamic Public Portfolio (`5b0eee6`)
  - [x] **Phase 4:** Cloudinary Integration (`5aa4db5`)
  - [x] **Phase 5:** Admin Authentication and Authorization
- **Pending Phases:**
  - [ ] **Phase 6:** Complete Admin CMS (Protected `/api/admin/*` CRUD endpoints + `/admin/login` and `/admin/dashboard` full content management UI for all portfolio sections, media library, contact messages inbox, ordering, draft/publish, and cache revalidation)
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
- **Phase 4 Deliverables:** `src/lib/cloudinary/{cloudinary,url,index}.ts`, `src/services/media-service.ts`, `src/app/api/uploads/{sign,assets}/route.ts`, `tests/cloudinary-media.test.ts`.
- **Phase 5 Deliverables:**
  - Admin Models: `src/models/AdminUser.ts`, `src/models/AdminSession.ts`, `src/models/index.ts`.
  - Auth & Security Primitives: `src/lib/auth/password.ts`, `src/lib/auth/rate-limiter.ts`, `src/lib/auth/request-guard.ts`, `src/lib/security/csrf.ts`.
  - Auth Service: `src/services/auth-service.ts` (`adminAuthService`).
  - Auth API Routes: `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/session/route.ts`.
  - Edge Middleware: `src/middleware.ts`.
  - Phase 5 Tests: `tests/admin-auth.test.ts`.

---

## 7. Testing
- **Phase 5 Verification Executed:**
  - **Unit, Component & Integration Tests (`npm test`):** `5` test files passed, `33/33` tests passed:
    - `tests/portfolio-foundation.test.tsx` (`7/7` passed)
    - `tests/mongodb-data-layer.test.ts` (`12/12` passed)
    - `tests/dynamic-public-portfolio.test.tsx` (`4/4` passed)
    - `tests/cloudinary-media.test.ts` (`5/5` passed)
    - `tests/admin-auth.test.ts` (`5/5` passed: salted `scrypt` password hashing & constant-time verification, login + `HttpOnly` cookie + session validation + DB session revocation on logout, 5-attempt brute-force rate limiting & `429` lockout, `403` CSRF cross-origin protection, and Next.js `middleware.ts` route protection & security headers).
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
  - **Phase 4:** `5aa4db5` (`feat: integrate cloudinary media management`)
  - **Phase 5:** Committed at end of Phase 5 (`feat: add secure admin authentication`)
- **Uncommitted Changes:** None after Phase 5 commit.

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
- **Next Phase:** **PHASE 6 — Complete Admin CMS**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Implement protected Admin CMS API routes (`/api/admin/portfolio/route.ts` and `/api/admin/messages/route.ts`) enforcing `adminAuthService.requireAdminSession(request)` on every `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`, supporting full CRUD, reordering, draft/publish toggling, initial seed trigger, and contact message read/delete operations across all portfolio collections.
  2. Implement the Admin Login page (`src/app/admin/login/page.tsx`) and isolated Admin CMS styling (`src/app/admin/admin.css`) completely separated from public portfolio styles.
  3. Implement the complete Admin Dashboard & Content Management workspace (`src/app/admin/dashboard/page.tsx` and `src/components/admin/AdminDashboardClient.tsx`, plus section route aliases under `src/app/admin/[section]/page.tsx`) providing:
     - Overview stats (counts of projects, services, skills, testimonials, blog posts, unread messages, media assets, and one-click V1 seed sync).
     - Full editors for `Profile`, `SiteSettings`, `SocialLinks`, `NavigationItems`, `Services`, `Testimonials`, `Clients`, `Education`, `Experience`, `Skills`, `Achievements`, `Projects` (with category, featured, draft/published, and reordering controls), `BlogPosts`, `MediaAssets` (Cloudinary signed upload + reference-checked deletion), and `ContactMessages` inbox.
     - Confirmation dialogs before any destructive deletion and toast feedback on save.
  4. Write and execute Phase 6 integration & UI tests (`tests/admin-cms.test.tsx`).
  5. Update `context.md` and commit Phase 6 (`feat: implement admin cms`).

---

## 13. User Feedback
- `2026-10-30`: User issued `continue with context.md` to proceed from Phase 4 to Phase 5. Completed Phase 5 and stopped at the Phase 5 gate awaiting `continue with context.md`.
