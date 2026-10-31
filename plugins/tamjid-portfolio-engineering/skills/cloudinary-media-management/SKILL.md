---
name: cloudinary-media-management
description: >-
  Use this skill when implementing Cloudinary signed uploads, asset metadata
  storage, responsive image URL transformations, or reference-checked media
  deletion.
---

# Cloudinary Media Management Skill

## When to Use
- Implementing `src/lib/cloudinary/`, `/api/uploads/*`, `MediaAsset` repository/service, or Admin CMS media pickers.
- Rendering optimized images on the public portfolio or admin previews.

## Required Inputs
- `docs/ARCHITECTURE_PLAN.md`
- Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) or local asset fallback paths.

## Step-by-Step Workflow
1. Generate upload signatures exclusively on the server after verifying an active admin session.
2. Validate MIME types, extensions, and max file sizes before signing or accepting metadata.
3. Persist `publicId`, `secureUrl`, `folder`, `format`, `width`, `height`, `bytes`, and `altText` in the `MediaAsset` collection.
4. Before deleting any asset from Cloudinary or `MediaAsset`, scan all content collections for active references and reject with `409 Conflict` if referenced.

## Quality Checklist
- [ ] `CLOUDINARY_API_SECRET` is never exposed to client bundles.
- [ ] Local static assets (`/assets/images/*`) continue to render seamlessly when `publicId` is empty.
- [ ] Deletion of in-use assets is blocked and tested.

## Common Mistakes
- Trusting client-supplied `publicId` strings for deletion without verifying folder prefix (`portfolio/`) and reference count.

## Verification Requirements
- Automated tests cover signature generation, MIME/size rejection, unauthorized upload rejection, and reference-blocked asset deletion.
