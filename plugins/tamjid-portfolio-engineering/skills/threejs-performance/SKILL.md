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
1. Load all Three.js / React Three Fiber canvas components via `next/dynamic(() => import(...), { ssr: false })`.
2. Render the 3D scene strictly as a pointer-events-none ambient backdrop (`position: fixed; inset: 0; z-index: 0; pointer-events: none`) behind `<main>`.
3. Immediately bypass WebGL initialization and render a static fallback when `prefers-reduced-motion: reduce` is active, `SiteSettings.enableThreeD` is `false`, or WebGL initialization fails.
4. Pause rendering when `document.hidden` is true or offscreen, cap `dpr={[1, 1.5]}`, and dispose geometries/materials on unmount.

## Quality Checklist
- [ ] Cumulative Layout Shift (CLS) remains `0.00`.
- [ ] `prefers-reduced-motion: reduce` disables 3D animation completely.
- [ ] WebGL failure boundary catches missing GPU contexts without crashing the page.

## Common Mistakes
- Bundling `three` into the main synchronous entry chunk.
- Placing 3D canvases inside content flow where they push or resize original portfolio elements.

## Verification Requirements
- Component and E2E tests verify fallback rendering under `prefers-reduced-motion: reduce`, missing WebGL context, and zero layout shift.
