---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-15
oat_current_task_id: p01-t03
oat_generated: false
---

# Implementation: local-project-management

**Started:** 2026-03-15
**Last Updated:** 2026-03-15

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
| Phase 1 | in_progress | 4     | 2/4       |
| Phase 2 | pending     | 3     | 0/3       |
| Phase 3 | pending     | 3     | 0/3       |
| Phase 4 | pending     | 5     | 0/5       |
| Phase 5 | pending     | 4     | 0/4       |

**Total:** 2/19 tasks completed

---

## Phase 1: Templates and Directory Structure

**Status:** in_progress
**Started:** 2026-03-15

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Pending

**Key files touched:**

- Pending

**Verification:**

- Run: `Pending`
- Result: Pending

**Notes / Decisions:**

- None yet

### Task p01-t01: Create backlog item template

**Status:** completed
**Commit:** 48c08748dd9e64541e2d999839170bc803332514

**Outcome (required when completed):**

- Added a reusable backlog item template with the agreed tracking schema and template markers.
- New backlog entries now have explicit description and acceptance-criteria sections to standardize item authoring.

**Files changed:**

- `.oat/templates/backlog-item.md` - added the new file-per-item backlog template

**Verification:**

- Run: `cat .oat/templates/backlog-item.md | head -20`
- Result: Pass; frontmatter and body sections render with the expected schema

**Notes / Decisions:**

- Used the exact field order from the plan so later migration and CLI parsing work can rely on a stable shape.

---

### Task p01-t02: Create roadmap template

**Status:** completed
**Commit:** 12d48e59ea1ccba0105d37b87bd1bc55204ba70b

**Outcome (required when completed):**

- Added a roadmap template with explicit Now/Next/Later horizons for the new backlog model.
- Included inline guidance for backlog-ID based entries so migrated roadmap items can point to file-backed backlog records.

**Files changed:**

- `.oat/templates/roadmap.md` - added the roadmap template and entry formatting guidance

**Verification:**

- Run: `cat .oat/templates/roadmap.md`
- Result: Pass; template contains the expected horizon headings and usage comments

**Notes / Decisions:**

- Kept the template minimal and guidance-focused so migration can preserve current roadmap detail while adopting the new structure.

---

### Task p01-t03: Create backlog directory structure

**Status:** pending
**Commit:** -

**Notes:**

- Will scaffold `.oat/repo/reference/backlog/` and index/completed files

---

### Task p01-t04: Add `associated_issues` to state.md template

**Status:** pending
**Commit:** -

**Notes:**

- Will extend `.oat/templates/state.md`

---

## Phase 2: CLI Support

**Status:** pending
**Started:** -

### Task p02-t01: Implement backlog item ID generation utility

**Status:** pending
**Commit:** -

---

### Task p02-t02: Implement backlog index regeneration command

**Status:** pending
**Commit:** -

---

### Task p02-t03: Wire backlog CLI commands

**Status:** pending
**Commit:** -

---

## Phase 3: Agent Skills

**Status:** pending
**Started:** -

### Task p03-t01: Create `oat-pjm-add-backlog-item` skill

**Status:** pending
**Commit:** -

---

### Task p03-t02: Refactor `update-repo-reference` to `oat-pjm-update-repo-reference`

**Status:** pending
**Commit:** -

---

### Task p03-t03: Refactor `review-backlog` to `oat-pjm-review-backlog`

**Status:** pending
**Commit:** -

---

## Phase 4: Skill Pack Infrastructure

**Status:** pending
**Started:** -

### Task p04-t01: Add `PROJECT_MANAGEMENT_SKILLS` to skill manifest

**Status:** pending
**Commit:** -

---

### Task p04-t02: Extend `PackName` type and pack resolution

**Status:** pending
**Commit:** -

---

### Task p04-t03: Create installer module

**Status:** pending
**Commit:** -

---

### Task p04-t04: Register pack in init tools and descriptions

**Status:** pending
**Commit:** -

---

### Task p04-t05: Update `bundle-assets.sh` and verify consistency

**Status:** pending
**Commit:** -

---

## Phase 5: Migration

**Status:** pending
**Started:** -

### Task p05-t01: Migrate existing backlog items to file-per-item

**Status:** pending
**Commit:** -

---

### Task p05-t02: Migrate completed backlog to new structure

**Status:** pending
**Commit:** -

---

### Task p05-t03: Migrate roadmap to Now/Next/Later structure

**Status:** pending
**Commit:** -

---

### Task p05-t04: Retire `deferred-phases.md`

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

### 2026-03-15

**Session Start:** 17:25

- [x] p01-t01: Create backlog item template - 48c08748dd9e64541e2d999839170bc803332514
- [x] p01-t02: Create roadmap template - 12d48e59ea1ccba0105d37b87bd1bc55204ba70b
- [ ] p01-t03: Create backlog directory structure - pending

**What changed (high level):**

- Confirmed final-only plan checkpoint: `["p05"]`
- Moved project tracking from planning into implementation kickoff
- Initialized implementation task map for all 19 planned tasks

**Decisions:**

- Pause only after completing `p05`; do not stop at intermediate phases unless blocked

**Follow-ups / TODO:**

- Execute tasks strictly in plan order, starting with template creation

**Blockers:**

- None

**Session End:** -

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
