---
name: nextjs-architecture
description: >-
  Use this skill when designing routes, layouts, Server Components, Client
  Components, Route Handlers, or Server Actions in the Next.js App Router to
  enforce clean layering and strict Server/Client boundaries.
---

# Next.js App Router Architecture Skill

## When to Use
- Creating or refactoring files under `src/app/`, `src/components/`, `src/services/`, or `src/repositories/`.
- Deciding whether a component should be a Server Component or Client Component.
- Implementing API routes or Server Actions.

## Required Inputs
- `docs/ARCHITECTURE_PLAN.md`
- Target route or component specification.

## Step-by-Step Workflow
1. Keep route `page.tsx` and `layout.tsx` files as async Server Components that fetch data via `src/services/`.
2. Extract interactive behaviors (tab switching, sidebar toggle, category filter, testimonial modal, contact form state, theme toggle, 3D canvas) into leaf `"use client"` components receiving serializable props.
3. Route Handlers (`src/app/api/`) and Server Actions must delegate business logic to `src/services/`.
4. Never import `mongoose`, `src/models/*`, `src/repositories/*`, or server secrets inside `"use client"` modules.

## Quality Checklist
- [ ] Zero Mongoose documents or `ObjectId` instances passed directly to Client Components.
- [ ] Public routes (`(public)`) and Admin routes (`admin/`) have isolated layouts and styles.
- [ ] `robots.ts` disallows `/admin` and `/api`.
- [ ] `next build` and `tsc --noEmit` succeed without warnings or hydration mismatches.

## Common Mistakes
- Marking top-level page shells with `"use client"`, forcing client-side data waterfalls.
- Passing non-serializable Mongoose documents across the RSC-to-Client boundary.

## Verification Requirements
- `npm run typecheck`, `npm run lint`, and `npm run build` succeed cleanly.
