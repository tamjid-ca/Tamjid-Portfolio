---
name: phase-completion-and-git
description: >-
  Use this skill at the conclusion of every project phase to run the Phase
  Completion Gate checklist, update context.md, inspect git diff for secrets,
  and create a verified phase commit.
---

# Phase Completion Gate & Git Discipline Skill

## When to Use
- Concluding any phase (Phase 0 through Phase 11) before committing or reporting completion.
- Resuming work across sessions via `continue with context.md`.

## Required Inputs
- `context.md`
- `git status` and `git diff`

## Step-by-Step Workflow
1. **Execute Verification Suite:** Run TypeScript check, ESLint, unit/integration tests, E2E/visual checks, and production build (where applicable to the phase).
2. **Audit Git Working Tree:** Run `git status` and `git diff` to confirm no `.env` files, secrets, API keys, or unrelated files are staged.
3. **Update `context.md` (First Pass):** Update phase status, completed deliverables, test results, architectural decisions, known issues, and exact next actions in `context.md`.
4. **Commit Phase Work:** Stage verified files and commit on branch `version2` using the conventional phase commit message.
5. **Record Commit Hash:** Obtain `git rev-parse HEAD` and ensure `context.md` and the phase report accurately reflect the verified commit.

## Quality Checklist
- [ ] Current branch is `version2`.
- [ ] All phase acceptance criteria and tests pass.
- [ ] Zero secrets or `.env` files are tracked by Git.
- [ ] `context.md` reflects the true state of the repository and specifies the exact next phase and task.

## Common Mistakes
- Advancing to the next phase without committing the current phase or when required phase gate checks fail.
- Forgetting to update `context.md` before finishing a phase.

## Verification Requirements
- `git log -n 2 --oneline` and `git status` confirm a clean, verified commit on `version2`.
