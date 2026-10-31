---
name: portfolio-design-preservation
description: >-
  Use this skill when implementing, modifying, or reviewing public portfolio UI
  components, stylesheets, themes, or responsive layouts to ensure 1:1 visual
  fidelity with the original Tamjid Portfolio design and baseline screenshots.
---

# Portfolio Design Preservation Skill

## When to Use
- Migrating HTML/CSS sections (`Sidebar`, `Navbar`, `About`, `Resume`, `Portfolio`, `Blog`, `Contact`) into Next.js components.
- Implementing Dark (default) and Light theme semantic tokens.
- Reviewing responsive behavior across the 5 original breakpoints (`450px`, `580px`, `768px`, `1024px`, `1250px`).

## Required Inputs
- `docs/DESIGN_INVENTORY.md`
- `docs/screenshots/baseline/baseline-desktop.png` (`1440x1200`)
- `docs/screenshots/baseline/baseline-tablet.png` (`768x1200`)
- `docs/screenshots/baseline/baseline-mobile.png` (`500x1200`)

## Step-by-Step Workflow
1. **Verify DOM & Class Names:** Match the exact class hierarchy from `index.html` (`.sidebar`, `.main-content`, `.navbar`, `article.about`, `.service-item`, `.content-card`, `.timeline-list`, `.project-item`, `.blog-post-item`, `.mapbox`, `.contact-form`).
2. **Preserve Gradient Borders:** Retain the `::before` pseudo-element (`inset: 1px; z-index: -1`) paired with `--border-gradient-onyx` on cards, buttons, and icon boxes.
3. **Preserve Breakpoints:** Ensure media queries trigger at `450px`, `580px`, `768px`, `1024px`, and `1250px` with exact container widths (`520px`, `700px`, `950px`, `1200px` flex).
4. **Capture & Compare Screenshots:** Render the Next.js page at matching viewports (`1440x1200`, `768x1200`, `500x1200`) and compare against `docs/screenshots/baseline/`.

## Quality Checklist
- [ ] Dark theme colors and gradients match `assets/css/style.css` 1:1.
- [ ] `Poppins` font weights (`300`, `400`, `500`, `600`) and `--fs-1`..`--fs-8` sizes match across breakpoints.
- [ ] Empty or optional collections do not break card alignment or timeline connectors.
- [ ] Ionicons match the original stroke widths (`--ionicon-stroke-width: 35px` / `50px`).

## Common Mistakes
- Replacing custom CSS rules with generic Tailwind spacing or rounded corners that alter card proportions.
- Changing the desktop sticky sidebar (`>=1250px`) or top-right navbar (`>=1024px`) positioning.
- Allowing empty timeline items to render stray vertical lines when filtered out.

## Verification Requirements
- Visual comparison against `docs/screenshots/baseline/*.png` at desktop, tablet, and mobile viewports passes with zero unintended layout differences.
