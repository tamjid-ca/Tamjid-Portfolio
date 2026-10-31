# Tamjid Portfolio V2 — Project Context

## 1. Project Overview
- **Original Repository:** `https://github.com/tamjid-ca/Tamjid-Portfolio`
- **Live Reference:** `https://tamjid-portfolio.vercel.app/`
- **Starting Branch:** `main` (Commit `2da903fb089de501c39068d215f2ad941e1a6ba9`)
- **Target Branch:** `version2`
- **Migration Objectives:** Transform the existing static HTML/CSS/JS portfolio for **MD. Tamjid Hossain** into a production-ready, maintainable, fully dynamic, database-driven Next.js (App Router) application with MongoDB (Mongoose), Cloudinary media management, a secure Admin CMS, Dark (default) + Light themes, and subtle Three.js / WebGL motion enhancements while preserving the original website's 1:1 visual identity.
- **Technology Stack:**
  - **Frontend:** Next.js 15.5 (App Router), React 19, TypeScript 5.8, preserved native CSS (`src/app/globals.css` with semantic theme custom properties), Three.js (`three` + `@types/three` lazy-loaded via `next/dynamic`), custom inline Ionicons v5.5.2 SVG renderer (`src/components/ui/IonIcon.tsx`).
  - **Backend & Data:** Next.js Route Handlers & Server Actions, MongoDB, Mongoose 8.x, Zod 3.24 validation, salted `crypto.scrypt` password hashing, signed `HttpOnly` session cookies (`AdminSession` store).
  - **Media:** Cloudinary server-signed uploads, responsive URL transformations, reference-checked deletion (`MediaAsset` store).
  - **Testing:** Vitest 3.2, React Testing Library, JSDOM, Headless Chrome visual regression.
- **Current Implementation Status:** **Phase 8 Completed** (Lazy-loaded Three.js WebGL ambient constellation backdrop `src/components/animations/AmbientBackgroundCanvas.tsx` and `src/components/animations/AmbientBackgroundLoader.tsx` with `next/dynamic({ ssr: false })`, `siteSettings.enableThreeD` toggle support, `prefers-reduced-motion: reduce` static fallback, WebGL error boundary & context fallback, `document.hidden` visibility pause, capped mobile `dpr` & particle counts, Dark/Light theme particle color adaptation, and 47/47 passing tests across 8 test files). Ready to begin **Phase 9 — Performance, SEO and Accessibility**.

---

## 2. Original Website
- **Original Design Reference:** `@codewithsadee` vCard Dark Portfolio customized for **MD. Tamjid Hossain** (`index.html` [1,123 lines], `assets/css/style.css` [1,882 lines], `assets/js/script.js` [211 lines]).
- **Existing Sections:**
  1. **Sidebar (`aside.sidebar`):** Avatar (`my-avatar.jpg`), Name (`MD. Tamjid Hossain`), Title pill (`IT enthusiast`), collapsible `"Show Contacts"` drawer (`Email`, `Phone`, `Birthday`, `Location`), Social links (`GitHub`, `LinkedIn`, `Facebook`).
  2. **Navbar (`nav.navbar`):** Tab navigation switching `<article data-page="...">` views (`About`, `Resume`, `Portfolio`, `Blog`, `Contact`) + optional Dark/Light `<ThemeToggle />`.
  3. **About (`article.about`):** 2 biography paragraphs, `"What i'm doing"` services grid (4 cards), `"Testimonials"` horizontal snap-carousel (4 cards) + click-to-open Testimonial Modal (`icon-quote.svg`), `"Clients"` horizontal grayscale logo strip (6 items).
  4. **Resume (`article.resume`):** `"Education"` timeline (3 items: `ALCA` `2021 — 2026` + 2 empty rows), `"Experience"` timeline (3 items: `Creative director`, `Art director`, `Web designer`), `"My skills"` progress card (`Python` 80%, `HTML` 70%, `JavaScript` 60% label / 90% bar, `WordPress` 50%).
  5. **Portfolio (`article.portfolio`):** Category filter (`All`, `Web design`, `Applications`, `Web development`) with desktop button bar + mobile custom select dropdown, and 9 project cards (`Finance`, `Orizon`, `Fundo`, `Brawlhalla`, `DSM.`, `MetaSpark`, `Summary`, `Task Manager`, `Arrival`).
  6. **Blog (`article.blog`):** 4 blog post cards (`Design conferences in 2022`, `Design`, `Oct 15, 2023`).
  7. **Contact (`article.contact`):** Embedded Google Maps `<iframe>` (Skyview Ranch, Calgary, AB, Canada, styled with `grayscale(1) invert(1)` in Dark mode and natural map colors in Light mode) and Contact Form (`fullname`, `email`, `message`, `Send Message` button).
- **Responsive Behavior:** 5 `@media` min-width breakpoints (`450px`, `580px`, `768px`, `1024px`, `1250px`).
- **Design Preservation Decisions:**
  - All original CSS rules and custom properties preserved in `src/app/globals.css`.
  - `.info_more-btn span:not(.ion-icon)` scoped so the mobile `chevron-down` `<IonIcon />` span remains visible below `580px` while text `"Show Contacts"` appears at `>=580px`.

---

## 3. Architecture
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/admin/{login,dashboard,[section]}`, `src/app/api/admin/{portfolio,messages}`, `src/app/api/auth/{login,logout,session}`, `src/app/api/public/{contact,portfolio}`, `src/app/api/uploads/{sign,assets}`, `src/components/{admin,animations,portfolio,theme,ui}`, `src/lib/{auth,cache,cloudinary,mongodb,security,validation}`, `src/models`, `src/repositories`, `src/services`, `src/seed`, `src/types`, `src/middleware.ts`, `tests`).
- **Three.js Ambient Animation Layer Architecture:**
  - `src/components/animations/AmbientBackgroundCanvas.tsx`: Client-only Three.js `WebGLRenderer` (`powerPreference: 'low-power'`, `alpha: true`, `dpr <= 1.5`) + `BufferGeometry` + `PointsMaterial` rendering a subtle golden constellation backdrop (`z-index: 0`, `pointer-events: none`, `position: fixed; inset: 0`) that pauses when `document.hidden` is true, adapts particle color to `dark`/`light` theme, and disposes GPU buffers/materials/renderer on unmount.
  - `src/components/animations/AmbientBackgroundLoader.tsx`: Wraps `AmbientBackgroundCanvas` with `next/dynamic(..., { ssr: false })`, `WebGLErrorBoundary`, `prefers-reduced-motion: reduce` detection, and `siteSettings.enableThreeD` gating.

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
- **Decision 9 — Zero-Dependency Custom Property Theme System with Inline FOUC Script:** Implemented Dark/Light theming via `[data-theme]` CSS custom property overrides in `src/app/globals.css` paired with `buildThemeInitScript()` in `src/app/layout.tsx`.
- **Decision 10 — Direct Three.js WebGL Scene Lazy-Loaded via `next/dynamic` (`ssr: false`):** Used `three` directly with `next/dynamic` (`ssr: false`) rather than bundling heavy R3F reconcilers into the React 19 tree, keeping initial First Load JS at `110 kB` while providing full GPU lifecycle control and zero layout shift (`CLS = 0`).

---

## 5. Phase Tracker
- **Current Phase:** Phase 8 Completed (Stopped at Phase 8 gate awaiting `continue with context.md` for Phase 9)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup (`fdf2ce7`)
  - [x] **Phase 1:** Next.js Foundation (`f5932b5`)
  - [x] **Phase 2:** MongoDB and Backend Foundation (`02c832f`)
  - [x] **Phase 3:** Dynamic Public Portfolio (`5b0eee6`)
  - [x] **Phase 4:** Cloudinary Integration (`5aa4db5`)
  - [x] **Phase 5:** Admin Authentication and Authorization (`b5d8944`)
  - [x] **Phase 6:** Complete Admin CMS (`bf89572`)
  - [x] **Phase 7:** Dark/Light Theme (`2250811`)
  - [x] **Phase 8:** Three.js and Motion Enhancement
- **Pending Phases:**
  - [ ] **Phase 9:** Performance, SEO and Accessibility (Metadata, sitemap, robots, JSON-LD structured data, caching strategy doc, CWV & WCAG audit)
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
- **Phase 6 Deliverables:** `src/app/api/admin/{portfolio,messages}/route.ts`, `src/app/admin/{layout,admin.css}`, `src/app/admin/login/page.tsx`, `src/app/admin/dashboard/page.tsx`, `src/app/admin/[section]/page.tsx`, `src/components/admin/{AdminLoginForm,AdminDashboardClient}.tsx`, `tests/admin-cms.test.tsx`.
- **Phase 7 Deliverables:** `src/app/globals.css` (`[data-theme="light"]`), `src/components/theme/{theme-script,ThemeProvider,ThemeToggle}.tsx`, `tests/theme-system.test.tsx`.
- **Phase 8 Deliverables:**
  - Three.js Ambient Components: `src/components/animations/AmbientBackgroundCanvas.tsx`, `src/components/animations/AmbientBackgroundLoader.tsx`.
  - Backdrop Styles & Shell Integration: `.ambient-bg-canvas` / `.ambient-bg-fallback` in `src/app/globals.css`, `<AmbientBackgroundLoader />` in `src/components/portfolio/PortfolioShell.tsx`.
  - Phase 8 Tests: `tests/threejs-ambient.test.tsx`.

---

## 7. Testing
- **Phase 8 Verification Executed:**
  - **Unit, Component & Integration Tests (`npm test`):** `8` test files passed, `47/47` tests passed:
    - `tests/portfolio-foundation.test.tsx` (`7/7` passed)
    - `tests/mongodb-data-layer.test.ts` (`12/12` passed)
    - `tests/dynamic-public-portfolio.test.tsx` (`4/4` passed)
    - `tests/cloudinary-media.test.ts` (`5/5` passed)
    - `tests/admin-auth.test.ts` (`5/5` passed)
    - `tests/admin-cms.test.tsx` (`5/5` passed)
    - `tests/theme-system.test.tsx` (`5/5` passed)
    - `tests/threejs-ambient.test.tsx` (`4/4` passed: `enableThreeD: false` suppression, `prefers-reduced-motion: reduce` static fallback, missing WebGL context fallback, and `PortfolioShell` layout preservation).
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
  - **Phase 6:** `bf89572` (`feat: implement admin cms`)
  - **Phase 7:** `2250811` (`feat: add dark and light themes`)
  - **Phase 8:** Committed at end of Phase 8 (`feat: integrate optimized threejs animations`)
- **Uncommitted Changes:** None after Phase 8 commit.

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
- **Next Phase:** **PHASE 9 — Performance, SEO and Accessibility**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Read `.agents/skills/portfolio-performance-audit/SKILL.md` and create `docs/CACHING_STRATEGY.md` documenting ISR/tag-based caching (`unstable_cache`, `PORTFOLIO_CACHE_TAGS`, `revalidatePortfolioCache()`), Admin bypass (`force-dynamic` + `no-store`), and Cloudinary CDN delivery.
  2. Implement dynamic SEO routes and structured data:
     - `src/app/sitemap.ts` generating canonical sitemap entries for the public portfolio.
     - `src/app/robots.ts` allowing `/` and disallowing `/admin` and `/api`.
     - `src/lib/seo/structured-data.ts` generating Schema.org `Person` and `WebSite` JSON-LD injected into `src/app/(public)/page.tsx` and enriched canonical/Twitter/OpenGraph metadata in `src/app/layout.tsx`.
  3. Audit and enhance WCAG accessibility (skip-to-content link, semantic landmarks, focus-visible outlines, ARIA attributes on tabs/modals/filters) without altering original visual layout proportions.
  4. Write and execute Phase 9 unit/integration tests (`tests/performance-seo-a11y.test.tsx`).
  5. Update `context.md` and commit Phase 9 (`perf: optimize rendering and caching`).

---

## 13. User Feedback
- `2026-10-30`: User issued `continue with context.md` to proceed from Phase 7 to Phase 8. Completed Phase 8 and stopped at the Phase 8 gate awaiting `continue with context.md`.
