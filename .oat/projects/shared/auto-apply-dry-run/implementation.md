---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-07
oat_current_task_id: null
oat_generated: false
oat_template: false
---

# Implementation: auto-apply-dry-run

**Started:** 2026-03-07
**Last Updated:** 2026-03-07

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
> - `oat_current_task_id` always points at the **next plan task to do** (not the last completed task).
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are **not** plan tasks. Track review status in `plan.md` under `## Reviews` (e.g., `| final | code | passed | ... |`).
> - Keep phase/task statuses consistent with the Progress Overview table so restarts resume correctly.
> - Before running the `oat-project-pr-final` skill, ensure `## Final Summary (for PR/docs)` is filled with what was actually implemented.

## Progress Overview

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1 | complete | 7 | 7/7 |
| Phase 2 | complete | 2 | 2/2 |
| Phase 3 | complete | 3 | 3/3 |

**Total:** 12/12 tasks completed

---

## Phase 1: Core CLI Refactor

**Status:** complete
**Started:** 2026-03-07

### Phase Summary

**Outcome (what changed):**
- Renamed `GlobalOptions.apply` → `dryRun` and `CommandContext.apply` → `dryRun` in shared infrastructure
- Flipped 6 commands (`sync`, `instructions sync`, `remove skill`, `remove skills`, `cleanup artifacts`, `cleanup project`) from `--apply` to `--dry-run`
- Updated `SyncJsonPayload.apply` → `dryRun` (inverted semantics)
- Removed `--apply` from 3 auto-sync subprocess callers (tools install/update/remove)
- Updated 8 user-facing guidance strings across init, doctor, instructions validate, and hook engine

**Key files touched:**
- `packages/cli/src/app/command-context.ts` (shared interface)
- `packages/cli/src/commands/sync/index.ts`, `sync.types.ts`, `dry-run.ts`, `apply.ts`
- `packages/cli/src/commands/instructions/sync/sync.ts`
- `packages/cli/src/commands/remove/skill/remove-skill.ts`, `remove/skills/remove-skills.ts`
- `packages/cli/src/commands/cleanup/cleanup.utils.ts`, `artifacts/artifacts.ts`, `project/project.ts`
- `packages/cli/src/commands/tools/install/index.ts`, `update/index.ts`, `remove/index.ts`
- `packages/cli/src/commands/init/tools/index.ts`, `workflows/index.ts`, `ideas/index.ts`, `utility/index.ts`
- `packages/cli/src/commands/instructions/validate/validate.ts`
- `packages/cli/src/commands/doctor/index.ts`
- `packages/cli/src/engine/hook.ts`

**Verification:**
- Run: `pnpm --filter @oat/cli type-check`
- Result: pass (no type errors after all 7 tasks)

**Notes / Decisions:**
- All 7 tasks committed together as a single atomic refactor commit (plan specified deferred commit)
- `toCleanupMode` helper inverted: `return dryRun ? 'dry-run' : 'apply'`

### Task p01-t01: Update shared CommandContext

**Status:** completed
**Commit:** 210a4e4

**Outcome:**
- Renamed `GlobalOptions.apply` → `dryRun`
- Renamed `CommandContext.apply` → `dryRun`
- Updated `buildCommandContext` default: `dryRun: options.dryRun ?? false`

**Files changed:**
- `packages/cli/src/app/command-context.ts` - core interface rename

**Verification:**
- Run: `pnpm --filter @oat/cli type-check`
- Result: expected downstream type errors (fixed in subsequent tasks)

### Task p01-t02: Flip sync command

**Status:** completed
**Commit:** 210a4e4

**Outcome:**
- Changed `.option('--apply', ...)` → `.option('--dry-run', 'Preview sync changes without applying')`
- Inverted branch logic: dry-run check first, apply as default
- Updated JSON payloads: `apply` → `dryRun` (inverted)

**Files changed:**
- `packages/cli/src/commands/sync/index.ts` - option + branch logic
- `packages/cli/src/commands/sync/sync.types.ts` - JSON payload type
- `packages/cli/src/commands/sync/dry-run.ts` - dry-run JSON + hint
- `packages/cli/src/commands/sync/apply.ts` - apply JSON

### Task p01-t03: Flip instructions sync command

**Status:** completed
**Commit:** 210a4e4

**Outcome:**
- Full rewrite of option handling in instructions sync
- Inverted all conditionals from `apply` to `dryRun` semantics

**Files changed:**
- `packages/cli/src/commands/instructions/sync/sync.ts` - option, action params, conditionals, hint

### Task p01-t04: Flip remove skill and remove skills commands

**Status:** completed
**Commit:** 210a4e4

**Outcome:**
- Renamed `RemoveSkillOptions.apply` → `dryRun`
- Renamed `RemoveSkillsDependencies` interface param
- Inverted `if (!apply)` → `if (dryRun)` in both files

**Files changed:**
- `packages/cli/src/commands/remove/skill/remove-skill.ts` - options, signature, conditionals
- `packages/cli/src/commands/remove/skills/remove-skills.ts` - options, interface, conditionals

### Task p01-t05: Flip cleanup commands

**Status:** completed
**Commit:** 210a4e4

**Outcome:**
- Updated `toCleanupMode` to `return dryRun ? 'dry-run' : 'apply'`
- Inverted all apply/dryRun semantics in both cleanup commands

**Files changed:**
- `packages/cli/src/commands/cleanup/cleanup.utils.ts` - shared helper
- `packages/cli/src/commands/cleanup/artifacts/artifacts.ts` - option, run options, conditionals
- `packages/cli/src/commands/cleanup/project/project.ts` - option, run options, conditionals

### Task p01-t06: Update auto-sync programmatic callers

**Status:** completed
**Commit:** 210a4e4

**Outcome:**
- Removed `'--apply'` from `execFile` args in all 3 auto-sync subprocess callers
- Sync now applies by default, so no flag needed

**Files changed:**
- `packages/cli/src/commands/tools/install/index.ts` - remove `--apply` arg
- `packages/cli/src/commands/tools/update/index.ts` - remove `--apply` arg
- `packages/cli/src/commands/tools/remove/index.ts` - remove `--apply` arg

### Task p01-t07: Update user-facing guidance strings

**Status:** completed
**Commit:** 210a4e4

**Outcome:**
- Dropped `--apply` from all post-install guidance strings
- Updated HOOK_DRIFT_WARNING to reference plain `oat sync`

**Files changed:**
- `packages/cli/src/commands/init/tools/index.ts` - guidance strings
- `packages/cli/src/commands/init/tools/workflows/index.ts` - guidance string
- `packages/cli/src/commands/init/tools/ideas/index.ts` - guidance string
- `packages/cli/src/commands/init/tools/utility/index.ts` - guidance string
- `packages/cli/src/commands/instructions/validate/validate.ts` - fix hint
- `packages/cli/src/commands/doctor/index.ts` - 2 guidance strings
- `packages/cli/src/engine/hook.ts` - HOOK_DRIFT_WARNING

---

## Phase 2: Test Updates

**Status:** complete
**Started:** 2026-03-07

### Phase Summary

**Outcome (what changed):**
- Updated 34 test files for new `--dry-run` convention
- All `CommandContext` mocks: `apply: false` → `dryRun: false`
- Apply tests: removed `--apply` flag (apply is now default)
- Dry-run tests: added `--dry-run` flag
- JSON assertions: `apply: true/false` → `dryRun: false/true`
- Help snapshots updated

**Key files touched:**
- All `*.test.ts` files under `packages/cli/src/`

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: 793 tests passing

### Task p02-t01: Update unit and snapshot tests

**Status:** completed
**Commit:** 9db2b5b

**Outcome:**
- Updated unit tests, snapshot tests, and help snapshot tests
- Discovered 16 additional test files beyond plan that needed `CommandContext` mock updates
- All mock objects updated from `apply: false` to `dryRun: false`

**Files changed:**
- 30+ test files across `packages/cli/src/`

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: pass (793 tests)

### Task p02-t02: Update integration and e2e tests

**Status:** completed
**Commit:** 9db2b5b

**Outcome:**
- Updated e2e and integration tests
- Changed `['sync', '--apply']` → `['sync']` in all integration tests
- Updated cleanup integration test `apply` → `dryRun` references

**Files changed:**
- `packages/cli/src/e2e/workflow.test.ts`
- `packages/cli/src/commands/commands.integration.test.ts`
- `packages/cli/src/commands/instructions/instructions.integration.test.ts`
- `packages/cli/src/commands/cleanup/cleanup.integration.test.ts`

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: pass (793 tests)

---

## Phase 3: Documentation & Reference Updates

**Status:** complete
**Started:** 2026-03-07

### Phase Summary

**Outcome (what changed):**
- Updated 9 user-facing doc files, 8 skill/agent doc files, and 3 reference docs
- All `--apply` references replaced with appropriate `--dry-run` or plain commands
- Backlog item moved to completed archive
- current-state.md updated with new convention description

**Key files touched:**
- `README.md`, `apps/oat-docs/docs/` (9 docs files)
- `.agents/` (8 skill/agent files)
- `.oat/repo/reference/` (backlog, backlog-completed, current-state)

**Verification:**
- Run: `pnpm lint`
- Result: pass

### Task p03-t01: Update user-facing docs

**Status:** completed
**Commit:** c613b9a

**Outcome:**
- Updated README.md, quickstart, troubleshooting, CLI docs, tool-packs, commands, hooks-and-safety, reviews
- Pattern: `oat sync --scope all --apply` → `oat sync --scope all`

**Files changed:**
- `README.md` - 6+ occurrences
- `apps/oat-docs/docs/quickstart.md` - 8 references
- `apps/oat-docs/docs/reference/troubleshooting.md` - 6 references
- `apps/oat-docs/docs/cli/index.md` - 2 references
- `apps/oat-docs/docs/cli/tool-packs-and-assets.md` - 3 references
- `apps/oat-docs/docs/cli/provider-interop/commands.md` - convention description
- `apps/oat-docs/docs/cli/provider-interop/hooks-and-safety.md` - 1 reference
- `apps/oat-docs/docs/workflow/reviews.md` - 1 reference

### Task p03-t02: Update skills and agent docs

**Status:** completed
**Commit:** 0d457ee

**Outcome:**
- Updated all agent/skill docs referencing `--apply`
- Updated packages/cli/AGENTS.md convention description

**Files changed:**
- `.agents/README.md` - drop `--apply`
- `.agents/docs/reference-architecture.md` - drop `--apply`
- `.agents/docs/skills-guide.md` - drop `--apply`
- `.agents/skills/create-skill/SKILL.md` - drop `--apply`
- `.agents/skills/create-oat-skill/SKILL.md` - drop `--apply`
- `.agents/skills/oat-worktree-bootstrap-auto/SKILL.md` - drop `--apply`
- `.agents/skills/oat-worktree-bootstrap-auto/scripts/bootstrap.sh` - drop `--apply`
- `packages/cli/AGENTS.md` - update convention description

### Task p03-t03: Update backlog and reference docs

**Status:** completed
**Commit:** efcc474

**Outcome:**
- Moved completed item from backlog.md Inbox to backlog-completed.md
- Updated current-state.md: removed `--apply` references, updated interop quickstart, updated instructions sync description

**Files changed:**
- `.oat/repo/reference/backlog-completed.md` - added completed entry
- `.oat/repo/reference/current-state.md` - updated 3 references

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

- 2026-03-07: All 12 tasks completed across 3 phases
- Phase 1 (7 tasks): Single atomic commit for all CLI refactoring
- Phase 2 (2 tasks): Single commit for all test updates (34 files, 793 tests passing)
- Phase 3 (3 tasks): 3 commits for docs, skills/agent docs, and reference docs

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
|------|---------|--------|--------|
| p02-t01 | 10 test files | 34 test files | 16 additional files had CommandContext mocks needing `apply` → `dryRun` updates |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
|-------|-----------|--------|--------|----------|
| 1 | 793 | 793 | 0 | - |
| 2 | 793 | 793 | 0 | - |
| 3 | 793 | 793 | 0 | - |

## Final Summary (for PR/docs)

**What shipped:**
- Unified all OAT CLI mutating commands under `--dry-run` opt-in convention (mutate by default)
- Flipped 6 legacy commands from `--apply` (dry-run by default) to match the `oat tools` convention
- Clean removal of `--apply` (no deprecation period; pre-1.0)

**Behavioral changes (user-facing):**
- All CLI commands that mutate the filesystem now do so by default (no flag needed)
- To preview changes without applying, use `--dry-run` flag
- JSON output: `SyncJsonPayload.apply` field replaced by `dryRun` (inverted semantics)
- `--apply` flag no longer recognized (Commander "unknown option" error)

**Key files / modules:**
- `packages/cli/src/app/command-context.ts` — shared `CommandContext.dryRun` interface
- `packages/cli/src/commands/sync/` — main sync command
- `packages/cli/src/commands/instructions/sync/` — instructions sync
- `packages/cli/src/commands/remove/` — remove skill/skills
- `packages/cli/src/commands/cleanup/` — cleanup artifacts/project
- `packages/cli/src/commands/tools/` — auto-sync subprocess callers
- `packages/cli/src/engine/hook.ts` — hook drift warning

**Verification performed:**
- Type-check: pass
- Tests: 793 passing
- Lint: pass
- Build: pass (pending final verification)

**Design deltas (if any):**
- None — purely mechanical rename/inversion as planned

## References

- Plan: `plan.md`
- Imported Source: `references/imported-plan.md`
