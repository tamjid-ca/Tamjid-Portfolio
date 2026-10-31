# Tamjid Portfolio V2 — Antigravity Engineering Rules (`AGENTS.md`)

## 1. Core Mandate & Visual Preservation
- **Source of Truth:** The original static portfolio (`index.html`, `assets/css/style.css`, `assets/js/script.js`) and baseline screenshots in `docs/screenshots/baseline/` are the visual reference.
- **No Unauthorized Redesign:** Preserve exact layout geometry, card border gradients (`--border-gradient-onyx` + `::before`), typography scale (`Poppins` `--fs-1` to `--fs-8`), shadows (`--shadow-1` to `--shadow-5`), and the 5 responsive breakpoints (`450px`, `580px`, `768px`, `1024px`, `1250px`).
- **Admin Separation:** The `/admin` CMS is visually and architecturally isolated from the public portfolio shell and must never pollute public styles or bundles.

## 2. Clean Architecture & Layer Boundaries
- **Server-First Rendering:** Default to Next.js App Router Server Components for public data fetching. Use Client Components (`"use client"`) strictly for interactive islands (Sidebar drawer toggle, Navbar tab switching, Portfolio category filtering, Testimonial modal, Contact form, Theme toggle, Three.js canvas).
- **Strict Layering:**
  - `src/components/` -> Pure UI and client state; **never** import Mongoose models or `src/lib/mongodb`.
  - `src/repositories/` -> Database queries using `.lean()` and returning plain serializable DTOs.
  - `src/services/` -> Business logic, reference checks, fallback seed synthesis, and cache invalidation (`revalidateTag`, `revalidatePath`).
  - `src/lib/validation/` -> Zod schemas enforced at every Route Handler and Server Action boundary.

## 3. Security & Data Integrity
- **Zero Hardcoded Secrets:** Never commit `.env` files, API keys, database URIs, or session secrets.
- **Independent Authorization:** Every admin mutation (`POST`, `PUT`, `PATCH`, `DELETE` under `/api/admin/*` or Server Actions) must independently verify the authenticated admin session on the server; never rely solely on middleware or UI hiding.
- **Media Safety:** Generate Cloudinary upload signatures exclusively on the server (`src/lib/cloudinary/`). Block deletion of any `MediaAsset` still referenced by portfolio documents.
- **NoSQL Injection & XSS Prevention:** Validate and sanitize all external inputs via Zod; strip `$` / `.` operator keys from user objects before querying MongoDB.

## 4. Phase Discipline & Context Recovery
- **Persistent Memory:** Always read `context.md` first when resuming a session (`continue with context.md`), verify repository and Git state against recorded progress, and resume from the exact next incomplete task.
- **Phase Completion Gate:** Never advance to the next phase until all deliverables, unit/integration/E2E tests, TypeScript checks, lint checks, build verification, `context.md` updates, and phase Git commits are completed.
