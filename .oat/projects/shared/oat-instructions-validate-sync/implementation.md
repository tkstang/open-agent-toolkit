---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-02-22
oat_current_task_id: null
oat_generated: false
---

# Implementation: `oat instructions validate` and `oat instructions sync`

**Started:** 2026-02-21
**Last Updated:** 2026-02-22

## Progress Overview

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1 | completed | 3 | 3/3 |
| Phase 2 | completed | 3 | 3/3 |
| Phase 3 | completed | 2 | 2/2 |

**Total:** 8/8 tasks completed

---

## Phase 1: Command Foundations

**Status:** completed
**Started:** 2026-02-21

### Phase Summary

**Outcome (what changed):**
- Added the complete shared type and utility foundation for instruction integrity checks.
- Implemented `oat instructions validate` with deterministic text/JSON reporting and actionable exit codes.
- Added targeted tests for scanner behavior, payload construction, and validate command behavior.

**Key files touched:**
- `packages/cli/src/commands/instructions/instructions.types.ts` - shared instruction command type contracts.
- `packages/cli/src/commands/instructions/instructions.utils.ts` - scan, summarize, payload, and report helpers.
- `packages/cli/src/commands/instructions/validate/validate.ts` - validate subcommand.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts`
- Result: pass (6 tests)
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/validate/validate.test.ts`
- Result: pass (4 tests)
- Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/`
- Result: pass

**Notes / Decisions:**
- Kept scanner tolerant to unreadable paths and strict on directory symlink skipping to avoid recursion hazards.

### Task p01-t01: Define shared instructions types

**Status:** completed
**Commit:** d8c57b7

**Outcome:**
- Added a shared type contract for the new instructions command family.
- Established stable JSON payload and summary structures for validate/sync output.
- Defined DI dependency interfaces for scanner, validate command, and sync command wiring.

**Files changed:**
- `packages/cli/src/commands/instructions/instructions.types.ts` - shared types and dependency interfaces.

**Verification:**
- Run: `pnpm --filter @oat/cli type-check`
- Result: pass

### Task p01-t02: Implement scanner and utility layer

**Status:** completed
**Commit:** 204e661

**Outcome:**
- Added recursive AGENTS.md scanner with required exclusions (`.git`, `.oat`, `.worktrees`, nested `node_modules`).
- Implemented CLAUDE pointer validation with CRLF normalization and symlink-safe directory traversal.
- Added reusable summary, payload, and report formatting utilities.

**Files changed:**
- `packages/cli/src/commands/instructions/instructions.utils.ts` - scanner and helper utilities.
- `packages/cli/src/commands/instructions/instructions.utils.test.ts` - utility behavior tests.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts`
- Result: pass (6 tests)

### Task p01-t03: Implement `oat instructions validate`

**Status:** completed
**Commit:** 3e56521

**Outcome:**
- Added `instructions validate` command with DI-friendly dependencies and read-only behavior.
- Implemented text and JSON output using shared instruction payload/report helpers.
- Enforced exit-code semantics for clean/drift/error outcomes.

**Files changed:**
- `packages/cli/src/commands/instructions/validate/validate.ts` - validate command.
- `packages/cli/src/commands/instructions/validate/validate.test.ts` - validate command tests.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/validate/validate.test.ts`
- Result: pass (4 tests)

---

## Phase 2: Sync, Registration, and End-to-End Coverage

**Status:** completed
**Started:** 2026-02-21

### Phase Summary

**Outcome (what changed):**
- Implemented `oat instructions sync` with dry-run/apply semantics and `--force` mismatch overwrite behavior.
- Registered `instructions` command group (`validate`, `sync`) in top-level CLI command registration.
- Added integration coverage for missing/mismatch repair paths, exclusions, CRLF handling, and symlink-cycle safety.

**Key files touched:**
- `packages/cli/src/commands/instructions/sync/sync.ts` - sync command implementation.
- `packages/cli/src/commands/instructions/index.ts` - parent command registration.
- `packages/cli/src/commands/instructions/instructions.integration.test.ts` - end-to-end instructions command integration tests.

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: pass (75 files, 571 tests)
- Run: `pnpm lint`
- Result: pass
- Run: `pnpm type-check`
- Result: pass
- Run: `pnpm build && pnpm run cli -- instructions validate`
- Result: pass; command reports `status: ok` on current repo

**Notes / Decisions:**
- Used temp-repo integration tests to validate destructive sync scenarios without mutating this workspace’s tracked instruction pointers.

### Task p02-t01: Implement `oat instructions sync`

**Status:** completed
**Commit:** f07e4fd

**Outcome:**
- Added `instructions sync` with `--apply` and `--force` support.
- Added action planning (`create`, `update`, `skip`) and apply execution writing canonical pointer content.
- Added drift/skip-based exit behavior and text/JSON output.

**Files changed:**
- `packages/cli/src/commands/instructions/sync/sync.ts` - sync logic and command.
- `packages/cli/src/commands/instructions/sync/sync.test.ts` - sync behavior tests.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/sync/sync.test.ts`
- Result: pass (7 tests)

### Task p02-t02: Register parent command and subcommands

**Status:** completed
**Commit:** d5f0455

**Outcome:**
- Added `instructions` parent command containing `validate` and `sync` subcommands.
- Registered the command group in global CLI command registration.
- Updated command registration and help snapshot tests for the new CLI surface.

**Files changed:**
- `packages/cli/src/commands/instructions/index.ts` - parent command.
- `packages/cli/src/commands/instructions/index.test.ts` - parent command tests.
- `packages/cli/src/commands/index.ts` - top-level command registration.
- `packages/cli/src/commands/index.test.ts` - registration assertions.
- `packages/cli/src/commands/help-snapshots.test.ts` - root help snapshot update.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/index.test.ts src/commands/index.test.ts src/commands/help-snapshots.test.ts`
- Result: pass (29 tests)

### Task p02-t03: Add integration coverage and run verification matrix

**Status:** completed
**Commit:** b791cdd

**Outcome:**
- Added end-to-end instructions integration tests covering:
  - missing CLAUDE -> sync apply -> validate ok
  - mismatch skip without `--force` (dry-run/apply) and overwrite with `--force`
  - nested AGENTS discovery with `node_modules` exclusion
  - CRLF pointer acceptance
  - directory symlink cycle skip
- Executed full verification matrix across test/lint/type-check/build and live CLI validate.

**Files changed:**
- `packages/cli/src/commands/instructions/instructions.integration.test.ts` - integration suite.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.integration.test.ts`
- Result: pass (5 tests)
- Run: `pnpm --filter @oat/cli test`
- Result: pass
- Run: `pnpm lint && pnpm type-check && pnpm build`
- Result: pass

---

## Phase 3: Review Fixes (final)

**Status:** completed
**Started:** 2026-02-22

### Phase Summary

**Outcome (what changed):**
- Added scanner debug logging hooks for graceful-degradation error paths during directory traversal.
- Added help snapshot coverage for the `instructions` command group and both subcommands.
- Closed all tasks created from final review minor findings.

**Key files touched:**
- `packages/cli/src/commands/instructions/instructions.types.ts` - scan dependency debug callback contract.
- `packages/cli/src/commands/instructions/instructions.utils.ts` - debug logging in scanner catch paths.
- `packages/cli/src/commands/help-snapshots.test.ts` - instructions help snapshots.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts`
- Result: pass (7 tests)
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/help-snapshots.test.ts`
- Result: pass (20 tests)

**Notes / Decisions:**
- Kept debug logging optional and callback-based to preserve existing command dependency wiring and behavior.

### Task p03-t01: (review) Add debug logging for scanner permission/read errors

**Status:** completed
**Commit:** ef0e60f

**Outcome:**
- Added optional scanner debug callback support to dependency contracts.
- Added debug messages in directory-read and symlink-stat catch paths while preserving graceful continuation.
- Added utility test coverage to verify debug messages are emitted and scanning still proceeds.

**Files changed:**
- `packages/cli/src/commands/instructions/instructions.types.ts` - added optional `debug` callback on scan dependencies.
- `packages/cli/src/commands/instructions/instructions.utils.ts` - emitted debug messages for scan error paths.
- `packages/cli/src/commands/instructions/instructions.utils.test.ts` - added test asserting debug logging behavior.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts`
- Result: pass (7 tests)

**Notes / Decisions:**
- Kept debug callback optional and no-op by default to avoid changing existing command wiring.

### Task p03-t02: (review) Add help snapshots for instructions command group

**Status:** completed
**Commit:** 297d9ae

**Outcome:**
- Added help snapshot coverage for `instructions` parent command help.
- Added subcommand snapshot coverage for `instructions validate` and `instructions sync`.
- Locked command help contract for the new instructions command group.

**Files changed:**
- `packages/cli/src/commands/help-snapshots.test.ts` - added three instructions help snapshot tests.

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/help-snapshots.test.ts`
- Result: pass (20 tests)

**Notes / Decisions:**
- Followed existing snapshot style and used the same `getCommandByPath` helper pattern as other command groups.

### Review Received: final

**Date:** 2026-02-22
**Review artifact:** `reviews/final-review-2026-02-21.md`

**Findings:**
- Critical: 0
- Important: 0
- Medium: 0
- Minor: 2

**Disposition map:**
- `m1` -> converted to task `p03-t01` (improve scanner error-path observability with debug logging)
- `m2` -> converted to task `p03-t02` (add instructions help snapshots)

**Deferred Findings:**
- Medium: none
- Minor: none (all converted)

**Review cycle:** 1 of 3

**Next:** Request final re-review (`oat-project-review-provide code final`) and process it via `oat-project-review-receive`.

### Review Received: final (re-review)

**Date:** 2026-02-22
**Review artifact:** `reviews/final-review-2026-02-22.md`

**Findings:**
- Critical: 0
- Important: 0
- Medium: 0
- Minor: 0

**Disposition map:**
- none (no new findings in re-review)

**Deferred Medium Ledger (final gate):**
- none

**Minor Disposition (final gate):**
- none

**Review cycle:** 2 of 3

**Next:** Final review passed. Proceed to PR creation (`oat-project-pr-final`).

---

## Orchestration Runs

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

### 2026-02-21

**Session Start:** initialized by `oat-project-import-plan`

- [x] p01-t01: Define shared instructions types - d8c57b7
- [x] p01-t02: Implement scanner and utility layer - 204e661
- [x] p01-t03: Implement `oat instructions validate` - 3e56521
- [x] p02-t01: Implement `oat instructions sync` - f07e4fd
- [x] p02-t02: Register parent command and subcommands - d5f0455
- [x] p02-t03: Add integration coverage and run verification matrix - b791cdd

---

### 2026-02-22

**Session Start:** `oat-project-review-receive` for final scope

- [x] p03-t01: (review) Add debug logging for scanner permission/read errors - ef0e60f
- [x] p03-t02: (review) Add help snapshots for instructions command group - 297d9ae

**What changed (high level):**
- Processed `reviews/final-review-2026-02-21.md`.
- Converted all final-scope minor findings (`m1`, `m2`) into actionable plan tasks and completed them.
- Marked final review status as `fixes_completed` and switched state to awaiting re-review.
- Ran full verification (`pnpm test`, `pnpm lint`, `pnpm type-check`, `pnpm build`) successfully after review-fix completion.

**Session End:** awaiting final re-review

**Session Continuation:** `oat-project-review-receive` for final re-review

- Processed `reviews/final-review-2026-02-22.md` (no findings).
- Marked final review status as `passed` in `plan.md`.
- Updated project state to implementation complete and ready for PR.

**Session End:** final review passed; ready for PR

---

## Deviations from Plan

| Task | Planned | Actual | Reason |
|------|---------|--------|--------|
| p01-t01 | Add a red test before type creation | Existing package test script invocation with `-- --run ...` executes full suite and did not fail on missing instructions tests | Kept implementation scoped to type contract and logged behavior |

## Test Results

| Phase | Tests Run | Passed | Failed | Coverage |
|-------|-----------|--------|--------|----------|
| 1 | `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts`; `pnpm --filter @oat/cli exec vitest run src/commands/instructions/validate/validate.test.ts`; `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/` | yes | 0 | - |
| 2 | `pnpm --filter @oat/cli exec vitest run src/commands/instructions/sync/sync.test.ts`; `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.integration.test.ts`; `pnpm --filter @oat/cli test`; `pnpm lint`; `pnpm type-check`; `pnpm build`; `pnpm run cli -- instructions validate` | yes | 0 | - |
| 3 | `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts`; `pnpm --filter @oat/cli exec vitest run src/commands/help-snapshots.test.ts`; `pnpm test`; `pnpm lint`; `pnpm type-check`; `pnpm build` | yes | 0 | - |

## Final Summary (for PR/docs)

**What shipped:**
- Original phases remain complete; final review follow-up tasks (`p03-t01`, `p03-t02`) are complete and final re-review passed.

**Behavioral changes (user-facing):**
- Users can now run `oat instructions validate` to fail fast on pointer drift.
- Users can run `oat instructions sync` to plan or apply pointer repairs consistently.

**Key files / modules:**
- `packages/cli/src/commands/instructions/instructions.types.ts` - shared command contracts.
- `packages/cli/src/commands/instructions/instructions.utils.ts` - scanning and payload/report helpers.
- `packages/cli/src/commands/instructions/validate/validate.ts` - validation command.
- `packages/cli/src/commands/instructions/sync/sync.ts` - repair command.
- `packages/cli/src/commands/instructions/instructions.integration.test.ts` - integration coverage.

**Verification performed:**
- Targeted instructions command tests and full CLI test suite.
- Workspace lint/type-check/build.
- Live CLI command run in this repo (`pnpm run cli -- instructions validate`).

**Design deltas (if any):**
- No material deltas from imported design intent.

## References

- Plan: `plan.md`
- Imported source: `references/imported-plan.md`
