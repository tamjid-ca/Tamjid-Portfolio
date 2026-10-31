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
1. Fetch all public portfolio collections in parallel (`Promise.all`) inside `PortfolioAggregatorService` wrapped in `unstable_cache` with tag `portfolio-public`.
2. Confirm every admin mutation triggers `revalidateTag('portfolio-public')` and `revalidatePath('/')`.
3. Load `Poppins` (`300`, `400`, `500`, `600`) via `next/font/google` with `display: 'swap'` and set explicit `width`/`height` on all images.
4. Confirm dynamic Open Graph / Twitter metadata, semantic headings, `aria-label` on icon buttons, and `robots.ts` excluding `/admin`.

## Quality Checklist
- [ ] Zero sequential DB waterfalls on public page load.
- [ ] `three` is isolated to an async lazy-loaded chunk.
- [ ] Admin mutations immediately reflect on the public portfolio without stale cache.

## Common Mistakes
- Forgetting `aria-label` on icon-only buttons (`Show Contacts`, `Close Modal`, social links, theme toggle).

## Verification Requirements
- Production build analysis (`npm run build`), cache invalidation tests, and accessibility/SEO assertions pass.
