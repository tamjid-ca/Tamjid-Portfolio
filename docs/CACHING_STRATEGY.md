# Tamjid Portfolio V2 — Caching, Rendering & Invalidation Strategy

## 1. Overview
Tamjid Portfolio V2 combines **instant static/cached public page delivery** with **real-time Admin CMS updates** through Next.js App Router Server Components, `unstable_cache` tag-based caching, parallel `.lean()` MongoDB aggregation, and on-demand cache invalidation (`revalidateTag` + `revalidatePath`).

---

## 2. Multi-Tier Caching Architecture

### Tier 1 — Next.js Server Data Cache (`src/lib/cache/portfolio-cache.ts`)
- **Entry Point:** `getCachedPublicPortfolioData()` wraps `portfolioService.getPublicPortfolioData()` using `unstable_cache`.
- **Revalidation Window:** `revalidate: 300` seconds (5 minutes fallback ISR) combined with instant on-demand tag invalidation.
- **Parallel Database Aggregation:** `portfolioRepository.getPublicPortfolioData()` executes all 13 collection queries concurrently via `Promise.all(...)` using Mongoose `.lean()` and compound sort indexes (`{ status: 1, displayOrder: 1 }`, `{ visible: 1, displayOrder: 1 }`), avoiding N+1 or sequential query waterfalls.
- **Resilient Fallback:** If `MONGODB_URI` is unconfigured or unreachable during build-time prerendering, `portfolioService.getPublicPortfolioData()` transparently returns `V1_PORTFOLIO_SEED_DATA` so builds and public renders never fail.

### Tier 2 — Granular & Global Cache Tags (`src/lib/cache/revalidate.ts`)
Every public portfolio domain is tagged with both the global `'portfolio-public'` tag and a domain-specific tag:

| Domain | Cache Tag Constant | Tag Value |
| :--- | :--- | :--- |
| Global Public Snapshot | `PORTFOLIO_CACHE_TAGS.PUBLIC_DATA` | `'portfolio-public'` |
| Site Settings & SEO | `PORTFOLIO_CACHE_TAGS.SITE_SETTINGS` | `'portfolio-site-settings'` |
| Profile & About | `PORTFOLIO_CACHE_TAGS.PROFILE` | `'portfolio-profile'` |
| Social Links | `PORTFOLIO_CACHE_TAGS.SOCIAL_LINKS` | `'portfolio-social-links'` |
| Navigation Items | `PORTFOLIO_CACHE_TAGS.NAVIGATION` | `'portfolio-navigation'` |
| Services | `PORTFOLIO_CACHE_TAGS.SERVICES` | `'portfolio-services'` |
| Testimonials | `PORTFOLIO_CACHE_TAGS.TESTIMONIALS` | `'portfolio-testimonials'` |
| Client Logos | `PORTFOLIO_CACHE_TAGS.CLIENTS` | `'portfolio-clients'` |
| Education | `PORTFOLIO_CACHE_TAGS.EDUCATION` | `'portfolio-education'` |
| Experience | `PORTFOLIO_CACHE_TAGS.EXPERIENCE` | `'portfolio-experience'` |
| Skills | `PORTFOLIO_CACHE_TAGS.SKILLS` | `'portfolio-skills'` |
| Achievements | `PORTFOLIO_CACHE_TAGS.ACHIEVEMENTS` | `'portfolio-achievements'` |
| Projects | `PORTFOLIO_CACHE_TAGS.PROJECTS` | `'portfolio-projects'` |
| Blog Posts | `PORTFOLIO_CACHE_TAGS.BLOG_POSTS` | `'portfolio-blog-posts'` |

When an authenticated admin performs any create, update, reorder, delete, or seed mutation via `/api/admin/portfolio` or `portfolioService`, `revalidatePortfolioCache()` immediately executes:
1. `revalidateTag('portfolio-public')`
2. `revalidateTag(<domain-tag>)`
3. `revalidatePath('/')`

### Tier 3 — Public Snapshot API Edge Caching (`src/app/api/public/portfolio/route.ts`)
- `GET /api/public/portfolio` serves the sanitized public portfolio JSON with `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.

### Tier 4 — Strict Admin & Auth Cache Bypass
- All Admin CMS pages (`/admin/login`, `/admin/dashboard`, `/admin/[section]`) and protected API routes (`/api/admin/*`, `/api/auth/*`, `/api/uploads/*`) declare `export const dynamic = 'force-dynamic'`.
- All admin and auth responses attach `ADMIN_SECURITY_HEADERS` (`Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, `X-Robots-Tag: noindex, nofollow`, `X-Frame-Options: DENY`).
- Admin dashboard reads invoke `portfolioService.getAdminPortfolioData()`, which queries MongoDB directly (bypassing `unstable_cache`) so admins always see live draft and published documents.

### Tier 5 — Font, Media & Bundle Optimization
- **Typography (`next/font/google`):** `Poppins` (`300`, `400`, `500`, `600`) is self-hosted at build time with `display: 'swap'` and exposed via `--font-poppins`.
- **Cloudinary Responsive Delivery (`src/lib/cloudinary/url.ts`):** `buildCloudinaryImageUrl()` injects `f_auto,q_auto,c_limit,w_{width}` into Cloudinary asset URLs while leaving local `/assets/images/*` paths untouched.
- **Explicit Image Dimensions:** Every `<img>` in `Sidebar`, `AboutSection`, `PortfolioSection`, and `BlogSection` specifies explicit `width`, `height`, and `loading` attributes (`eager` only for the above-the-fold sidebar avatar, `lazy` for below-the-fold cards) to maintain `CLS = 0.00`.
- **Async 3D Chunk Isolation:** `AmbientBackgroundLoader` loads `AmbientBackgroundCanvas` (`three`) via `next/dynamic(..., { ssr: false })`, keeping `three` out of the synchronous First Load JS bundle (`111 kB` on `/`).
