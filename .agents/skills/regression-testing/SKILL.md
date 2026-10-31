---
name: regression-testing
description: >-
  Use this skill when writing or executing unit, integration, end-to-end, or
  visual regression tests across desktop, tablet, and mobile viewports.
---

# Regression Testing & Visual Verification Skill

## When to Use
- Writing Vitest unit/integration tests or Playwright E2E tests at the end of every implementation phase.
- Performing visual comparisons between the Next.js build and the original baseline screenshots.

## Required Inputs
- `docs/screenshots/baseline/*.png`
- `docs/DESIGN_INVENTORY.md`
- `docs/CONTENT_INVENTORY.md`

## Step-by-Step Workflow
1. **Unit & Integration Coverage (Vitest):**
   - Test Zod schemas (`src/lib/validation/`), Mongoose models & repositories (`src/repositories/`), services (`src/services/`), auth utilities (`src/lib/auth/`), and Cloudinary signing/reference checks (`src/lib/cloudinary/`).
2. **Component & UI Coverage:**
   - Verify Sidebar drawer toggle, Navbar tab switching (`About`, `Resume`, `Portfolio`, `Blog`, `Contact`), Portfolio category filter (`All`, `Web design`, `Applications`, `Web development`), Testimonial modal open/close, Contact form validation, and Theme switching.
3. **Multi-Viewport Visual Verification:**
   - Capture screenshots at Desktop (`1440x1200`), Tablet (`768x1200`), and Mobile (`500x1200`) and verify layout alignment against `docs/screenshots/baseline/`.

## Quality Checklist
- [ ] All unit and integration tests pass with zero skipped or mocked-out assertions for core logic.
- [ ] Every public tab (`About`, `Resume`, `Portfolio`, `Blog`, `Contact`) renders seeded content accurately.
- [ ] Security tests verify `401` on unauthenticated admin endpoints and rate-limit lockout on repeated bad logins.

## Common Mistakes
- Accepting a passing `next build` without visually inspecting rendered output across desktop, tablet, and mobile viewports.
- Leaving failing or flaky tests unresolved before committing a phase.

## Verification Requirements
- `npm test`, `npm run typecheck`, `npm run lint`, and visual screenshot checks all succeed.
