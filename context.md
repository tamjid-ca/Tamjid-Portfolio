# Tamjid Portfolio V2 — Project Context

## 1. Project Overview
- **Original Repository:** `https://github.com/tamjid-ca/Tamjid-Portfolio`
- **Live Reference:** `https://tamjid-portfolio.vercel.app/`
- **Starting Branch:** `main` (Commit `2da903fb089de501c39068d215f2ad941e1a6ba9`)
- **Target Branch:** `version2`
- **Migration Objectives:** Transform the existing static HTML/CSS/JS portfolio for **MD. Tamjid Hossain** into a production-ready, maintainable, fully dynamic, database-driven Next.js (App Router) application with MongoDB (Mongoose), Cloudinary media management, a secure Admin CMS, Dark (default) + Light themes, and subtle Three.js / WebGL motion enhancements while preserving the original website's 1:1 visual identity.
- **Technology Stack:**
  - **Frontend:** Next.js 15.5 (App Router), React 19, TypeScript 5.8, preserved native CSS (`src/app/globals.css` with semantic theme custom properties), Three.js / React Three Fiber / Drei, Lucide React (Admin CMS), custom inline Ionicons v5.5.2 SVG renderer (`src/components/ui/IonIcon.tsx`).
  - **Backend & Data:** Next.js Route Handlers & Server Actions, MongoDB, Mongoose, Zod validation, Argon2id / `crypto.scrypt` password hashing, signed `HttpOnly` session cookies (`AdminSession` store).
  - **Media:** Cloudinary server-signed uploads, responsive URL transformations, reference-checked deletion (`MediaAsset` store).
  - **Testing:** Vitest 3.2, React Testing Library, JSDOM, Headless Chrome visual regression.
- **Current Implementation Status:** **Phase 1 Completed** (Next.js App Router Foundation, 1:1 visual recreation of all public portfolio sections, inline Ionicons SVG component, `Poppins` self-hosted font, Vitest test suite, production build & multi-viewport visual verification). Ready to begin **Phase 2 — MongoDB and Backend Foundation**.

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
- **Directory Structure:** Modular Next.js App Router structure under `src/` (`src/app/(public)`, `src/app/api/public/contact`, `src/components/portfolio`, `src/components/ui`, `src/seed`, `src/types`, `tests`).
- **Component Architecture:**
  - `src/app/layout.tsx` (Server Component): Configures `Poppins` font (`--font-poppins`), global metadata, and `globals.css`.
  - `src/app/(public)/page.tsx` (Server Component): Passes serializable `PortfolioDataDTO` to `<PortfolioShell />`.
  - `src/components/portfolio/PortfolioShell.tsx` (Client Component): Coordinates active tab state and window scroll behavior across `<Sidebar />`, `<Navbar />`, `<AboutSection />`, `<ResumeSection />`, `<PortfolioSection />`, `<BlogSection />`, and `<ContactSection />`.
  - `src/components/ui/IonIcon.tsx`: Renders exact inline SVGs for all 12 Ionicons v5.5.2 icons used in the portfolio.

---

## 4. Engineering Decisions
- **Decision 1 — Preserve Native CSS Rules over Full Tailwind Rewrite:** Kept all `1,882` lines of `assets/css/style.css` in `src/app/globals.css` with `.ion-icon` selector parity.
- **Decision 2 — Inline Ionicons SVG Component:** Replaced external `unpkg.com` runtime scripts with `src/components/ui/IonIcon.tsx`, rendering crisp SVGs synchronously during SSR.
- **Decision 3 — TypeScript Incremental Build Cache in `/tmp`:** Configured `"tsBuildInfoFile": "/tmp/tsconfig.tsbuildinfo"` in `tsconfig.json` so `npm run typecheck` executes cleanly inside sandboxed environments.

---

## 5. Phase Tracker
- **Current Phase:** Phase 1 Completed (Stopped at Phase 1 gate awaiting `continue with context.md` for Phase 2)
- **Completed Phases:**
  - [x] **Phase 0:** Repository Audit and Engineering Setup (`fdf2ce7`)
  - [x] **Phase 1:** Next.js Foundation
- **Pending Phases:**
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
- **Phase 0 Deliverables:** `docs/INITIAL_AUDIT.md`, `docs/DESIGN_INVENTORY.md`, `docs/CONTENT_INVENTORY.md`, `docs/ARCHITECTURE_PLAN.md`, `docs/screenshots/baseline/*`, `AGENTS.md`, `.agents/skills/*`, `plugins/tamjid-portfolio-engineering/`.
- **Phase 1 Deliverables:**
  - Configuration: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `.gitignore`, `.env.example`.
  - Public Static Assets: `public/assets/images/{icon.svg,icon-design.svg,icon-quote.svg,my-avatar.jpg}`.
  - Types & Seed Data: `src/types/portfolio.ts`, `src/seed/v1-portfolio-data.ts`.
  - App Router & Global Error Handling: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/loading.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx`, `src/app/api/public/contact/route.ts`.
  - Portfolio UI Components: `src/components/ui/IonIcon.tsx`, `src/components/portfolio/{PortfolioShell,Sidebar,Navbar,AboutSection,ResumeSection,PortfolioSection,BlogSection,ContactSection}.tsx`.
  - Test Suite: `tests/setup.ts`, `tests/portfolio-foundation.test.tsx`.

---

## 7. Testing
- **Phase 1 Verification Executed:**
  - **Unit & Component Tests (`npm test`):** `1` test file passed, `7/7` tests passed (`Sidebar` toggle, `Navbar` tab switching & scroll, `Testimonials` modal open/close/Escape, `Resume` timeline & skill progress widths, `Portfolio` desktop + mobile category filtering, `Contact` form validation & submission, `/api/public/contact` route handler validation).
  - **TypeScript (`npm run typecheck`):** Passed (`tsc --noEmit` -> 0 errors).
  - **ESLint (`npm run lint`):** Passed (`eslint src tests` -> 0 errors, 0 warnings).
  - **Production Build (`npm run build`):** Passed (`Next.js 15.5.28` static prerender of `/` [`5.9 kB`], `/_not-found`, and dynamic `/api/public/contact`).
  - **Visual Regression Check:** Captured Desktop (`1440x1200`), Tablet (`768x1200`), and Mobile (`500x1200`) screenshots of the Next.js build and verified 1:1 visual parity with `docs/screenshots/baseline/`.

---

## 8. Git History
- **Active Branch:** `version2`
- **Starting Commit (`main`):** `2da903fb089de501c39068d215f2ad941e1a6ba9`
- **Phase Commit References:**
  - **Phase 0:** `fdf2ce7b5d219beebe0c498ac0ce93e6dd76f23f` (`docs: add project audit and design inventory`)
  - **Phase 1:** Committed at end of Phase 1 (`feat: implement nextjs application foundation`)
- **Uncommitted Changes:** None after Phase 1 commit.

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
- None blocking. `npm audit` noted upstream devDependency advisories in `eslint`/`flatted` transitive packages which do not affect production runtime bundles.

---

## 12. Next Actions
- **Next Phase:** **PHASE 2 — MongoDB and Backend Foundation**
- **Exact Next Tasks when user issues `continue with context.md`:**
  1. Install `mongoose` and `zod` in `package.json`.
  2. Implement cached MongoDB connection singleton (`src/lib/mongodb/connection.ts`) with connection reuse and health status helper.
  3. Implement centralized Zod validation schemas (`src/lib/validation/portfolio-schemas.ts`) and input sanitization utilities (`src/lib/security/sanitize.ts`).
  4. Implement Mongoose models (`src/models/`) with explicit indexes for all portfolio collections (`SiteSettings`, `Profile`, `SocialLink`, `NavigationItem`, `Service`, `Testimonial`, `ClientLogo`, `Education`, `Experience`, `Skill`, `Achievement`, `Project`, `BlogPost`, `ContactMessage`, `MediaAsset`).
  5. Implement typed `.lean()` repositories (`src/repositories/`) and domain services (`src/services/`) with automatic fallback to `V1_PORTFOLIO_SEED_DATA` when MongoDB is offline/unconfigured.
  6. Implement idempotent database seed/import script (`src/seed/seed-database.ts` and CLI script `npm run seed`) that populates MongoDB with the exact V1 content without duplicating records.
  7. Write and run comprehensive Phase 2 unit & integration tests verifying connection reuse, schema validation, repository CRUD, invalid input rejection, index definitions, and seed idempotency.
  8. Update `context.md` and commit Phase 2 (`feat: add mongodb data layer`).

---

## 13. User Feedback
- `2026-10-30`: User issued `continue with context.md` to proceed from Phase 0 to Phase 1. Completed Phase 1 and stopped at the Phase 1 gate awaiting `continue with context.md`.
