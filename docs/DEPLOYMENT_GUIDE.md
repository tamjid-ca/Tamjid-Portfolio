# Tamjid Portfolio V2 — Production Deployment Guide

## 1. Prerequisites
- **Node.js:** `>= 20.x` (tested on Node 22 LTS)
- **MongoDB:** MongoDB Atlas cluster (or self-hosted MongoDB 7+)
- **Cloudinary:** Cloudinary account for media uploads and responsive asset delivery
- **Hosting Platform:** Vercel (recommended) or any Node.js / Docker platform supporting Next.js 15 App Router

---

## 2. Required Environment Variables
Configure the following environment variables in your production deployment environment (e.g., Vercel Project Settings -> Environment Variables). **Never commit `.env` to Git.**

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `MONGODB_URI` | Yes | MongoDB connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/tamjid-portfolio?retryWrites=true&w=majority`). |
| `ADMIN_SESSION_SECRET` | Yes | High-entropy random secret (`>= 32` characters, e.g. `openssl rand -hex 32`) used to sign `HttpOnly` admin session cookies. |
| `ADMIN_INITIAL_EMAIL` | Yes | Initial admin login email provisioned on first sign-in (e.g., `admin@tamjid.ca`). |
| `ADMIN_INITIAL_PASSWORD` | Yes | Strong initial admin password (`>= 12` characters) hashed with salted `crypto.scrypt` on bootstrap. |
| `CLOUDINARY_CLOUD_NAME` | Yes (for uploads) | Cloudinary cloud name for server-signed media uploads and URL transformations. |
| `CLOUDINARY_API_KEY` | Yes (for uploads) | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes (for uploads) | Cloudinary API secret (server-only; never exposed to the client). |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public URL (e.g., `https://tamjid-portfolio.vercel.app`) used for OpenGraph, `sitemap.xml`, `robots.txt`, and CSRF origin verification. |

See [`.env.example`](file:///Users/mdshahadathossain/Downloads/Tamjid-Portfolio/.env.example) for a template.

---

## 3. Initial Database Seeding
Tamjid Portfolio V2 includes an idempotent seed script (`src/seed/seed-database.ts`) that populates MongoDB with 100% of the original V1 portfolio content (SiteSettings, Profile, 3 Social Links, 5 Navigation Items, 4 Services, 4 Testimonials, 6 Client Logos, 3 Education rows, 3 Experience rows, 4 Skills, 9 Projects, and 4 Blog Posts):

```bash
npm run seed
```

Alternatively, after signing in to `/admin/login`, click **"Sync V1 Seed Data"** in the top-right bar of `/admin/dashboard` to run the idempotent seed directly from the Admin CMS.

---

## 4. Build & Verification Commands

```bash
# Install dependencies
npm install

# Run TypeScript strict typecheck
npm run typecheck

# Run ESLint check
npm run lint

# Run Vitest unit, integration, security & regression test suite
npm test

# Build optimized Next.js production bundle
npm run build

# Start production server locally
npm start
```

---

## 5. Admin CMS Operations
- **Sign In:** Navigate to `/admin/login` and authenticate with `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD`.
- **Dashboard Sections (`/admin/dashboard`):**
  - **Overview:** View real-time collection counts and trigger one-click V1 seed synchronization.
  - **Profile & Headings:** Edit name, professional title, avatar, contact details (`Email`, `Phone`, `Birthday`, `Location`), section headings, and biography paragraphs.
  - **Projects:** Create, reorder (`↑` / `↓`), toggle `published` / `draft`, feature, or delete portfolio projects.
  - **Resume & Skills:** Manage Education, Experience, Skills (`percentageValue` bar width & `percentageLabel` display text), and Achievements timelines.
  - **Services & Testimonials:** Manage `"What i'm doing"` service cards, client testimonials, and client logos.
  - **Blog Posts:** Create, reorder, toggle `published` / `draft`, or delete blog entries.
  - **Navigation & Socials:** Reorder or toggle visibility of navbar tabs and sidebar social links.
  - **Cloudinary Media:** Upload images directly to Cloudinary using server-generated SHA-256 signatures and safely delete unused assets (deletion is automatically blocked with `409 Conflict` if an asset is still referenced by any portfolio item).
  - **Contact Inbox:** Read, mark read/unread, or delete messages submitted through the public Contact form.
  - **Site & Appearance:** Configure site title, SEO description/keywords, default theme (`dark` / `light`), theme toggle visibility (`enableThemeToggle`), and Three.js ambient backdrop (`enableThreeD`).
