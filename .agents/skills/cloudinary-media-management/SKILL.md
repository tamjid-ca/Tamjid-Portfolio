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
1. **Server-Side Upload Signing:** Generate upload signatures exclusively on the server after verifying an active admin session. Scope signatures to approved folders (`portfolio/profile`, `portfolio/projects`, `portfolio/experience`, `portfolio/education`, `portfolio/certifications`, `portfolio/testimonials`, `portfolio/logos`, `portfolio/miscellaneous`).
2. **Strict File Validation:** Validate MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/svg+xml`, `video/mp4`, `application/pdf`), extensions, and max file sizes before signing or accepting metadata.
3. **Store Public IDs & Metadata:** Persist `publicId`, `secureUrl`, `folder`, `format`, `width`, `height`, `bytes`, and `altText` in the `MediaAsset` collection.
4. **Reference-Checked Deletion:** Before deleting any asset from Cloudinary or `MediaAsset`, scan all content collections (`Profile`, `Service`, `Testimonial`, `ClientLogo`, `Project`, `BlogPost`, `Achievement`, `Education`, `Experience`, `SiteSettings`) for references to `publicId` or `secureUrl`. Reject deletion with `409 Conflict` if referenced.

## Quality Checklist
- [ ] `CLOUDINARY_API_SECRET` is never exposed to client bundles.
- [ ] Local static assets (`/assets/images/*`) continue to render seamlessly when `publicId` is empty.
- [ ] Replacing an image updates the target document atomically without breaking existing published views.
- [ ] Deletion of in-use assets is blocked and tested.

## Common Mistakes
- Trusting client-supplied `publicId` strings for deletion without verifying folder prefix (`portfolio/`) and reference count.
- Hardcoding transformed URLs without storing the canonical `publicId`.

## Verification Requirements
- Automated tests cover signature generation, MIME/size rejection, unauthorized upload rejection, and reference-blocked asset deletion.
