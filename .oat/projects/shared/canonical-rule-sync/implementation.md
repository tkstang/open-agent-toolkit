---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_current_task_id: p01-t02
oat_generated: false
---

# Implementation: canonical-rule-sync

**Started:** 2026-03-11
**Last Updated:** 2026-03-11

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

| Phase   | Status      | Tasks | Completed |
| ------- | ----------- | ----- | --------- |
| Phase 1 | in_progress | 3     | 1/3       |
| Phase 2 | pending     | 3     | 0/3       |

**Total:** 1/6 tasks completed

---

## Phase 1: Transform-Aware Sync Foundation

**Status:** in_progress
**Started:** 2026-03-11

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- {2-5 bullets describing user-visible / behavior-level changes delivered in this phase}

**Key files touched:**

- `{path}` - {why}

**Verification:**

- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**

- {trade-offs or deviations discovered during implementation}

### Task p01-t01: Add rule content type and mapping contract

**Status:** completed
**Commit:** 27ff5d85

**Outcome (required when completed):**

- Added `rule` as a project-scoped sync content type alongside skills and agents.
- Extended canonical scanning to discover file-based rule entries under `.agents/rules/`.
- Added initial project provider mappings for Claude, Cursor, and Copilot rule directories.
- Expanded Copilot detection so `.github/instructions` activates the provider.

**Files changed:**

- `packages/cli/src/shared/types.ts` - registered `rule` in content type and scope maps
- `packages/cli/src/shared/types.test.ts` - covered the new content type and scope values
- `packages/cli/src/engine/scanner.ts` - added canonical rules directory handling
- `packages/cli/src/engine/scanner.test.ts` - covered project/user rule scanning behavior
- `packages/cli/src/providers/shared/adapter.types.ts` - added optional transform-oriented mapping fields
- `packages/cli/src/providers/shared/adapter-contract.test.ts` - expanded canonical dir and detection expectations
- `packages/cli/src/providers/claude/paths.ts` - added project rule mapping
- `packages/cli/src/providers/claude/adapter.test.ts` - asserted Claude project rules mapping
- `packages/cli/src/providers/cursor/paths.ts` - added project rule mapping
- `packages/cli/src/providers/cursor/adapter.test.ts` - asserted Cursor project rules mapping
- `packages/cli/src/providers/copilot/paths.ts` - added project rule mapping
- `packages/cli/src/providers/copilot/adapter.ts` - recognized `.github/instructions` as a Copilot marker
- `packages/cli/src/providers/copilot/adapter.test.ts` - covered project rule mapping and instructions detection

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed after updating provider/scanner/type tests for rule support
- Run: `pnpm lint && pnpm type-check`
- Result: Passed

**Notes / Decisions:**

- The transform hook fields were added to `PathMapping` now so later rule-rendering work can plug into the existing adapter contract without another type churn task.
- Rule mappings were added only for project scope in this task; user-scoped rules remain intentionally out of scope.

---

### Task p01-t02: Implement canonical rule model and provider transforms

**Status:** pending
**Commit:** -

---

### Task p01-t03: Integrate transformed sync planning, execution, and manifest handling

**Status:** pending
**Commit:** -

---

## Phase 2: Adoption, Tooling, and Coverage

**Status:** pending
**Started:** -

### Task p02-t01: Add rule stray detection and adoption flow

**Status:** pending
**Commit:** -

---

### Task p02-t02: Update rule authoring workflow and sync integration tests

**Status:** pending
**Commit:** -

---

### Task p02-t03: Final verification and manual smoke test coverage

**Status:** pending
**Commit:** -

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

Chronological log of implementation progress.

### 2026-03-11

**Session Start:** 04:21 UTC

- [x] p01-t01: Add rule content type and mapping contract - 27ff5d85
- [ ] p01-t02: Implement canonical rule model and provider transforms - pending

**What changed (high level):**

- Added `rule` as a canonical project-scoped sync content type.
- Extended canonical scanning and provider mappings to recognize rule locations.
- Added Copilot instructions directory detection and updated tests around the new mapping shape.

**Decisions:**

- Added optional transform-related fields to `PathMapping` in `p01-t01` so later rule rendering can attach cleanly without revisiting provider contract types.

**Follow-ups / TODO:**

- Attach concrete transform functions and provider extensions in `p01-t02`.
- Update engine planning/execution helpers for rule paths in `p01-t03`.

**Blockers:**

- None - resolved

**Session End:** 04:39 UTC

---

### 2026-03-11

**Session Start:** {time}

{Continue log...}

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
| ---- | ------- | ------ | ------ |
| -    | -       | -      | -      |

## Test Results

Track test execution during implementation.

| Phase | Tests Run                                                     | Passed | Failed | Coverage |
| ----- | ------------------------------------------------------------- | ------ | ------ | -------- |
| 1     | `pnpm --filter @oat/cli test`; `pnpm lint`; `pnpm type-check` | yes    | 0      | -        |
| 2     | -                                                             | -      | -      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- {capability 1}
- {capability 2}

**Behavioral changes (user-facing):**

- {bullet}

**Key files / modules:**

- `{path}` - {purpose}

**Verification performed:**

- {tests/lint/typecheck/build/manual steps}

**Design deltas (if any):**

- {what changed vs design.md and why}

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`
