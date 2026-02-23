---
oat_generated: true
oat_generated_at: 2026-02-23
oat_pr_type: project
oat_pr_scope: final
oat_project: .oat/projects/shared/b15-b02-project-lifecycle-config-consolidation
---

# PR: b15-b02-project-lifecycle-config-consolidation

## Summary

This project consolidates OAT project lifecycle state into config files and adds first-class lifecycle commands for opening and pausing projects. It replaces pointer-file-centric flows with config-backed helpers and `oat config get/set/list`, then migrates CLI consumers, dashboards, and project skills to the new interface.

This is an `import`-mode OAT project, so PR rationale is derived from the imported source plan plus implementation artifacts (no local `spec.md` / `design.md`). Final code review is marked `passed` after a re-review cycle that verified all Phase 12 fix tasks.

## Goals / Non-Goals

- Goals:
  - Add `oat project open` and `oat project pause` lifecycle commands.
  - Consolidate `activeProject` and `projects.root` usage into `.oat/config.local.json` / `.oat/config.json` with shared helpers.
  - Provide `oat config get/set/list` so skills and scripts avoid raw file parsing / `jq` snippets.
  - Migrate CLI consumers, state dashboard generation, and OAT skills to config-backed lifecycle state.
- Non-Goals:
  - Migrate active-idea pointers (`.oat/active-idea`, `~/.oat/active-idea`) into config (explicitly deferred follow-up).
  - Preserve legacy pointer-file fallback behavior long-term (removed in later phase after migration).

## What Changed

- Phase 1: Extracted shared frontmatter write utilities for lifecycle commands (`upsertFrontmatterField`, `replaceFrontmatter`; later review fix added shared `removeFrontmatterField`).
- Phase 2: Added OAT config utility layer for reading/writing `.oat/config.json` and `.oat/config.local.json`, including active-project helpers and repo-relative normalization.
- Phase 3: Added `oat config get/set/list` with key routing, JSON output, env override handling, and unknown-key error behavior.
- Phase 4-5: Added `oat project open` and `oat project pause` commands with pause/resume semantics, `lastPausedProject`, and dashboard refresh integration.
- Phase 6: Updated state dashboard generation to read config-local lifecycle state and render pause-aware guidance.
- Phase 7: Migrated CLI consumers (`project new`, `set-mode`, cleanup, install-workflows`) to config helpers.
- Phase 8-10: Migrated project skills and worktree bootstrap docs/flows to `oat config` commands and removed legacy pointer fallback logic.
- Phase 11: Added ADR-012 / ADR-013 and completed end-to-end verification + follow-up capture.
- Phase 12 (review fixes):
  - aligned stale skill docs to config-local active-project semantics,
  - fixed `create-oat-skill` projects-root guidance,
  - shared `removeFrontmatterField`,
  - added regression coverage for unknown `oat config get` keys,
  - updated `oat-project-subagent-implement` docs.

## Verification

Implementation artifact records the following verification coverage:

- `pnpm --filter @oat/cli test`
- `pnpm build`
- `pnpm lint`
- `pnpm type-check`
- CLI smoke checks for config/open/pause/state refresh
- `pnpm oat:validate-skills`
- Phase 12 focused regression checks:
  - `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/open/index.test.ts packages/cli/src/commands/project/pause/index.test.ts packages/cli/src/commands/shared/frontmatter-write.test.ts`
  - `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/config/index.test.ts`
  - scoped `rg` checks for migrated skill docs

Git change summary from merge-base vs `main`:
- 25 commits (`cb613bb..c20d94f` on top of merge-base `b31c0776`)
- `68 files changed, 4537 insertions(+), 396 deletions(-)`

## Reviews

Relevant review status from `plan.md`:

- `| final | code | passed | 2026-02-23 | reviews/final-review-2026-02-23.md |`

Review artifacts of note:
- `reviews/final-review-2026-02-22.md` (initial final review; findings converted into Phase 12 fix tasks)
- `reviews/final-review-2026-02-23.md` (final re-review; passed, no Critical/Important findings)

## References

- Plan: `.oat/projects/shared/b15-b02-project-lifecycle-config-consolidation/plan.md`
- Implementation: `.oat/projects/shared/b15-b02-project-lifecycle-config-consolidation/implementation.md`
- State: `.oat/projects/shared/b15-b02-project-lifecycle-config-consolidation/state.md`
- Imported Source: `.oat/projects/shared/b15-b02-project-lifecycle-config-consolidation/references/imported-plan.md`
- Reviews: `.oat/projects/shared/b15-b02-project-lifecycle-config-consolidation/reviews/`
- Decision Record: `.oat/repo/reference/decision-record.md`
