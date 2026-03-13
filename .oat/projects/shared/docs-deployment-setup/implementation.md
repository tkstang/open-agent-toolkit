---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-13
oat_current_task_id: p01-t01
oat_generated: true
---

# Implementation: docs-deployment-setup

**Started:** 2026-03-13
**Last Updated:** 2026-03-13

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
>
> - `oat_current_task_id` always points at the **next plan task to do** (not the last completed task).
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are **not** plan tasks. Track review status in `plan.md` under `## Reviews` (e.g., `| final | code | passed | ... |`).
> - Keep phase/task statuses consistent with the Progress Overview table so restarts resume correctly.
> - Before running the `oat-project-pr-final` skill, ensure `## Final Summary (for PR/docs)` is filled with what was actually implemented.

## Progress Overview

| Phase          | Status      | Tasks | Completed |
| -------------- | ----------- | ----- | --------- |
| Phase 1 (orig) | completed   | 2     | 2/2       |
| Phase 1 (fix)  | in_progress | 3     | 0/3       |

**Total:** 2/5 tasks completed

---

## Phase 1: Docs Build Separation and Deployment

**Status:** completed
**Started:** 2026-03-13

### Phase Summary

**Outcome (what changed):**

- `pnpm build` no longer includes the docs app, making non-docs builds significantly faster
- New `pnpm build:docs` command builds docs and all workspace dependencies via Turborepo filter
- GitHub Pages deployment workflow triggers on push to main with change detection for docs-related paths
- Turborepo cache outputs for oat-docs now include `out/**` (static export artifact)

**Key files touched:**

- `package.json` - Added `build:docs`, updated `build` filter
- `apps/oat-docs/turbo.json` - Added `out/**` to cached outputs
- `.github/workflows/deploy-docs.yml` - New GitHub Pages deployment workflow
- `AGENTS.md` - Documented new `build:docs` command

**Verification:**

- Run: `pnpm build` — confirms docs excluded (4 packages, no oat-docs)
- Run: `pnpm build:docs` — confirms docs + dependencies build (5 packages including oat-docs)
- Result: Both commands pass. `pnpm build` runs in ~444ms (full cache), `pnpm build:docs` completes with static export to `out/`

### Task p01-t01: Separate docs from default build

**Status:** completed
**Commit:** 6237eb24

**Outcome:**

- `pnpm build` uses `--filter='!oat-docs'` to exclude the docs app
- `pnpm build:docs` uses `--filter=oat-docs...` to build docs with all workspace dependencies
- Turborepo's `...` suffix ensures docs-config, docs-theme, docs-transforms, and cli all build first
- `AGENTS.md` updated with the new command

**Files changed:**

- `package.json` - Updated `build` script, added `build:docs` script
- `apps/oat-docs/turbo.json` - Added `out/**` to build outputs (was missing for static export)
- `AGENTS.md` - Documented `build:docs` in Essential Commands

### Task p01-t02: Add GitHub Pages deployment workflow

**Status:** completed
**Commit:** 6237eb24

**Outcome:**

- GitHub Pages deployment workflow triggers on push to main and manual dispatch
- Change detection watches `apps/oat-docs/**` and all three docs packages (`packages/docs-config/**`, `packages/docs-theme/**`, `packages/docs-transforms/**`)
- Skips deployment when no docs-related files changed (unless manual dispatch)
- Uses standard GitHub Pages actions: `configure-pages`, `upload-pages-artifact`, `deploy-pages`
- Uploads static export from `apps/oat-docs/out/`

**Files changed:**

- `.github/workflows/deploy-docs.yml` - New workflow file

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

### 2026-03-13

**Session Start:** conversation session

- [x] p01-t01: Separate docs from default build - 6237eb24
- [x] p01-t02: Add GitHub Pages deployment workflow - 6237eb24

**What changed (high level):**

- Docs build separated from main build pipeline via Turborepo filter
- GitHub Pages deployment workflow added with smart change detection
- Turbo cache outputs fixed for static export

**Decisions:**

- GitHub Pages chosen over S3+Fastly for simplicity (open source project)
- Broader change detection than Honeycomb's MkDocs pattern (workspace package dependencies)
- Both tasks in single commit since they're tightly coupled

**Follow-ups / TODO:**

- Enable GitHub Pages in repo settings (Settings > Pages > Source: GitHub Actions)
- Configure `basePath` in Next.js config if serving from a repo subpath
- Consider custom domain / Fastly CDN later if needed under Vox Media domain

---

### Review Received: final

**Date:** 2026-03-13
**Review artifact:** reviews/archived/final-review-2026-03-13.md

**Findings:**

- Critical: 0
- Important: 2
- Medium: 0
- Minor: 2

**New tasks added:** p01-t01, p01-t02, p01-t03

**Disposition map:**

- I1 → converted (p01-t01): Add docs build validation to CI
- I2 → converted (p01-t02): Replace tj-actions with native git diff and paths filter
- m1 → converted (p01-t03): Add paths filter to deploy workflow trigger (addressed by p01-t02)
- m2 → deferred: Plan artifact not populated — expected for captured/retroactive project, no code fix needed

**Next:** Execute fix tasks via the `oat-project-implement` skill.

After the fix tasks are complete:

- Update the review row status to `fixes_completed`
- Re-run `oat-project-review-provide code final` then `oat-project-review-receive` to reach `passed`

---

## Final Summary (for PR/docs)

**What shipped:**

- Faster default builds by excluding docs from `pnpm build`
- Dedicated `pnpm build:docs` command for docs development
- Automated GitHub Pages deployment on push to main

**Behavioral changes (user-facing):**

- `pnpm build` no longer builds docs (much faster for non-docs work)
- `pnpm build:docs` is the new way to build docs locally
- Docs auto-deploy to GitHub Pages when docs-related files change on main

**Key files / modules:**

- `package.json` - Build script separation
- `.github/workflows/deploy-docs.yml` - Deployment pipeline
- `apps/oat-docs/turbo.json` - Cache output fix

**Verification performed:**

- `pnpm build` — runs without docs, 4 packages in scope
- `pnpm build:docs` — builds all 5 packages including docs, static export succeeds

## References

- Plan: `plan.md`
- Discovery: `discovery.md`
