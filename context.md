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
- **Current Implementation Status:** **Phase 3 Completed** (Dynamic public portfolio wired end-to-end through `getCachedPublicPortfolioData()` using Next.js `unstable_cache` with granular cache tags, automatic tag revalidation on all service mutations, dynamic SEO metadata via `generateMetadata()`, `GET /api/public/portfolio` endpoint, and 23/23 passing tests). Ready to begin **Phase 4 — Cloudinary Integration**.

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
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/api/public/{contact,portfolio}`, `src/components/portfolio`, `src/components/ui`, `src/lib/{cache,mongodb,security,validation}`, `src/models`, `src/repositories`, `src/services`, `src/seed`, `src/types`, `tests`).
- **Component & Data Layer Architecture:**
  - `src/lib/cache/portfolio-cache.ts` & `src/lib/cache/revalidate.ts`: Wraps `portfolioService.getPublicPortfolioData()` in Next.js `unstable_cache` with granular cache tags (`portfolio-public`, `portfolio-settings`, `portfolio-profile`, `portfolio-about`, `portfolio-resume`, `portfolio-projects`, `portfolio-blog`) and exposes `revalidatePortfolioCache()` invoked automatically on every service mutation.
  - `src/app/layout.tsx`: Server Component implementing `generateMetadata()` driven by dynamic `SiteSettings`.
  - `src/app/(public)/page.tsx`: Async Server Component awaiting `getCachedPublicPortfolioData()` and rendering `<PortfolioShell data={data} />`.
  - `src/app/api/public/portfolio/route.ts`: Public portfolio snapshot & health endpoint with `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
  - `src/lib/mongodb/connection.ts`, `src/models/*`, `src/repositories/*`, `src/services/*`: Full MongoDB/Mongoose data & service layer with resilient fallback to `V1_PORTFOLIO_SEED_DATA`.

---

## 4. Engineering Decisions
- **Decision 1 — Preserve Native CSS Rules over Full Tailwind Rewrite:** Kept all `1,882` lines of `assets/css/style.css` in `src/app/globals.css` with `.ion-icon` selector parity.
- **Decision 2 — Inline Ionicons SVG Component:** Replaced external `unpkg.com` runtime scripts with `src/components/ui/IonIcon.tsx`, rendering crisp SVGs synchronously during SSR.
- **Decision 3 — TypeScript Incremental Build Cache in `/tmp`:** Configured `"tsBuildInfoFile": "/tmp/tsconfig.tsbuildinfo"` in `tsconfig.json` so `npm run typecheck` executes cleanly inside sandboxed environments.
- **Decision 4 — Deterministic Seed Keys & Natural Slugs for Idempotent Seeding:** Added `singletonKey: 'default'` on `SiteSettings`/`Profile` and `seedKey` (plus `slug` on `NavigationItem`, `Project`, `BlogPost`) so `seedDatabase()` can run repeatedly without creating duplicate documents.
- **Decision 5 — Decoupled Cache Tag Revalidation (`src/lib/cache/revalidate.ts`):** Separated tag constants and `revalidatePortfolioCache()` into `src/lib/cache/revalidate.ts` to avoid circular imports between `portfolio-cache.ts` and `portfolio-service.ts`, while safely catching non-Next.js runtime contexts during unit tests.

---

## 5. Phase Tracker
- **Current Phase:** Phase 3 Completed (Stopped at Phase 3 gate awaiting `continue with context.md` for Phase 4)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup (`fdf2ce7`)
  - [x] **Phase 1:** Next.js Foundation (`f5932b5`)
  - [x] **Phase 2:** MongoDB and Backend Foundation (`02c832f`)
  - [x] **Phase 3:** Dynamic Public Portfolio
- **Pending Phases:**
  - [ ] **Phase 4:** Cloudinary Integration (Signed uploads, media library, responsive image URLs, reference-safe deletion)
  - [ ] **Phase 5:** Admin Authentication and Authorization (Argon2/scrypt, sessions, rate limiting, route guards)
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
- **Phase 3 Deliverables:**
  - Cache & Revalidation Layer: `src/lib/cache/revalidate.ts`, `src/lib/cache/portfolio-cache.ts`.
  - Dynamic Public Routes & Metadata: `src/app/layout.tsx` (`generateMetadata`), `src/app/(public)/page.tsx` (`async HomePage`), `src/app/api/public/portfolio/route.ts` (`GET`).
  - Enhanced Dynamic Portfolio Components: `src/components/portfolio/PortfolioShell.tsx`, `src/components/portfolio/ResumeSection.tsx`.
  - Phase 3 Integration & Component Tests: `tests/dynamic-public-portfolio.test.tsx`, `tests/setup.ts`.

---

## 7. Testing
- **Phase 3 Verification Executed:**
  - **Unit, Component & Integration Tests (`npm test`):** `3` test files passed, `23/23` tests passed:
    - `tests/portfolio-foundation.test.tsx` (`7/7` passed)
    - `tests/mongodb-data-layer.test.ts` (`12/12` passed)
    - `tests/dynamic-public-portfolio.test.tsx` (`4/4` passed: dynamic `generateMetadata()` from MongoDB `SiteSettings`, `GET /api/public/portfolio` snapshot & cache headers, end-to-end async `HomePage` rendering of dynamic database mutations across Profile/Resume/Achievements/Portfolio/Blog with draft exclusion and custom category filtering, and `revalidatePortfolioCache()` tag resolution).
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
  - **Phase 3:** Committed at end of Phase 3 (`feat: implement dynamic portfolio sections`)
- **Uncommitted Changes:** None after Phase 3 commit.

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
- **Next Phase:** **PHASE 4 — Cloudinary Integration**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Read `.agents/skills/cloudinary-media-management/SKILL.md`.
  2. Implement server-side Cloudinary configuration, upload signature generator (SHA-1/SHA-256 parameter signing), folder conventions (`tamjid-portfolio/avatars`, `tamjid-portfolio/projects`, `tamjid-portfolio/blog`, `tamjid-portfolio/icons`, `tamjid-portfolio/certificates`, `tamjid-portfolio/clients`), MIME/extension/size validation, and responsive URL transformation helper (`f_auto,q_auto,w_...`) in `src/lib/cloudinary/cloudinary.ts`.
  3. Implement `CloudinaryMediaService` in `src/services/media-service.ts` supporting signed upload payload creation, `MediaAsset` registration, asset listing, reference inspection (`findAssetReferences`), and reference-safe deletion (including remote Cloudinary destroy call when configured).
  4. Implement upload/media API endpoints in `src/app/api/uploads/sign/route.ts` and `src/app/api/uploads/assets/route.ts` (with session authorization hooks ready for Phase 5).
  5. Write and execute Phase 4 unit & integration tests (`tests/cloudinary-media.test.ts`) verifying signature generation, file type/size validation, URL transformation helpers, and reference-safe asset deletion.
  6. Update `context.md` and commit Phase 4 (`feat: integrate cloudinary media management`).

---

## 13. User Feedback
- `2026-10-30`: User issued `continue with context.md` to proceed from Phase 2 to Phase 3. Completed Phase 3 and stopped at the Phase 3 gate awaiting `continue with context.md`.
