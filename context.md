# Tamjid Portfolio V2 — Project Context

## 1. Project Overview
- **Original Repository:** `https://github.com/tamjid-ca/Tamjid-Portfolio`
- **Live Reference:** `https://tamjid-portfolio.vercel.app/`
- **Starting Branch:** `main` (Commit `2da903fb089de501c39068d215f2ad941e1a6ba9`)
- **Target Branch:** `version2`
- **Migration Objectives:** Transform the existing static HTML/CSS/JS portfolio for **MD. Tamjid Hossain** into a production-ready, maintainable, fully dynamic, database-driven Next.js (App Router) application with MongoDB (Mongoose), Cloudinary media management, a secure Admin CMS, Dark (default) + Light themes, and subtle Three.js / WebGL motion enhancements while preserving the original website's 1:1 visual identity.
- **Technology Stack:**
  - **Frontend:** Next.js (App Router), React, TypeScript, preserved native CSS (`globals.css` with semantic theme custom properties), Three.js / React Three Fiber / Drei, Lucide React (Admin CMS), custom inline Ionicons v5.5.2 SVG renderer (Public Portfolio).
  - **Backend & Data:** Next.js Route Handlers & Server Actions, MongoDB, Mongoose, Zod validation, Argon2id / `crypto.scrypt` password hashing, signed `HttpOnly` session cookies (`AdminSession` store).
  - **Media:** Cloudinary server-signed uploads, responsive URL transformations, reference-checked deletion (`MediaAsset` store).
  - **Testing:** Vitest, React Testing Library, Playwright / Headless Chrome visual regression.
- **Current Implementation Status:** **Phase 0 Completed** (Repository Audit, Baseline Screenshots, Design/Content/Architecture Specifications, Antigravity Custom Skills & Plugin Setup). Ready to begin **Phase 1 — Next.js Foundation**.

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
- **Responsive Behavior:** 5 `@media` min-width breakpoints (`450px`, `580px`, `768px`, `1024px`, `1250px`). Transitions from stacked full-width mobile cards (`<580px`) to centered `520px` (`>=580px`), `700px` (`>=768px`), `950px` (`>=1024px` with top-right navbar), and `1200px` side-by-side flex layout (`>=1250px` with sticky left sidebar and 75% right main content).
- **Design Preservation Decisions:**
  - Preserve all original CSS custom properties, `::before` 1px gradient borders (`--border-gradient-onyx`), shadow tokens (`--shadow-1` to `--shadow-5`), and exact media queries in `src/app/globals.css`.
  - Render exact inline SVG paths for the 12 Ionicons used in `index.html` to eliminate the external `unpkg.com` script waterfall while preserving stroke widths (`--ionicon-stroke-width`).
  - Seed MongoDB with the exact original V1 content so the initial dynamic render matches V1 1:1.

---

## 3. Architecture
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/admin`, `src/app/api`, `src/components`, `src/lib`, `src/models`, `src/repositories`, `src/services`, `src/seed`, `src/types`).
- **Component Architecture:** Server Components (`page.tsx`, `layout.tsx`) fetch aggregated portfolio data on the server and pass plain serializable DTOs to focused Client Components (`PortfolioShell`, `Sidebar`, `Navbar`, `TestimonialsSection`, `PortfolioFilterGrid`, `ContactForm`, `ThemeToggle`, `AmbientBackground3D`).
- **Database Architecture:** 16 modular Mongoose models (`SiteSettings`, `Profile`, `SocialLink`, `NavigationItem`, `Service`, `Testimonial`, `ClientLogo`, `Education`, `Experience`, `Skill`, `Achievement`, `Project`, `BlogPost`, `ContactMessage`, `MediaAsset`, `AdminUser`/`AdminSession`) with compound read indexes and `.lean()` repository queries.
- **API Architecture:** RESTful Route Handlers under `/api/public/*`, `/api/auth/*`, `/api/admin/*`, and `/api/uploads/*` validated by centralized Zod schemas (`src/lib/validation/`).
- **Authentication Architecture:** Seeded admin account (`AdminUser`), Argon2id/`scrypt` password hashing, server-stored `AdminSession` tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies, IP/account login rate limiting, and independent `requireAdminSession()` verification on every mutation.
- **Cloudinary Architecture:** Server-side upload signature generation (`src/lib/cloudinary/`), folder scoping (`portfolio/*`), `MediaAsset` metadata tracking, and reference checking across all collections before allowing asset deletion.
- **Caching Architecture:** `unstable_cache` with `portfolio-public` and section-level tags for public portfolio reads; immediate `revalidateTag('portfolio-public')` and `revalidatePath('/')` on every Admin CMS mutation; `Cache-Control: no-store` on all `/admin` and `/api/admin` routes.

---

## 4. Engineering Decisions
- **Decision 1 — Preserve Native CSS Rules over Full Tailwind Rewrite:** Rewriting `assets/css/style.css` (`1,882` lines of bespoke gradient pseudo-elements and 5 custom breakpoints) into utility classes risks subtle visual regressions. We preserve the original CSS architecture for public components and augment `:root` / `[data-theme="light"]` tokens for theming.
- **Decision 2 — Inline Ionicons SVG Component:** Replaces the blocking `unpkg.com/ionicons@5.5.2` script tag with a deterministic React `<IonIcon name="..." />` SVG component matching the exact v5.5.2 paths and stroke widths.
- **Decision 3 — Resilient Seed Fallback in Service Layer:** If `MONGODB_URI` is temporarily unreachable during static build or offline testing, `PortfolioAggregatorService` falls back cleanly to the canonical V1 seed dataset so public rendering never crashes.
- **Decision 4 — Non-Intrusive Three.js Canvas:** 3D enhancements are dynamically imported (`ssr: false`) as a fixed background canvas (`z-index: 0`) behind `<main>` (`z-index: 1`), respecting `prefers-reduced-motion: reduce` and `SiteSettings.enableThreeD`.

---

## 5. Phase Tracker
- **Current Phase:** Phase 0 Completed (Stopped at Phase 0 gate awaiting `continue with context.md` for Phase 1)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup
- **Pending Phases:**
  - [ ] **Phase 1:** Next.js Foundation (Recreate V1 appearance in Next.js App Router + initial test suite)
  - [ ] **Phase 2:** MongoDB and Backend Foundation (Models, repositories, services, seed scripts, tests)
  - [ ] **Phase 3:** Dynamic Public Portfolio (Connect all public sections to MongoDB + caching)
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
- **Audit & Architecture Deliverables:**
  - `docs/INITIAL_AUDIT.md`
  - `docs/DESIGN_INVENTORY.md`
  - `docs/CONTENT_INVENTORY.md`
  - `docs/ARCHITECTURE_PLAN.md`
- **Baseline Visual Reference Screenshots:**
  - `docs/screenshots/baseline/baseline-desktop.png` (`1440x1200`)
  - `docs/screenshots/baseline/baseline-tablet.png` (`768x1200`)
  - `docs/screenshots/baseline/baseline-mobile.png` (`500x1200`)
  - `docs/screenshots/baseline/README.md`
- **Antigravity Rules, Skills & Custom Plugin:**
  - `AGENTS.md`
  - `.agents/plugins.json`
  - `.agents/skills/{portfolio-design-preservation,nextjs-architecture,mongodb-data-engineering,cloudinary-media-management,secure-admin-cms,threejs-performance,portfolio-performance-audit,regression-testing,phase-completion-and-git}/SKILL.md`
  - `plugins/tamjid-portfolio-engineering/` (Manifest, logo, 2 rules, 3 specialist review agents, 9 skills)

---

## 7. Testing
- **Phase 0 Verification Executed:**
  - **Git Branch & History Verification:** Confirmed `version2` created cleanly from `main` (`2da903fb089de501c39068d215f2ad941e1a6ba9`).
  - **Original Source Integrity Check:** Verified `git diff main -- index.html assets/` is completely empty (no original code modified during Phase 0).
  - **Baseline Screenshot Verification:** Captured and visually verified Desktop (`1440x1200`), Tablet (`768x1200`), and Mobile (`500x1200`) screenshots via Headless Chrome (`156.0.8078.76`).
  - **Antigravity Plugin CLI Validation:** Executed `agy plugin validate plugins/tamjid-portfolio-engineering --strict` -> **Passed** (`skills 9 · agents 3 · rules 2 · hooks 0 · mcpServers 0 · sidecars 0`).

---

## 8. Git History
- **Active Branch:** `version2`
- **Starting Commit (`main`):** `2da903fb089de501c39068d215f2ad941e1a6ba9`
- **Phase Commit References:**
  - **Phase 0:** Committed at end of Phase 0 (`docs: add project audit, design inventory, and version2 engineering setup`).
- **Uncommitted Changes:** None after Phase 0 commit.

---

## 9. Antigravity Configuration
- **Global Installed Plugins:** `ponytail` (`v5.3.2`)
- **Project Custom Plugin:** `tamjid-portfolio-engineering` (`plugins/tamjid-portfolio-engineering/plugin.json`, registered via `.agents/plugins.json`, validated with `agy plugin validate --strict`)
- **Workspace Skills Created (`.agents/skills/` & plugin):**
  1. `portfolio-design-preservation`
  2. `nextjs-architecture`
  3. `mongodb-data-engineering`
  4. `cloudinary-media-management`
  5. `secure-admin-cms`
  6. `threejs-performance`
  7. `portfolio-performance-audit`
  8. `regression-testing`
  9. `phase-completion-and-git`
- **Configured MCP Servers:** None required (built-in tools + headless Chrome + local CLI tools are sufficient).

---

## 10. Environment
- **Required Environment Variables (Names Only):**
  - `MONGODB_URI` (Present in local `.env`)
  - `ADMIN_SESSION_SECRET` (Required for Phase 5+; fallback generated in dev/test if unset)
  - `ADMIN_INITIAL_EMAIL` (Required for admin provisioning seed)
  - `ADMIN_INITIAL_PASSWORD` (Required for admin provisioning seed)
  - `CLOUDINARY_CLOUD_NAME` (Required for Phase 4 live uploads)
  - `CLOUDINARY_API_KEY` (Required for Phase 4 live uploads)
  - `CLOUDINARY_API_SECRET` (Required for Phase 4 live uploads)
  - `NEXT_PUBLIC_SITE_URL` (Optional; defaults to `http://localhost:3000` in dev / `https://tamjid-portfolio.vercel.app` in prod)

---

## 11. Outstanding Issues
- **Markup Quirks in Original `index.html` Documented for Phase 1/2:**
  - Duplicate `</p>` tag in Education (`ALCA` item) will be normalized into valid JSX in Phase 1.
  - Two empty `<li class="timeline-item">` elements in Education and `"Canda"` typo in Location are documented in `docs/CONTENT_INVENTORY.md` and will be preserved in initial seed data for 1:1 visual parity while editable/deletable in the Admin CMS.
  - JavaScript skill has `<data value="90">60%</data>` and `width: 90%`; the `Skill` model stores both `percentageLabel` (`"60%"`) and `percentageValue` (`90`) so V1 parity is preserved until edited by the admin.

---

## 12. Next Actions
- **Next Phase:** **PHASE 1 — Next.js Foundation**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Initialize `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, and `vitest.config.ts` on branch `version2`.
  2. Move static assets from `assets/images/*` into `public/assets/images/*` while keeping exact URL paths (`/assets/images/...`).
  3. Migrate `assets/css/style.css` into `src/app/globals.css` and configure `Poppins` (`300`, `400`, `500`, `600`) via `next/font/google` in `src/app/layout.tsx`.
  4. Implement the modular public portfolio components (`Sidebar`, `Navbar`, `AboutSection`, `ResumeSection`, `PortfolioSection`, `BlogSection`, `ContactSection`, `TestimonialsModal`, `IonIcon`) backed by static typed initial data matching `index.html` 1:1.
  5. Write and execute Phase 1 unit/component tests (Vitest + React Testing Library), run `tsc --noEmit`, `eslint`, and `next build`, and compare rendered screenshots at desktop/tablet/mobile against `docs/screenshots/baseline/`.
  6. Update `context.md` and commit Phase 1 (`feat: implement nextjs application foundation`).

---

## 13. User Feedback
- Initial Master Engineering Prompt received (`2026-10-30`). Executed Phase 0 only as instructed. Waiting for `continue with context.md`.
