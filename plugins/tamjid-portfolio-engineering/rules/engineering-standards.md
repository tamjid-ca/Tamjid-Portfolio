---
trigger: always_on
---

# Tamjid Portfolio V2 — Engineering Standards

1. **Design Fidelity First:** Never replace original Tamjid Portfolio components or CSS properties (`--smoky-black`, `--eerie-black-2`, `--orange-yellow-crayola`, `--border-gradient-onyx`) with generic templates.
2. **Modular Data Access:** Keep Mongoose models inside `src/models/`, queries inside `src/repositories/`, and domain logic inside `src/services/`.
3. **Security by Default:** Verify admin sessions independently on every mutation, hash passwords with Argon2id/scrypt, sign Cloudinary uploads server-side, and validate all inputs with Zod.
4. **Phase Gate Compliance:** Update `context.md` and pass all verification tests before committing each phase on `version2`.
