---
name: threejs-performance
description: >-
  Use this skill when integrating Three.js, React Three Fiber, Drei, or motion
  enhancements to ensure zero layout shift, low GPU overhead, reduced-motion
  compliance, and graceful WebGL fallbacks.
---

# Three.js & WebGL Performance Skill

## When to Use
- Implementing `src/components/animations/` or integrating 3D background/hero effects into the public portfolio.
- Auditing WebGL resource cleanup, mobile frame rates, and accessibility compliance.

## Required Inputs
- `docs/DESIGN_INVENTORY.md`
- `docs/ARCHITECTURE_PLAN.md`

## Step-by-Step Workflow
1. **Dynamic Client-Only Loading:** Load all Three.js / React Three Fiber canvas components via `next/dynamic(() => import(...), { ssr: false })` so they never block SSR or inflate the critical HTML payload.
2. **Non-Intrusive Placement:** Render the 3D scene strictly as a pointer-events-none ambient backdrop (`position: fixed; inset: 0; z-index: 0; pointer-events: none`) behind `<main>`, keeping `.sidebar` and `article` (`z-index: 1`) completely untouched in layout and proportions.
3. **Respect User & Admin Preferences:** Immediately bypass WebGL initialization and render a zero-cost static CSS fallback when:
   - `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`,
   - `SiteSettings.enableThreeD` is `false`, or
   - WebGL context creation fails.
4. **GPU Lifecycle Hygiene:** Use `frameloop="demand"` or pause rendering when `document.hidden` is true or the canvas is outside the viewport (`IntersectionObserver`), cap `dpr={[1, 1.5]}`, and dispose geometries/materials on unmount.

## Quality Checklist
- [ ] Cumulative Layout Shift (CLS) remains `0.00`.
- [ ] Original card positions, dimensions, and colors in `.sidebar` and `.main-content` are unchanged.
- [ ] `prefers-reduced-motion: reduce` disables 3D animation completely.
- [ ] WebGL failure boundary catches missing GPU contexts without crashing the page.

## Common Mistakes
- Bundling `three` into the main synchronous entry chunk.
- Placing 3D canvases inside content flow where they push or resize original portfolio elements.
- Running uncapped `dpr` on mobile Retina screens.

## Verification Requirements
- Component and E2E tests verify fallback rendering under `prefers-reduced-motion: reduce`, missing WebGL context, and zero layout shift across desktop/tablet/mobile.
