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
- **Current Implementation Status:** **Phase 6 Completed** (Protected `/api/admin/portfolio` and `/api/admin/messages` endpoints, isolated Admin CMS styling in `src/app/admin/admin.css`, `/admin/login` authentication UI, `/admin/dashboard` and `/admin/[section]` full CMS workspace managing all 13 portfolio content domains + Cloudinary media library + Contact messages inbox + one-click V1 seed sync + automatic public cache revalidation, and 38/38 passing tests across 6 test files). Ready to begin **Phase 7 — Dark/Light Theme**.

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
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/admin/{login,dashboard,[section]}`, `src/app/api/admin/{portfolio,messages}`, `src/app/api/auth/{login,logout,session}`, `src/app/api/public/{contact,portfolio}`, `src/app/api/uploads/{sign,assets}`, `src/components/admin`, `src/components/portfolio`, `src/components/ui`, `src/lib/{auth,cache,cloudinary,mongodb,security,validation}`, `src/models`, `src/repositories`, `src/services`, `src/seed`, `src/types`, `src/middleware.ts`, `tests`).
- **Admin CMS Layer Architecture:**
  - `src/app/admin/layout.tsx` & `src/app/admin/admin.css`: Scoped `.admin-cms-root` layout with `robots: { index: false, follow: false }` completely isolated from public portfolio CSS.
  - `src/app/api/admin/portfolio/route.ts`: Authenticated `GET` (snapshot), `POST` (`action: 'seed'` or collection item creation), `PUT` (`siteSettings`, `profile`, or collection item update), `PATCH` (`action: 'reorder'`), and `DELETE` (collection item deletion) with Zod validation and automatic `revalidatePortfolioCache()`.
  - `src/app/api/admin/messages/route.ts`: Authenticated `GET`, `PATCH` (`isRead` toggle), and `DELETE` for contact form submissions.
  - `src/components/admin/AdminLoginForm.tsx` & `src/components/admin/AdminDashboardClient.tsx`: Full interactive CMS interface covering Overview stats, Profile & Headings, Projects, Resume & Skills (Education, Experience, Skills, Achievements), Services & Testimonials (+ Client Logos), Blog Posts, Navigation & Social Links, Cloudinary Media Library (signed upload + reference-checked deletion), Contact Inbox, and Site & Appearance Settings.

---

## 4. Engineering Decisions
- **Decision 1 — Preserve Native CSS Rules over Full Tailwind Rewrite:** Kept all `1,882` lines of `assets/css/style.css` in `src/app/globals.css` with `.ion-icon` selector parity.
- **Decision 2 — Inline Ionicons SVG Component:** Replaced external `unpkg.com` runtime scripts with `src/components/ui/IonIcon.tsx`, rendering crisp SVGs synchronously during SSR.
- **Decision 3 — TypeScript Incremental Build Cache in `/tmp`:** Configured `"tsBuildInfoFile": "/tmp/tsconfig.tsbuildinfo"` in `tsconfig.json` so `npm run typecheck` executes cleanly inside sandboxed environments.
- **Decision 4 — Deterministic Seed Keys & Natural Slugs for Idempotent Seeding:** Added `singletonKey: 'default'` on `SiteSettings`/`Profile` and `seedKey` (plus `slug` on `NavigationItem`, `Project`, `BlogPost`) so `seedDatabase()` can run repeatedly without creating duplicate documents.
- **Decision 5 — Decoupled Cache Tag Revalidation (`src/lib/cache/revalidate.ts`):** Separated tag constants and `revalidatePortfolioCache()` into `src/lib/cache/revalidate.ts` to avoid circular imports.
- **Decision 6 — Zero-Dependency Native Crypto Cloudinary Signing & URL Transform:** Used Node's built-in `crypto` module for Cloudinary SHA-256/SHA-1 parameter signing and pure string URL transformation (`src/lib/cloudinary/url.ts`).
- **Decision 7 — Dual-Layer Admin Session Security (Signed Cookie + Server-Revocable DB Session):** Combined HMAC-SHA256 signed `HttpOnly` cookies (for fast Edge Middleware checks) with server-backed `AdminSession` records in MongoDB verified by `adminAuthService.requireAdminSession()` on every API route and mutation.
- **Decision 8 — Strict CSS & Bundle Isolation for `/admin`:** Placed all Admin CMS styling inside `src/app/admin/admin.css` scoped under `.admin-cms-root` and `.admin-*` class names so the public portfolio stylesheet (`src/app/globals.css`) and public bundle remain completely untouched.

---

## 5. Phase Tracker
- **Current Phase:** Phase 6 Completed (Stopped at Phase 6 gate awaiting `continue with context.md` for Phase 7)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup (`fdf2ce7`)
  - [x] **Phase 1:** Next.js Foundation (`f5932b5`)
  - [x] **Phase 2:** MongoDB and Backend Foundation (`02c832f`)
  - [x] **Phase 3:** Dynamic Public Portfolio (`5b0eee6`)
  - [x] **Phase 4:** Cloudinary Integration (`5aa4db5`)
  - [x] **Phase 5:** Admin Authentication and Authorization (`b5d8944`)
  - [x] **Phase 6:** Complete Admin CMS
- **Pending Phases:**
  - [ ] **Phase 7:** Dark/Light Theme (Dark default + harmonized Light mode tokens + persistence + optional toggle in portfolio shell)
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
- **Phase 5 Deliverables:** `src/models/{AdminUser,AdminSession}.ts`, `src/lib/auth/{password,rate-limiter,request-guard}.ts`, `src/lib/security/csrf.ts`, `src/services/auth-service.ts`, `src/app/api/auth/{login,logout,session}/route.ts`, `src/middleware.ts`, `tests/admin-auth.test.ts`.
- **Phase 6 Deliverables:**
  - Extended Services: `src/services/portfolio-service.ts` (`deleteNavigationItem`, `reorderCollection`, resilient `getAdminPortfolioData`), `src/services/contact-service.ts` (`listMessages`, `markMessageReadState`, `deleteMessage`).
  - Protected Admin API Routes: `src/app/api/admin/portfolio/route.ts`, `src/app/api/admin/messages/route.ts`.
  - Isolated Admin Layout & Styles: `src/app/admin/layout.tsx`, `src/app/admin/admin.css`.
  - Admin CMS Pages & Client Components: `src/app/admin/login/page.tsx`, `src/components/admin/AdminLoginForm.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/[section]/page.tsx`, `src/components/admin/AdminDashboardClient.tsx`.
  - Phase 6 Tests: `tests/admin-cms.test.tsx`.

---

## 7. Testing
- **Phase 6 Verification Executed:**
  - **Unit, Component & Integration Tests (`npm test`):** `6` test files passed, `38/38` tests passed:
    - `tests/portfolio-foundation.test.tsx` (`7/7` passed)
    - `tests/mongodb-data-layer.test.ts` (`12/12` passed)
    - `tests/dynamic-public-portfolio.test.tsx` (`4/4` passed)
    - `tests/cloudinary-media.test.ts` (`5/5` passed)
    - `tests/admin-auth.test.ts` (`5/5` passed)
    - `tests/admin-cms.test.tsx` (`5/5` passed: 401 rejection on unauthenticated `/api/admin/portfolio` and `/api/admin/messages`, authenticated snapshot/profile/CRUD/reorder/delete operations, contact inbox listing/read-toggle/delete operations, `<AdminLoginForm />` submission, and `<AdminDashboardClient />` multi-section navigation & rendering).
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
  - **Phase 5:** `b5d8944` (`feat: add secure admin authentication`)
  - **Phase 6:** Committed at end of Phase 6 (`feat: implement admin cms`)
- **Uncommitted Changes:** None after Phase 6 commit.

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
- **Next Phase:** **PHASE 7 — Dark/Light Theme**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Define harmonized Light theme CSS custom property overrides (`[data-theme="light"]`) in `src/app/globals.css` while keeping Dark mode (`[data-theme="dark"]` / `:root`) 100% identical to the original Tamjid Portfolio palette (`--smoky-black`, `--eerie-black-2`, `--onyx`, `--orange-yellow-crayola`, `--border-gradient-onyx`, `--shadow-1..5`).
  2. Implement a Flash-of-Unstyled-Content-free (`FOUC`-free) ThemeProvider (`src/components/theme/ThemeProvider.tsx`) and subtle, accessible ThemeToggle control (`src/components/theme/ThemeToggle.tsx`) integrated into the portfolio shell without shifting or breaking the original 5-breakpoint layout geometry, respecting `siteSettings.defaultTheme` and `siteSettings.enableThemeToggle`.
  3. Add new Ionicons (`sunny-outline`, `moon-outline`) to `src/components/ui/IonIcon.tsx` for the theme toggle button.
  4. Write and execute Phase 7 unit/component tests (`tests/theme-system.test.tsx`).
  5. Update `context.md` and commit Phase 7 (`feat: add dark and light themes`).

---

## 13. User Feedback
- `2026-10-30`: User issued `continue with context.md` to proceed from Phase 5 to Phase 6. Completed Phase 6 and stopped at the Phase 6 gate awaiting `continue with context.md`.
