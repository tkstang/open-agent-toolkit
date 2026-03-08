---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-08
oat_current_task_id: p02-t03
oat_generated: false
oat_template: false
oat_template_name: implementation
---

# Implementation: Configurable VCS Policy + Worktree Sync

**Started:** 2026-03-08
**Last Updated:** 2026-03-08

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
> - `oat_current_task_id` always points at the **next plan task to do** (not the last completed task).
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are **not** plan tasks. Track review status in `plan.md` under `## Reviews`.
> - Keep phase/task statuses consistent with the Progress Overview table so restarts resume correctly.
> - Before running the `oat-project-pr-final` skill, ensure `## Final Summary (for PR/docs)` is filled with what was actually implemented.

## Progress Overview

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1 | complete | 4 | 4/4 |
| Phase 2 | in_progress | 4 | 2/4 |
| Phase 3 | pending | 4 | 0/4 |

**Total:** 6/12 tasks completed

---

## Phase 1: Config Schema + Active Idea Migration

**Status:** complete
**Started:** 2026-03-08

### Phase Summary

**Outcome (what changed):**
- `localPaths` added to `OatConfig` schema with dedup/sort normalization
- `activeIdea` added to `OatLocalConfig` + new `UserConfig` for `~/.oat/config.json`
- `oat config set/get activeIdea` works via CLI (ConfigKey extended)
- All 4 idea skills migrated from pointer files to config-based resolution (hard cutover)
- Docs updated to reflect config-based active idea

**Key files touched:**
- `packages/cli/src/config/oat-config.ts`
- `packages/cli/src/commands/config/index.ts`
- `.agents/skills/oat-idea-{new,ideate,summarize,scratchpad}/SKILL.md`
- `apps/oat-docs/docs/{reference/file-locations.md,reference/oat-directory-structure.md,ideas/lifecycle.md}`

**Verification:**
- Run: `pnpm test && pnpm lint && pnpm type-check`
- Result: 804 tests pass, lint clean, types clean

**Notes / Decisions:**
- Hard cutover: no legacy fallback for pointer files
- User-level config: `~/.oat/config.json` (not `.local` suffix)

### Task p01-t01: Add `localPaths` to OatConfig schema

**Status:** completed
**Commit:** e6ed890

**Outcome (required):**
- Added `localPaths?: string[]` to `OatConfig` interface
- Normalization in `normalizeOatConfig()` filters non-strings, deduplicates, sorts
- Exported `resolveLocalPaths(config)` helper returning resolved array (empty if omitted)
- 5 new tests covering dedup, sort, filtering, and resolveLocalPaths

**Files changed:**
- `packages/cli/src/config/oat-config.ts` - added localPaths to interface + normalization + helper
- `packages/cli/src/config/oat-config.test.ts` - added localPaths test suite

**Verification:**
- Run: `pnpm test -- --run src/config/oat-config.test.ts`
- Result: 798 tests pass
- Run: `pnpm lint && pnpm type-check`
- Result: clean

---

### Task p01-t02: Add `activeIdea` to OatLocalConfig + user-level config

**Status:** completed
**Commit:** d87cada

**Outcome (required):**
- Added `activeIdea?: string | null` to `OatLocalConfig` interface
- Added `UserConfig` interface with `activeIdea` for `~/.oat/config.json`
- Exported `resolveActiveIdea()` (repo > user precedence), `setActiveIdea()`, `clearActiveIdea()`
- Exported `readUserConfig()` / `writeUserConfig()` for user-level config
- Extended `ConfigKey` + `KEY_ORDER` in config command to include `activeIdea`
- 6 new tests covering normalization, precedence, read/write, set/clear

**Files changed:**
- `packages/cli/src/config/oat-config.ts` - activeIdea in OatLocalConfig + UserConfig + helpers
- `packages/cli/src/config/oat-config.test.ts` - activeIdea test suite
- `packages/cli/src/commands/config/index.ts` - added activeIdea to ConfigKey/KEY_ORDER/setConfigValue

**Verification:**
- Run: `pnpm test -- --run src/config/oat-config.test.ts`
- Result: 804 tests pass
- Run: `pnpm lint && pnpm type-check`
- Result: clean

---

### Task p01-t03: Update idea skills for config-based active idea

**Status:** completed
**Commit:** 182f7f8

**Outcome (required):**
- Replaced pointer file checks/reads/writes with config-based operations in all 4 idea skills
- Step 0 resolution: `.oat/config.local.json` (repo) / `~/.oat/config.json` (user) instead of pointer files
- Removed `ACTIVE_IDEA_FILE` variable from all skill variable tables
- oat-idea-new Step 7: `oat config set activeIdea` instead of file write
- oat-idea-ideate Step 1: `oat config get activeIdea` instead of `cat`
- oat-idea-summarize Step 1: config read/write instead of file read/write

**Files changed:**
- `.agents/skills/oat-idea-new/SKILL.md` - config-based pointer
- `.agents/skills/oat-idea-ideate/SKILL.md` - config-based resolve + set
- `.agents/skills/oat-idea-summarize/SKILL.md` - config-based resolve + set
- `.agents/skills/oat-idea-scratchpad/SKILL.md` - config-based level resolution

**Verification:**
- Run: `grep -r "active-idea" .agents/skills/oat-idea-*/SKILL.md`
- Result: no matches (clean)

---

### Task p01-t04: Update docs for active-idea migration

**Status:** completed
**Commit:** d7aaa8e

**Outcome (required):**
- Updated file-locations.md to reference config instead of pointer files
- Updated oat-directory-structure.md to remove `.oat/active-idea` from layout/table, add `activeIdea` to config ownership
- Updated ideas/lifecycle.md with config-based resolution (CLI commands, config keys)
- Legacy pointer files noted in compatibility sections only

**Files changed:**
- `apps/oat-docs/docs/reference/file-locations.md` - config references
- `apps/oat-docs/docs/reference/oat-directory-structure.md` - removed pointer entries
- `apps/oat-docs/docs/ideas/lifecycle.md` - config-based active idea section

---

## Phase 2: `oat local` Command Group

**Status:** in_progress
**Started:** 2026-03-08

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {TBD}

**Key files touched:**
- {TBD}

**Verification:**
- Run: `{TBD}`
- Result: {TBD}

**Notes / Decisions:**
- {TBD}

### Task p02-t01: Scaffold `oat local` command group + `status` subcommand

**Status:** completed
**Commit:** 642302f

**Outcome (required):**
- Created `oat local status` subcommand showing localPaths existence and gitignore status
- `checkLocalPathsStatus()` core logic in `status.ts` with `LocalPathStatus` interface
- `isPathGitignored()` checks `.gitignore` for path with/without trailing slash and leading `/`
- Table output with drift detection warnings (⚠ not gitignored)
- JSON output mode supported
- Registered `local` command group in CLI command index

**Files changed:**
- `packages/cli/src/commands/local/index.ts` - command registration + status action handler
- `packages/cli/src/commands/local/status.ts` - core status check logic
- `packages/cli/src/commands/local/status.test.ts` - 3 tests (existence/gitignore, drift, empty)
- `packages/cli/src/commands/index.ts` - registered createLocalCommand
- `packages/cli/src/commands/help-snapshots.test.ts` - updated root help snapshot

**Verification:**
- Run: `pnpm --filter @oat/cli test -- --run`
- Result: 807 tests pass, lint warning only (unused type import), types clean

---

### Task p02-t02: `oat local apply` -- managed gitignore section

**Status:** completed
**Commit:** 1766c2d

**Outcome (required):**
- `applyGitignore()` reads/writes managed section in `.gitignore` delimited by marker comments
- Supports create, update, replace, remove (empty localPaths), and no-change detection
- Paths normalized with trailing slash
- `oat local apply` subcommand registered with `--dry-run` option
- JSON output mode supported
- 6 tests covering all cases

**Files changed:**
- `packages/cli/src/commands/local/apply.ts` - core gitignore section management
- `packages/cli/src/commands/local/apply.test.ts` - 6 tests
- `packages/cli/src/commands/local/index.ts` - registered apply subcommand

**Verification:**
- Run: `pnpm --filter @oat/cli test -- --run`
- Result: 813 tests pass, lint warning only, types clean

---

### Task p02-t03: `oat local sync` -- bulk worktree copy

**Status:** pending
**Commit:** -

---

### Task p02-t04: `oat local add` / `oat local remove` -- path management

**Status:** pending
**Commit:** -

---

## Phase 3: Worktree Bootstrap Integration + Final Verification

**Status:** pending
**Started:** -

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {TBD}

**Key files touched:**
- {TBD}

**Verification:**
- Run: `{TBD}`
- Result: {TBD}

**Notes / Decisions:**
- {TBD}

### Task p03-t01: Update worktree bootstrap to use config + local sync

**Status:** pending
**Commit:** -

---

### Task p03-t02: Update autonomous worktree bootstrap for config + local sync

**Status:** pending
**Commit:** -

**Notes:**
- Added via artifact review (I2): mirrors p03-t01 changes for the auto bootstrap path

---

### Task p03-t03: Delete legacy pointer files + clean up gitignore

**Status:** pending
**Commit:** -

---

### Task p03-t04: Final build + lint + type-check + test

**Status:** pending
**Commit:** -

---

## Orchestration Runs

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Review Notes

### Artifact Review Received: plan

**Date:** 2026-03-08
**Review artifact:** reviews/artifact-plan-review-2026-03-08.md

**Findings:**
- Critical: 0
- Important: 2
- Medium: 0
- Minor: 1

**Dispositions:**
- `I1` (activeIdea config surface): `resolved_in_artifact` — added explicit CLI config extension substep to p01-t02
- `I2` (auto bootstrap coverage): `resolved_in_artifact` — added new task p03-t02 for autonomous bootstrap path
- `m1` (HiLL metadata inconsistency): `resolved_in_artifact` — unchecked Planning Checklist to match empty `oat_plan_hill_phases`

**Import skill gap noted:** `oat-project-import-plan` lacks a HiLL configuration step. The Planning Checklist was marked complete without running the HiLL flow. This is a separate fix outside this project's scope.

---

## Implementation Log

### 2026-03-08

**Session Start:** Plan import

- [ ] p01-t01: Add localPaths to OatConfig schema - pending

**What changed (high level):**
- Project scaffolded from imported plan

**Decisions:**
- User-level config: `~/.oat/config.json` (no `.local` suffix)
- Hard cutover for active-idea migration (no legacy fallback)

**Follow-ups / TODO:**
- None

**Blockers:**
- None

---

## Deviations from Plan

| Task | Planned | Actual | Reason |
|------|---------|--------|--------|
| - | - | - | - |

## Test Results

| Phase | Tests Run | Passed | Failed | Coverage |
|-------|-----------|--------|--------|----------|
| 1 | - | - | - | - |
| 2 | - | - | - | - |
| 3 | - | - | - | - |

## Final Summary (for PR/docs)

**What shipped:**
- {TBD}

**Behavioral changes (user-facing):**
- {TBD}

**Key files / modules:**
- {TBD}

**Verification performed:**
- {TBD}

**Design deltas (if any):**
- {TBD}

## References

- Plan: `plan.md`
- Imported Source: `references/imported-plan.md`
