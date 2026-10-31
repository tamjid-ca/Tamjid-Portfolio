---
name: mongodb-data-engineering
description: >-
  Use this skill when creating or modifying Mongoose schemas, database
  connections, indexes, repositories, or seed scripts for MongoDB.
---

# MongoDB Data Engineering Skill

## When to Use
- Implementing `src/lib/mongodb/`, `src/models/`, `src/repositories/`, or `src/seed/`.
- Designing queries, projections, sorting, pagination, and indexes.
- Creating or running idempotent database seed/migration scripts.

## Required Inputs
- `docs/CONTENT_INVENTORY.md`
- `docs/ARCHITECTURE_PLAN.md`

## Step-by-Step Workflow
1. Use a cached global Mongoose connection promise (`global._mongooseCache`) in `src/lib/mongodb/connection.ts`.
2. Register models using `mongoose.models.ModelName || mongoose.model('ModelName', schema)`.
3. Add compound indexes matching read patterns (`{ visible: 1, displayOrder: 1 }`, `{ status: 1, displayOrder: 1 }`, `{ slug: 1 }`).
4. Use `.lean()` on all read queries and map `_id` to string `id` before returning DTOs.
5. Ensure public read services fall back cleanly to the canonical V1 seed dataset if `MONGODB_URI` is unreachable.

## Quality Checklist
- [ ] Every collection in `docs/CONTENT_INVENTORY.md` has a typed Mongoose model and Zod validation schema.
- [ ] All read queries use `.lean()` and deterministic sorting (`{ displayOrder: 1, createdAt: 1 }`).
- [ ] Seed script is 100% idempotent and preserves original V1 content.
- [ ] User inputs are sanitized against NoSQL operator injection (`$gt`, `$ne`, `$where`).

## Common Mistakes
- Creating a new `mongoose.connect()` call per request without global caching.
- Returning raw Mongoose hydrated documents to UI components.

## Verification Requirements
- Unit and integration tests verify schema validation, repository CRUD, index definitions, and seed idempotency.
