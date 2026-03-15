---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-15
oat_current_task_id: p02-t01
oat_generated: false
---

# Implementation: oat-cli-doctor-skills

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
| Phase 1 | complete    | 3     | 3/3       |
| Phase 2 | in_progress | 7     | 0/7       |
| Phase 3 | pending     | 3     | 0/3       |

**Total:** 3/13 tasks completed

---

## Phase 1: Skills (Initial — needs rework in Phase 3)

**Status:** complete (committed, rework scheduled in Phase 3)
**Started:** 2026-03-15

### Phase Summary

**Outcome (what changed):**

- Created initial oat-doctor and oat-docs SKILL.md files
- Registered both skills in UTILITY_SKILLS manifest and bundle-assets.sh
- Skills work but don't follow create-oat-skill conventions and have wrong docs resolution

**Key files touched:**

- `.agents/skills/oat-doctor/SKILL.md` - initial doctor skill
- `.agents/skills/oat-docs/SKILL.md` - initial docs skill
- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - added to UTILITY_SKILLS
- `packages/cli/scripts/bundle-assets.sh` - added to SKILLS array

**Verification:**

- Run: `pnpm build && pnpm lint && pnpm type-check && pnpm --filter @oat/cli test`
- Result: All passed (973/973 tests)

**Notes / Decisions:**

- Skills were authored freehand, not following create-oat-skill template — rework in Phase 3
- Docs resolution included repo fallback paths — needs to be ~/.oat/docs/ only per D2
- Registered in utility pack — needs to move to core pack per D1

### Task p01-t01: Create oat-doctor skill

**Status:** completed
**Commit:** 83173df

**Outcome:**

- System now has an oat-doctor skill with check and summary modes

**Files changed:**

- `.agents/skills/oat-doctor/SKILL.md` - new file

**Notes / Decisions:**

- Needs rework in Phase 3 to follow create-oat-skill conventions

---

### Task p01-t02: Create oat-docs skill

**Status:** completed
**Commit:** 83173df

**Outcome:**

- System now has an oat-docs Q&A skill

**Files changed:**

- `.agents/skills/oat-docs/SKILL.md` - new file

**Notes / Decisions:**

- Resolves docs from multiple locations — needs to be ~/.oat/docs/ only per D2

---

### Task p01-t03: Register skills in manifest and bundle

**Status:** completed
**Commit:** 83173df

**Outcome:**

- Both skills registered in UTILITY_SKILLS and bundle-assets.sh

**Files changed:**

- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - added to UTILITY_SKILLS
- `packages/cli/scripts/bundle-assets.sh` - added to SKILLS array

**Notes / Decisions:**

- Will be moved from UTILITY_SKILLS to CORE_SKILLS in Phase 2

---

## Phase 2: Core Pack CLI Infrastructure

**Status:** in_progress
**Started:** 2026-03-15

### Task p02-t01: Add 'core' to PackName type and CORE_SKILLS to manifest

**Status:** pending
**Commit:** -

---

### Task p02-t02: Create install-core.ts installer

**Status:** pending
**Commit:** -

---

### Task p02-t03: Create core subcommand (oat init tools core)

**Status:** pending
**Commit:** -

---

### Task p02-t04: Register core pack in init tools orchestrator

**Status:** pending
**Commit:** -

---

### Task p02-t05: Update scan-tools to recognize core pack

**Status:** pending
**Commit:** -

---

### Task p02-t06: Update bundle-assets.sh for docs bundling

**Status:** pending
**Commit:** -

---

### Task p02-t07: Update bundle-consistency test for core pack

**Status:** pending
**Commit:** -

---

## Phase 3: Rework Skills Per create-oat-skill Conventions

**Status:** pending
**Started:** -

### Task p03-t01: Rewrite oat-doctor following create-oat-skill template

**Status:** pending
**Commit:** -

---

### Task p03-t02: Rewrite oat-docs following create-oat-skill template

**Status:** pending
**Commit:** -

---

### Task p03-t03: Move skills from utility to core in manifest

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

### 2026-03-15 (Session 1)

**Session Start:** initial

- [x] p01-t01: Create oat-doctor skill - 83173df
- [x] p01-t02: Create oat-docs skill - 83173df
- [x] p01-t03: Register in manifest/bundle - 83173df

**What changed (high level):**

- Initial oat-doctor and oat-docs skills created and registered
- All tests, lint, type-check, build passing

**Decisions:**

- After user review: skills need create-oat-skill template compliance
- After user review: docs should resolve from ~/.oat/docs/ only
- After user review: new "core" pack needed instead of utility pack
- After user review: docs bundling infrastructure needed

**Follow-ups / TODO:**

- Phase 2: Build core pack CLI infrastructure
- Phase 3: Rewrite skills per create-oat-skill conventions

---

## Deviations from Plan

Document any deviations from the original plan.

| Task    | Planned                        | Actual                    | Reason                                                       |
| ------- | ------------------------------ | ------------------------- | ------------------------------------------------------------ |
| p01-\*  | Utility pack                   | Will move to core pack    | User feedback: core pack better fits user-level distribution |
| p01-t02 | Multi-location docs resolution | Will be ~/.oat/docs/ only | User decision D2                                             |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
| ----- | --------- | ------ | ------ | -------- |
| 1     | 973       | 973    | 0      | -        |
| 2     | -         | -      | -      | -        |
| 3     | -         | -      | -      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- {to be filled when implementation is complete}

**Behavioral changes (user-facing):**

- {to be filled}

**Key files / modules:**

- {to be filled}

**Verification performed:**

- {to be filled}

**Design deltas (if any):**

- {to be filled}

## References

- Plan: `plan.md`
- Discovery: `discovery.md`
