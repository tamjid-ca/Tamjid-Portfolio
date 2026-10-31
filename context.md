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
- **Current Implementation Status:** **Phase 2 Completed** (MongoDB connection singleton, input sanitization & Zod validation schemas, 15 Mongoose models with compound indexes, `.lean()` repositories, domain services with automatic seed fallback and reference-safe media deletion, idempotent V1 seed script, and 19/19 passing tests). Ready to begin **Phase 3 — Dynamic Public Portfolio**.

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
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/api/public/contact`, `src/components/portfolio`, `src/components/ui`, `src/lib/mongodb`, `src/lib/security`, `src/lib/validation`, `src/models`, `src/repositories`, `src/services`, `src/seed`, `src/types`, `tests`).
- **Component & Data Layer Architecture:**
  - `src/lib/mongodb/connection.ts`: Global cached Mongoose connection manager (`connectToDatabase`, `disconnectFromDatabase`, `getDatabaseStatus`, `isDatabaseConnected`) with strict and resilient fallback modes.
  - `src/lib/security/sanitize.ts`: Recursive NoSQL injection operator sanitizer (`stripMongoOperators`) stripping `$` and `.` keys, prototype pollution keys, and null bytes.
  - `src/lib/validation/portfolio-schemas.ts`: Centralized Zod validation schemas for all 15 portfolio entities plus `validateAndSanitize()`.
  - `src/models/`: 15 Mongoose models (`SiteSettings`, `Profile`, `SocialLink`, `NavigationItem`, `Service`, `Testimonial`, `ClientLogo`, `Education`, `Experience`, `Skill`, `Achievement`, `Project`, `BlogPost`, `ContactMessage`, `MediaAsset`) with hot-reload guards and compound indexes.
  - `src/repositories/portfolio-repository.ts`: `.lean()` repositories serializing `_id` -> `id` string DTOs, deterministic `{ displayOrder: 1, createdAt: 1 }` sorting, bulk reordering, and `mediaAssetRepository.findAssetReferences(publicId)`.
  - `src/services/portfolio-service.ts` & `src/services/contact-service.ts`: Business logic, Zod validation enforcement, `MediaAssetInUseError` reference guard, and automatic fallback to `V1_PORTFOLIO_SEED_DATA` when MongoDB is unconfigured or offline.

---

## 4. Engineering Decisions
- **Decision 1 — Preserve Native CSS Rules over Full Tailwind Rewrite:** Kept all `1,882` lines of `assets/css/style.css` in `src/app/globals.css` with `.ion-icon` selector parity.
- **Decision 2 — Inline Ionicons SVG Component:** Replaced external `unpkg.com` runtime scripts with `src/components/ui/IonIcon.tsx`, rendering crisp SVGs synchronously during SSR.
- **Decision 3 — TypeScript Incremental Build Cache in `/tmp`:** Configured `"tsBuildInfoFile": "/tmp/tsconfig.tsbuildinfo"` in `tsconfig.json` so `npm run typecheck` executes cleanly inside sandboxed environments.
- **Decision 4 — Deterministic Seed Keys & Natural Slugs for Idempotent Seeding:** Added `singletonKey: 'default'` on `SiteSettings`/`Profile` and `seedKey` (plus `slug` on `NavigationItem`, `Project`, `BlogPost`) so `seedDatabase()` can run repeatedly without creating duplicate documents.

---

## 5. Phase Tracker
- **Current Phase:** Phase 2 Completed (Stopped at Phase 2 gate awaiting `continue with context.md` for Phase 3)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup (`fdf2ce7`)
  - [x] **Phase 1:** Next.js Foundation (`f5932b5`)
  - [x] **Phase 2:** MongoDB and Backend Foundation
- **Pending Phases:**
  - [ ] **Phase 3:** Dynamic Public Portfolio (Connect all public sections to MongoDB + caching + revalidation)
  - [ ] **Phase 4:** Cloudinary Integration (Signed uploads, media library, reference-safe deletion)
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
- **Phase 2 Deliverables:**
  - MongoDB Connection Layer: `src/lib/mongodb/connection.ts`.
  - Input Sanitization & Zod Schemas: `src/lib/security/sanitize.ts`, `src/lib/validation/portfolio-schemas.ts`.
  - Mongoose Models (15 Collections): `src/models/{SiteSettings,Profile,SocialLink,NavigationItem,Service,Testimonial,ClientLogo,Education,Experience,Skill,Achievement,Project,BlogPost,ContactMessage,MediaAsset,index}.ts`.
  - Repositories: `src/repositories/portfolio-repository.ts`, `src/repositories/index.ts`.
  - Services: `src/services/portfolio-service.ts`, `src/services/contact-service.ts`, `src/services/index.ts`.
  - Idempotent Seeding: `src/seed/seed-database.ts`, `src/seed/cli.ts` (`npm run seed`).
  - Route Handler Integration: `src/app/api/public/contact/route.ts`.
  - Phase 2 Tests: `tests/mongodb-data-layer.test.ts`.

---

## 7. Testing
- **Phase 2 Verification Executed:**
  - **Unit, Component & Data Layer Tests (`npm test`):** `2` test files passed, `19/19` tests passed:
    - `tests/portfolio-foundation.test.tsx` (`7/7` passed)
    - `tests/mongodb-data-layer.test.ts` (`12/12` passed: connection caching/strict/non-strict modes, recursive `$`/`.` operator stripping, Zod validation across all V1 entities and malicious inputs, 15 Mongoose model schemas & compound indexes, idempotent `seedDatabase()` execution across repeated runs, full CRUD + draft/published filtering + project reordering, reference-safe `MediaAsset` deletion guard, `/api/public/contact` persistence, and offline fallback).
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
  - **Phase 2:** Committed at end of Phase 2 (`feat: add mongodb data layer`)
- **Uncommitted Changes:** None after Phase 2 commit.

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
- **Next Phase:** **PHASE 3 — Dynamic Public Portfolio**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Implement Next.js cache & tag invalidation module (`src/lib/cache/portfolio-cache.ts`) wrapping `portfolioService.getPublicPortfolioData()` with `unstable_cache`, granular cache tags (`portfolio-public`, `portfolio-profile`, `portfolio-projects`, `portfolio-resume`, `portfolio-blog`, `portfolio-settings`), and `revalidatePortfolioCache()` helper.
  2. Connect `src/app/layout.tsx` (`generateMetadata`) and `src/app/(public)/page.tsx` to fetch dynamic portfolio data and site settings from `getCachedPublicPortfolioData()`.
  3. Create `GET /api/public/portfolio/route.ts` to expose the public portfolio snapshot and health status.
  4. Verify all public sections (Sidebar, Navbar, About, Services, Testimonials + Modal, Clients, Education, Experience, Skills, Achievements conditional block, Portfolio filter + grid, Blog grid, Contact map + form) render dynamically from the database/service layer, handle empty/draft states gracefully, and preserve 1:1 visual parity across desktop, tablet, and mobile.
  5. Write and execute Phase 3 integration & component tests (`tests/dynamic-public-portfolio.test.tsx`).
  6. Update `context.md` and commit Phase 3 (`feat: implement dynamic portfolio sections`).

---

## 13. User Feedback
- `2026-10-30`: User issued `continue with context.md` to proceed from Phase 1 to Phase 2. Completed Phase 2 and stopped at the Phase 2 gate awaiting `continue with context.md`.
