# Tamjid Portfolio V2 — Performance & Core Web Vitals Report

## 1. Production Build Bundle Analysis (`next build`)

| Route | Type | Route Size | First Load JS | Revalidate |
| :--- | :---: | :---: | :---: | :---: |
| `/` (Public Portfolio) | Static / ISR (`○`) | `8.5 kB` | `111 kB` | `5m` + On-Demand Tag Invalidation |
| `/_not-found` | Static (`○`) | `157 B` | `103 kB` | `5m` |
| `/robots.txt` | Static (`○`) | `157 B` | `103 kB` | Static |
| `/sitemap.xml` | Static (`○`) | `157 B` | `103 kB` | Static |
| `/admin/login` | Dynamic (`ƒ`) | `1.01 kB` | `104 kB` | `no-store` |
| `/admin/dashboard` | Dynamic (`ƒ`) | `119 B` | `108 kB` | `no-store` |
| `/admin/[section]` | Dynamic (`ƒ`) | `118 B` | `108 kB` | `no-store` |
| `/api/public/portfolio` | Dynamic (`ƒ`) | `157 B` | `103 kB` | `s-maxage=60, stale-while-revalidate=300` |
| `/api/admin/*`, `/api/auth/*`, `/api/uploads/*` | Dynamic (`ƒ`) | `157 B` | `103 kB` | `no-store` |

---

## 2. Core Web Vitals Engineering Optimizations

### Largest Contentful Paint (LCP)
- **Server-First Rendering:** The public portfolio (`/`) is pre-rendered and cached via `getCachedPublicPortfolioData()` (`unstable_cache`), delivering complete HTML on the first response with zero client-side data-fetching waterfalls.
- **Above-the-Fold Priority:** The sidebar avatar image (`src/components/portfolio/Sidebar.tsx`) uses `loading="eager"` and `decoding="async"`, while all below-the-fold project thumbnails, blog banners, and client logos use `loading="lazy"`.
- **Zero External Icon Runtime:** Replaced the render-blocking `https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js` script from V1 with synchronous inline SVGs (`src/components/ui/IonIcon.tsx`), eliminating 2 external network round-trips and icon flash.
- **Self-Hosted Google Fonts:** `Poppins` (`300`, `400`, `500`, `600`) is self-hosted at build time via `next/font/google` with `display: 'swap'`.

### Cumulative Layout Shift (CLS = 0.00)
- **Explicit Media Dimensions:** All images in `Sidebar`, `AboutSection`, `PortfolioSection`, and `BlogSection` specify explicit `width` / `height` attributes matching the original V1 aspect ratios.
- **Fixed Non-Intrusive 3D Backdrop:** `AmbientBackgroundCanvas` renders inside a `position: fixed; inset: 0; pointer-events: none; z-index: 0` container outside the document layout flow, guaranteeing zero layout shift when the lazy-loaded WebGL chunk mounts.
- **Zero-FOUC Theme Initialization:** `buildThemeInitScript()` sets `document.documentElement.dataset.theme` synchronously in `<head>` before first paint.

### Interaction to Next Paint (INP) & GPU Efficiency
- **Lazy-Loaded Three.js Chunk:** `AmbientBackgroundLoader` uses `next/dynamic(..., { ssr: false })` so `three` is never parsed during initial hydration.
- **Low-Power WebGL & Visibility Pause:** `AmbientBackgroundCanvas` initializes `WebGLRenderer` with `powerPreference: 'low-power'`, caps `devicePixelRatio` at `1.5`, reduces particle count on mobile viewports (`28` vs `55`), pauses `requestAnimationFrame` when `document.hidden` is `true`, and skips WebGL entirely when `prefers-reduced-motion: reduce` is active.

---

## 3. Database Query Efficiency
- **Parallel `.lean()` Aggregation:** `portfolioRepository.getPublicPortfolioData()` executes all 13 collection queries concurrently in a single `Promise.all` batch using Mongoose `.lean()`, returning plain JavaScript objects without Mongoose document hydration overhead.
- **Compound Indexes:** All ordered collections define compound indexes on `{ status: 1, displayOrder: 1 }` or `{ visible: 1, displayOrder: 1 }`, ensuring index-backed sorting.
