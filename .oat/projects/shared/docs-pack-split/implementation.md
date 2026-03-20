---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-20
oat_current_task_id: p01-t02
oat_generated: false
---

# Implementation: docs-pack-split

**Started:** 2026-03-20
**Last Updated:** 2026-03-20

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
| Phase 1 | in_progress | 2     | 1/2       |
| Phase 2 | pending     | 2     | 0/2       |

**Total:** 1/4 tasks completed

---

## Phase 1: Add the Docs Pack to the CLI Model

**Status:** in_progress
**Started:** 2026-03-20

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

### Task p01-t01: Introduce the `docs` pack manifest and installer command

**Status:** completed
**Commit:** 983e23bc564ffe09328fc189f00876ee2d0c2deb

**Outcome (required when completed):**

- Added a first-class `docs` pack installer command under `oat init tools`
  with project/user scope behavior matching the current user-eligible packs.
- Split docs and agent-instructions analyze/apply skills out of
  `UTILITY_SKILLS` into a dedicated `DOCS_SKILLS` manifest entry.
- Wired the main init-tools command to recognize `docs` in pack selection,
  default non-interactive installs, and AGENTS.md tool-pack descriptions.
- Added dedicated installer tests plus updated init-tools and bundle
  consistency coverage for the new pack.

**Files changed:**

- `packages/cli/src/commands/init/tools/docs/index.ts` - new docs-pack command
- `packages/cli/src/commands/init/tools/docs/index.test.ts` - command tests
- `packages/cli/src/commands/init/tools/docs/install-docs.ts` - docs skill installer
- `packages/cli/src/commands/init/tools/docs/install-docs.test.ts` - installer tests
- `packages/cli/src/commands/init/tools/index.ts` - main pack registration and install flow
- `packages/cli/src/commands/init/tools/index.test.ts` - init-tools expectations
- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - new pack manifest split
- `packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts` - bundle coverage for docs pack

**Verification:**

- Run: `pnpm --filter @oat/cli exec vitest run src/commands/init/tools/docs/install-docs.test.ts src/commands/init/tools/docs/index.test.ts src/commands/init/tools/index.test.ts src/commands/init/tools/shared/bundle-consistency.test.ts`
- Result: pass
- Run: `pnpm --filter @oat/cli lint && pnpm --filter @oat/cli type-check`
- Result: pass

**Notes / Decisions:**

- Used direct `vitest` execution for task-owned files because the package test
  script fan-outs into unrelated suites that belong to later plan tasks.
- Kept `oat-docs` in `core` while making `docs` a user-eligible pack.

---

### Task p01-t02: Propagate `docs` pack support through tool management and legacy removal flows

**Status:** pending
**Commit:** -

**Notes:**

- Update scanning, list/update/remove flows, legacy `remove skills --pack`, and
  help snapshots after the new pack exists in the installer path.

---

## Phase 2: Decouple Shared Assets and Refresh Documentation

**Status:** pending
**Started:** -

### Task p02-t01: Move the shared tracking helper to a neutral location and update skill references

**Status:** pending
**Commit:** -

---

### Task p02-t02: Update product docs and examples for the new pack layout

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

### 2026-03-20

**Session Start:** {time}

- [x] p01-t01: Introduce the `docs` pack manifest and installer command - 983e23bc
- [ ] p01-t02: Propagate `docs` pack support through tool management and legacy removal flows
- [ ] p02-t01: Move the shared tracking helper to a neutral location and update skill references
- [ ] p02-t02: Update product docs and examples for the new pack layout

**What changed (high level):**

- Quick-mode OAT project scaffolded for the docs-pack split
- Discovery captured and approved path selected
- Implementation plan generated with four executable tasks
- Added the `docs` pack installer, manifest split, and task-owned test coverage

**Decisions:**

- Keep `oat-docs` in `core` and move the four analyze/apply workflows into a
  new `docs` pack
- Treat helper relocation as first-class implementation work so the new pack
  has no hidden dependency on `oat-agent-instructions-analyze`
- Use direct `vitest` file execution for task verification when the package
  script would pull in unrelated suites from later tasks

**Follow-ups / TODO:**

- Confirm the best neutral shared-script home before implementing `p02-t01`
- Sweep for any remaining pack mentions outside the currently identified docs pages

**Blockers:**

- None - plan is ready for implementation

**Session End:** {time}

---

### 2026-03-20

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

| Phase | Tests Run | Passed | Failed | Coverage |
| ----- | --------- | ------ | ------ | -------- |
| 1     | -         | -      | -      | -        |
| 2     | -         | -      | -      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- Not yet implemented

**Behavioral changes (user-facing):**

- Not yet implemented

**Key files / modules:**

- `packages/cli/src/commands/init/tools/` - pack installer and manifest work
- `packages/cli/src/commands/tools/` - pack lifecycle and scan/update/remove behavior
- `apps/oat-docs/docs/` - end-user docs for the new pack layout

**Verification performed:**

- Planning only - no implementation verification yet

**Design deltas (if any):**

- No design artifact used in this quick-mode project

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`
