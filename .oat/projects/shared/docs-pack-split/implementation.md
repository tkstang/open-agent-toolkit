---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-20
oat_current_task_id: p03-t01
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
| Phase 1 | completed   | 2     | 2/2       |
| Phase 2 | completed   | 2     | 2/2       |
| Phase 3 | in_progress | 2     | 0/2       |

**Total:** 4/6 tasks completed

---

## Phase 1: Add the Docs Pack to the CLI Model

**Status:** completed
**Started:** 2026-03-20

### Phase Summary

**Outcome (what changed):**

- Added a dedicated `docs` pack to the installer model without moving
  foundational `oat-docs` out of `core`.
- Split docs and agent-instructions workflow skills out of `utility` and into
  pack-aware CLI metadata plus installer flows.
- Propagated the new pack name through tool scanning, update/remove targeting,
  legacy `remove skills --pack`, and CLI help output.

**Key files touched:**

- `packages/cli/src/commands/init/tools/` - new docs pack installer and main
  pack registration
- `packages/cli/src/commands/tools/shared/scan-tools.ts` - pack detection for installed tools
- `packages/cli/src/commands/tools/update/index.ts` - update pack validation
- `packages/cli/src/commands/tools/remove/index.ts` - remove pack validation
- `packages/cli/src/commands/remove/skills/remove-skills.ts` - legacy skill-pack removal support
- `packages/cli/src/commands/help-snapshots.test.ts` - CLI help expectations

**Verification:**

- Run: `pnpm --filter @oat/cli exec vitest run src/commands/init/tools/docs/install-docs.test.ts src/commands/init/tools/docs/index.test.ts src/commands/init/tools/index.test.ts src/commands/init/tools/shared/bundle-consistency.test.ts`
- Result: pass
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/tools/shared/scan-tools.test.ts src/commands/tools/list/list-tools.test.ts src/commands/tools/update/update-tools.test.ts src/commands/tools/remove/remove-tools.test.ts src/commands/remove/skills/remove-skills.test.ts src/commands/help-snapshots.test.ts`
- Result: pass
- Run: `pnpm --filter @oat/cli lint && pnpm --filter @oat/cli type-check`
- Result: pass

**Notes / Decisions:**

- Direct `vitest` execution remains the reliable way to verify task-owned files
  without picking up unrelated suites from later plan tasks.
- Help snapshot updates are part of pack-management scope because the pack names
  are user-facing CLI contract, not optional follow-up docs.

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

**Status:** completed
**Commit:** e254abe52c00f88cf2a736c94096eafd88cf0fcc

**Outcome (required when completed):**

- Added `docs` as a recognized pack across installed-tool scanning and tool info
  typing, so moved skills no longer show up as `custom`.
- Updated update/remove command pack validation and help text to accept the new
  `docs` pack name.
- Extended legacy `oat remove skills --pack` support to handle `docs`.
- Updated downstream test fixtures and help snapshots to reflect the new pack
  taxonomy consistently.

**Files changed:**

- `packages/cli/src/commands/tools/shared/types.ts` - pack type union
- `packages/cli/src/commands/tools/shared/scan-tools.ts` - docs pack resolution
- `packages/cli/src/commands/tools/shared/scan-tools.test.ts` - docs and utility pack expectations
- `packages/cli/src/commands/tools/list/list-tools.test.ts` - docs-pack list sample
- `packages/cli/src/commands/tools/update/index.ts` - docs pack validation
- `packages/cli/src/commands/tools/update/update-tools.test.ts` - docs pack fixture
- `packages/cli/src/commands/tools/remove/index.ts` - docs pack validation
- `packages/cli/src/commands/tools/remove/remove-tools.test.ts` - docs pack fixture
- `packages/cli/src/commands/remove/skills/remove-skills.ts` - docs pack legacy removal support
- `packages/cli/src/commands/remove/skills/remove-skills.test.ts` - docs pack removal test
- `packages/cli/src/commands/help-snapshots.test.ts` - CLI help snapshots

**Verification:**

- Run: `pnpm --filter @oat/cli exec vitest run src/commands/tools/shared/scan-tools.test.ts src/commands/tools/list/list-tools.test.ts src/commands/tools/update/update-tools.test.ts src/commands/tools/remove/remove-tools.test.ts src/commands/remove/skills/remove-skills.test.ts src/commands/help-snapshots.test.ts`
- Result: pass
- Run: `pnpm --filter @oat/cli lint && pnpm --filter @oat/cli type-check`
- Result: pass

**Notes / Decisions:**

- Updated user-facing help snapshots in the same task because pack-name drift in
  help output would otherwise immediately break the CLI contract.

---

## Phase 2: Decouple Shared Assets and Refresh Documentation

**Status:** completed
**Started:** 2026-03-20

### Phase Summary

**Outcome (what changed):**

- Updated the product docs to describe the new `docs` pack and its role next to
  `core` and `utility`.
- Switched docs-workflow quickstarts to prefer `oat tools install docs` while
  keeping `oat init tools docs` documented as the legacy pack-specific path.
- Refreshed the `oat-doctor` skill’s pack inventory and examples so its
  user-facing guidance matches the new pack split.
- Removed the last stale helper symlink from `oat-agent-instructions-apply`,
  which unblocked the full docs build after the helper relocation.

**Key files touched:**

- `README.md` - repo quickstart pack list
- `apps/oat-docs/docs/guide/tool-packs.md` - bundled-pack contract and docs-pack section
- `apps/oat-docs/docs/guide/getting-started.md` - guided setup pack descriptions
- `apps/oat-docs/docs/guide/cli-reference.md` - tool install pack list
- `apps/oat-docs/docs/guide/documentation/quickstart.md` - preferred docs-pack installation flow
- `apps/oat-docs/docs/guide/documentation/workflows.md` - docs workflow prerequisite guidance
- `.agents/skills/oat-doctor/SKILL.md` - user-facing pack inventory examples
- `.agents/skills/oat-agent-instructions-apply/scripts/resolve-tracking.sh` - removed stale symlink

**Verification:**

- Run: `rg -n -e 'utility pack' -e 'oat init tools utility' -e 'docs analysis and apply skills installed via the utility pack' README.md apps/oat-docs/docs .agents/skills`
- Result: no matches
- Run: `rg -n -e 'oat tools install docs' -e 'oat init tools docs' -e 'docs pack installs' README.md apps/oat-docs/docs .agents/skills`
- Result: expected docs-pack references found
- Run: `pnpm --filter oat-docs docs:lint`
- Result: pass
- Run: `pnpm build:docs`
- Result: pass

### Task p02-t01: Move the shared tracking helper to a neutral location and update skill references

**Status:** completed
**Commit:** 30234c42dc042de5fccc62b79532830c3e3d2d87

**Outcome (required when completed):**

- Moved the shared tracking resolver to `.oat/scripts/resolve-tracking.sh` so
  docs workflows no longer depend on an internal path owned by
  `oat-agent-instructions-analyze`.
- Updated docs, agent-instructions, and repo-knowledge-index skill references
  to point at the neutral helper location.
- Extended the docs-pack installer and workflow asset expectations so the
  shared helper is bundled and installed into `.oat/scripts`.
- Updated task-owned tests and bundling logic to treat the helper as a shared
  asset rather than a skill-private script.

**Files changed:**

- `.oat/scripts/resolve-tracking.sh` - new neutral helper location
- `.agents/skills/oat-agent-instructions-analyze/SKILL.md` - helper reference update
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - helper reference update
- `.agents/skills/oat-docs-analyze/SKILL.md` - helper reference update
- `.agents/skills/oat-docs-apply/SKILL.md` - helper reference update
- `.agents/skills/oat-repo-knowledge-index/SKILL.md` - helper reference update
- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - shared script manifest entries
- `packages/cli/src/commands/init/tools/docs/install-docs.ts` - docs-pack shared-script installation
- `packages/cli/src/commands/init/tools/docs/index.ts` - installer result reporting
- `packages/cli/src/commands/init/tools/docs/install-docs.test.ts` - shared-script installer coverage
- `packages/cli/src/commands/init/tools/docs/index.test.ts` - command output expectations
- `packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts` - workflow shared-script expectations
- `packages/cli/scripts/bundle-assets.sh` - bundled shared helper asset

**Verification:**

- Run: `pnpm --filter @oat/cli exec vitest run src/commands/init/tools/docs/install-docs.test.ts src/commands/init/tools/docs/index.test.ts src/commands/init/tools/workflows/install-workflows.test.ts`
- Result: pass
- Run: `pnpm --filter @oat/cli lint && pnpm --filter @oat/cli type-check`
- Result: pass
- Run: `rg -n "oat-agent-instructions-analyze/scripts/resolve-tracking\\.sh" .agents/skills packages/cli/scripts .oat/scripts -S`
- Result: no matches
- Run: `rg -n "\\.oat/scripts/resolve-tracking\\.sh" .agents/skills .oat/scripts packages/cli/scripts -S`
- Result: only neutral helper references found

---

### Task p02-t02: Update product docs and examples for the new pack layout

**Status:** completed
**Commit:** ce0a6352baa7a3939d75302648fb516850028739

**Outcome (required when completed):**

- Updated the README and OAT docs app pages to present `docs` as a first-class
  pack and to remove stale guidance that routed docs workflows through
  `utility`.
- Added a dedicated docs-pack explanation covering its analyze/apply workflows
  and the distinction between passive `oat-docs` access in `core` and active
  docs/instructions workflows in `docs`.
- Switched docs-workflow quickstarts and workflow pages to prefer
  `oat tools install docs`, while retaining `oat init tools docs` as the
  backward-compatible pack-specific path.
- Updated the `oat-doctor` skill’s user-facing pack inventory and removed the
  stale helper symlink in `oat-agent-instructions-apply` so the full docs build
  no longer pulled a dead helper path.

**Files changed:**

- `README.md` - quickstart pack list
- `apps/oat-docs/docs/guide/tool-packs.md` - docs pack contract and install examples
- `apps/oat-docs/docs/guide/getting-started.md` - guided setup pack list
- `apps/oat-docs/docs/guide/cli-reference.md` - tool install examples
- `apps/oat-docs/docs/guide/documentation/quickstart.md` - docs-pack quickstart flow
- `apps/oat-docs/docs/guide/documentation/workflows.md` - docs workflow prerequisite note
- `.agents/skills/oat-doctor/SKILL.md` - pack inventory examples
- `.agents/skills/oat-agent-instructions-apply/scripts/resolve-tracking.sh` - removed stale symlink

**Verification:**

- Run: `rg -n -e 'utility pack' -e 'oat init tools utility' -e 'docs analysis and apply skills installed via the utility pack' README.md apps/oat-docs/docs .agents/skills`
- Result: no matches
- Run: `rg -n -e 'oat tools install docs' -e 'oat init tools docs' -e 'docs pack installs' README.md apps/oat-docs/docs .agents/skills`
- Result: expected docs-pack references found
- Run: `pnpm --filter oat-docs docs:lint`
- Result: pass
- Run: `pnpm build:docs`
- Result: pass

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Review Received: final

**Date:** 2026-03-20
**Review artifact:** reviews/archived/final-review-2026-03-20.md

**Findings:**

- Critical: 0
- Important: 0
- Medium: 0
- Minor: 2

**New tasks added:** `p03-t01`, `p03-t02`

**Deferred Findings (Minor):**

- None. User chose to convert all final-review minor findings into fix tasks.

**Finding disposition map:**

- `m1` -> converted (`p03-t01`) - correct the stale `utility` pack description
  in `PACK_DESCRIPTIONS`
- `m2` -> converted (`p03-t02`) - align `oat-doctor` pack enum guidance with
  the current `PackName` union

**Next:** Execute fix tasks via the `oat-project-implement` skill.

After the fix tasks are complete:

- Update the review row status to `fixes_completed`
- Re-run `oat-project-review-provide code final` then
  `oat-project-review-receive` to reach `passed`

---

## Implementation Log

Chronological log of implementation progress.

### 2026-03-20

**Session Start:** {time}

- [x] p01-t01: Introduce the `docs` pack manifest and installer command - 983e23bc
- [x] p01-t02: Propagate `docs` pack support through tool management and legacy removal flows - e254abe5
- [x] p02-t01: Move the shared tracking helper to a neutral location and update skill references - 30234c42
- [x] p02-t02: Update product docs and examples for the new pack layout - ce0a6352

**What changed (high level):**

- Quick-mode OAT project scaffolded for the docs-pack split
- Discovery captured and approved path selected
- Implementation plan generated with four executable tasks
- Added the `docs` pack installer, manifest split, and task-owned test coverage
- Wired the `docs` pack through scanning, update/remove flows, legacy removal,
  and CLI help output
- Moved the shared tracking helper to `.oat/scripts` and updated bundled skill
  references plus docs-pack installation to use the neutral path
- Updated repo/docs guidance for the new pack layout and removed the final
  stale helper symlink that blocked full docs builds

**Decisions:**

- Keep `oat-docs` in `core` and move the four analyze/apply workflows into a
  new `docs` pack
- Use `.oat/scripts` as the neutral shared-helper home so installer packs and
  skill docs can reference the same stable path
- Use direct `vitest` file execution for task verification when the package
  script would pull in unrelated suites from later tasks

**Follow-ups / TODO:**

- Pause at the configured `p02` checkpoint before entering review/finalization flow

**Blockers:**

- None - plan is ready for implementation

**Session End:** {time}

---

### 2026-03-20

**Session Start:** {time}

{Continue log...}

---

### 2026-03-20

**Session Start:** {time}

- [x] final review received and parsed
- [x] m1 converted to `p03-t01`
- [x] m2 converted to `p03-t02`
- [ ] Execute `p03-t01`
- [ ] Execute `p03-t02`

**What changed (high level):**

- Processed the active final code review artifact
- Added a dedicated review-fixes phase with two small follow-up tasks
- Reset implementation state to resume at `p03-t01`

**Decisions:**

- Converted both final-review minor findings into tasks instead of deferring
  them so the final gate can be cleared cleanly on re-review
- Added fixes as a dedicated `Phase 3: Review Fixes` rather than mutating prior
  phase summaries retroactively

**Follow-ups / TODO:**

- Implement `p03-t01` and `p03-t02`
- Re-run final code review after fixes land

**Blockers:**

- None

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
