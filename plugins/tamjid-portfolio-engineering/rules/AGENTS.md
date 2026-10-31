# Tamjid Portfolio Engineering Plugin Rules

- Preserve the original Tamjid Portfolio visual design, layout proportions, CSS custom properties, and responsive breakpoints (`450px`, `580px`, `768px`, `1024px`, `1250px`).
- Enforce strict separation between Next.js UI components (`src/components/`), domain services (`src/services/`), and Mongoose repositories (`src/repositories/`).
- Validate all inputs with Zod and verify admin session authorization independently on every protected server mutation.
- Keep `context.md` updated at the conclusion of every phase.
