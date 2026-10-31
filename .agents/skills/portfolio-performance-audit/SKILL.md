---
name: portfolio-performance-audit
description: >-
  Use this skill when auditing or optimizing Next.js rendering, caching, bundle
  sizes, images, fonts, database query latency, SEO metadata, and Core Web
  Vitals.
---

# Portfolio Performance, Caching & SEO Audit Skill

## When to Use
- Implementing caching and tag invalidation (`src/lib/cache/`, `docs/CACHING_STRATEGY.md`).
- Optimizing images, fonts (`next/font/google`), bundle sizes, and metadata (`generateMetadata`, `sitemap.ts`, `robots.ts`).
- Running Lighthouse / Core Web Vitals checks in Phase 9 and Phase 10.

## Required Inputs
- `docs/ARCHITECTURE_PLAN.md`
- Next.js build output (`npm run build`)

## Step-by-Step Workflow
1. **Verify Parallel Server Fetching:** Fetch all public portfolio collections in parallel (`Promise.all`) inside `PortfolioAggregatorService` wrapped in `unstable_cache` with tag `portfolio-public`.
2. **Verify Instant Cache Invalidation:** Confirm every admin create/update/delete/reorder operation triggers `revalidateTag('portfolio-public')` and `revalidatePath('/')`.
3. **Optimize Font & Media Delivery:** Load `Poppins` (`300`, `400`, `500`, `600`) via `next/font/google` with `display: 'swap'`. Set explicit `width` and `height` on all images to prevent CLS, prioritizing only the sidebar avatar above the fold.
4. **Verify SEO & Accessibility:** Confirm dynamic Open Graph / Twitter metadata, semantic headings (`h1` -> `h2` -> `h3` -> `h4`), `aria-label` on icon buttons, keyboard navigation on tabs/modals, and `robots.ts` excluding `/admin`.

## Quality Checklist
- [ ] Zero sequential DB waterfalls on public page load.
- [ ] `three` is isolated to an async lazy-loaded chunk.
- [ ] Admin mutations immediately reflect on the public portfolio without stale cache.
- [ ] All images have descriptive `alt` text and explicit aspect ratios/dimensions.

## Common Mistakes
- Using `force-dynamic` on the public portfolio page when tagged caching + on-demand revalidation provides instant static speed with live CMS updates.
- Forgetting `aria-label` on icon-only buttons (`Show Contacts`, `Close Modal`, social links, theme toggle).

## Verification Requirements
- Production build analysis (`npm run build`), cache invalidation tests, and accessibility/SEO assertions pass.
