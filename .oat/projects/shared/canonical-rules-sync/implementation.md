---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_current_task_id: p01-t01
oat_generated: false
---

# Implementation: Canonical Rules with Bidirectional Provider Sync

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

| Phase   | Status  | Tasks | Completed |
| ------- | ------- | ----- | --------- |
| Phase 1 | pending | 5     | 0/5       |
| Phase 2 | pending | 4     | 0/4       |
| Phase 3 | pending | 5     | 0/5       |
| Phase 4 | pending | 2     | 0/2       |
| Phase 5 | pending | 3     | 0/3       |

**Total:** 0/19 tasks completed

---

## Phase 1: Core Types and Canonical Rule Module

**Status:** pending
**Started:** -

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

### Task p01-t01: Add 'rule' to ContentType

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p01-t02: Extend PathMapping with transform hooks

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p01-t03: Create canonical rule types

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p01-t04: Create canonical rule parse module

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p01-t05: Create canonical rule render module and barrel

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

## Phase 2: Provider Rule Transforms

**Status:** pending
**Started:** -

### Task p02-t01: Claude rule transform

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p02-t02: Cursor rule transform

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p02-t03: Copilot rule transform

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p02-t04: Add rule mappings to provider adapters

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

## Phase 3: Sync Engine Integration

**Status:** pending
**Started:** -

### Task p03-t01: Update scanner for rule discovery

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p03-t02: Update compute-plan for rule strategy and extension mapping

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p03-t03: Update execute-plan for rule transforms

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p03-t04: Update manifest types for rules

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p03-t05: Update adapter-contract tests for rules

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

## Phase 4: Stray Detection and Adoption

**Status:** pending
**Started:** -

### Task p04-t01: Update stray detection for rules

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p04-t02: Add rule adoption path

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

## Phase 5: Skill Update and Integration Testing

**Status:** pending
**Started:** -

### Task p05-t01: Update oat-agent-instructions-apply skill

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p05-t02: End-to-end sync integration tests

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

### Task p05-t03: Full verification

**Status:** pending
**Commit:** -

**Notes:**

- {Notes will be added during implementation}

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection -- never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

Chronological log of implementation progress.

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
| ---- | ------- | ------ | ------ |
| -    | -       | -      | -      |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
| ----- | --------- | ------ | ------ | -------- |
| 1     | -         | -      | -      | -        |
| 2     | -         | -      | -      | -        |
| 3     | -         | -      | -      | -        |
| 4     | -         | -      | -      | -        |
| 5     | -         | -      | -      | -        |

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
- Imported Source: `references/imported-plan.md`
