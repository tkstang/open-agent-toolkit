---
oat_status: complete
oat_ready_for: pr
oat_blockers: []
oat_last_updated: 2026-03-15
oat_current_task_id: null
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

| Phase   | Status   | Tasks | Completed |
| ------- | -------- | ----- | --------- |
| Phase 1 | complete | 3     | 3/3       |
| Phase 2 | complete | 7     | 7/7       |
| Phase 3 | complete | 3     | 3/3       |

**Total:** 13/13 tasks completed

---

## Phase 1: Skills (Initial — reworked in Phase 3)

**Status:** complete (committed, reworked in Phase 3)
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

- Skills were authored freehand, not following create-oat-skill template — reworked in Phase 3
- Docs resolution included repo fallback paths — fixed to ~/.oat/docs/ only per D2
- Registered in utility pack — moved to core pack per D1

### Task p01-t01: Create oat-doctor skill

**Status:** completed
**Commit:** 83173df

**Outcome:**

- System now has an oat-doctor skill with check and summary modes

**Files changed:**

- `.agents/skills/oat-doctor/SKILL.md` - new file

---

### Task p01-t02: Create oat-docs skill

**Status:** completed
**Commit:** 83173df

**Outcome:**

- System now has an oat-docs Q&A skill

**Files changed:**

- `.agents/skills/oat-docs/SKILL.md` - new file

---

### Task p01-t03: Register skills in manifest and bundle

**Status:** completed
**Commit:** 83173df

**Outcome:**

- Both skills registered in UTILITY_SKILLS and bundle-assets.sh

**Files changed:**

- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - added to UTILITY_SKILLS
- `packages/cli/scripts/bundle-assets.sh` - added to SKILLS array

---

## Phase 2: Core Pack CLI Infrastructure

**Status:** complete
**Started:** 2026-03-15

### Phase Summary

**Outcome (what changed):**

- New `core` pack type added to PackName union
- CORE_SKILLS manifest created with oat-docs and oat-doctor (moved from UTILITY_SKILLS)
- install-core.ts installer handles skill copying + docs bundling to ~/.oat/docs/
- `oat init tools core` subcommand always installs at user scope
- Core pack integrated into init tools orchestrator (interactive/non-interactive)
- scan-tools.ts recognizes core pack skills
- bundle-assets.sh copies docs from apps/oat-docs/docs/ to assets/docs/
- Bundle consistency test updated for core pack

**Key files touched:**

- `packages/cli/src/commands/tools/shared/types.ts` - PackName union
- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - CORE_SKILLS
- `packages/cli/src/commands/init/tools/core/install-core.ts` - installer
- `packages/cli/src/commands/init/tools/core/install-core.test.ts` - tests
- `packages/cli/src/commands/init/tools/core/index.ts` - subcommand
- `packages/cli/src/commands/init/tools/core/index.test.ts` - tests
- `packages/cli/src/commands/init/tools/index.ts` - orchestrator
- `packages/cli/src/commands/init/tools/index.test.ts` - tests
- `packages/cli/src/commands/help-snapshots.test.ts` - snapshot update
- `packages/cli/src/commands/tools/shared/scan-tools.ts` - core pack recognition
- `packages/cli/src/commands/tools/remove/index.ts` - VALID_PACKS
- `packages/cli/src/commands/tools/update/index.ts` - VALID_PACKS
- `packages/cli/scripts/bundle-assets.sh` - docs bundling
- `packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts` - core test

**Verification:**

- Run: `pnpm --filter @oat/cli test && pnpm --filter @oat/cli type-check && pnpm --filter @oat/cli lint`
- Result: All passed (983/983 tests), clean type-check, 0 lint errors

### Task p02-t01: Add 'core' to PackName type and CORE_SKILLS to manifest

**Status:** completed
**Commit:** 58daa82

---

### Task p02-t02: Create install-core.ts installer

**Status:** completed
**Commit:** c4d3ff5

---

### Task p02-t03: Create core subcommand (oat init tools core)

**Status:** completed
**Commit:** 4d5ae33

---

### Task p02-t04: Register core pack in init tools orchestrator

**Status:** completed
**Commit:** d23fa07

---

### Task p02-t05: Update scan-tools to recognize core pack

**Status:** completed
**Commit:** 32dbbfe

---

### Task p02-t06: Update bundle-assets.sh for docs bundling

**Status:** completed
**Commit:** 51e7a5f

---

### Task p02-t07: Update bundle-consistency test for core pack

**Status:** completed (pulled into p02-t01/p02-t02)
**Commit:** 58daa82

---

## Phase 3: Rework Skills Per create-oat-skill Conventions

**Status:** complete
**Started:** 2026-03-15

### Phase Summary

**Outcome (what changed):**

- oat-doctor rewritten: references core pack in manifest, sources config explanations from ~/.oat/docs/, dashboard includes core pack
- oat-docs rewritten: resolves from ~/.oat/docs/ ONLY with no repo fallbacks, explicit blocked activity for fallback paths
- Both skills follow create-oat-skill template (mode assertion, progress banners, bash safety)

### Task p03-t01: Rewrite oat-doctor following create-oat-skill template

**Status:** completed
**Commit:** 062e7fc

---

### Task p03-t02: Rewrite oat-docs following create-oat-skill template

**Status:** completed
**Commit:** 062e7fc

---

### Task p03-t03: Final manifest/registration consistency check

**Status:** completed
**Commit:** (verification only, no code changes)

**Verification:**

- 983/983 tests passing
- Type-check clean
- Lint: 0 warnings, 0 errors
- Bundle consistency test passes (CORE_SKILLS recognized)
- scan-tools resolves core pack correctly

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

### 2026-03-15 (Session 2)

**Session Start:** resumed from p02-t01

- [x] p02-t01: Add core to PackName and CORE_SKILLS manifest - 58daa82
- [x] p02-t02: Create install-core.ts - c4d3ff5
- [x] p02-t03: Create core subcommand - 4d5ae33
- [x] p02-t04: Register in orchestrator - d23fa07
- [x] p02-t05: Update scan-tools - 32dbbfe
- [x] p02-t06: Bundle docs in assets - 51e7a5f
- [x] p02-t07: Bundle consistency test - (pulled into p02-t01)
- [x] p03-t01: Rewrite oat-doctor - 062e7fc
- [x] p03-t02: Rewrite oat-docs - 062e7fc
- [x] p03-t03: Final verification - passed

**What changed (high level):**

- Full core pack CLI infrastructure (type, manifest, installer, subcommand, orchestrator, scan-tools, bundle script)
- Skills rewritten per create-oat-skill conventions
- oat-docs resolves from ~/.oat/docs/ only
- oat-doctor references core pack and sources config docs from bundle

---

## Deviations from Plan

Document any deviations from the original plan.

| Task    | Planned                        | Actual                  | Reason                                                       |
| ------- | ------------------------------ | ----------------------- | ------------------------------------------------------------ |
| p01-\*  | Utility pack                   | Moved to core pack      | User feedback: core pack better fits user-level distribution |
| p01-t02 | Multi-location docs resolution | ~/.oat/docs/ only       | User decision D2                                             |
| p02-t07 | Separate task                  | Pulled into p02-t01/t02 | Bundle consistency test naturally part of manifest changes   |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
| ----- | --------- | ------ | ------ | -------- |
| 1     | 973       | 973    | 0      | -        |
| 2     | 983       | 983    | 0      | -        |
| 3     | 983       | 983    | 0      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- New "core" tool pack for OAT CLI with oat-doctor and oat-docs skills
- `oat init tools core` subcommand (always user scope)
- Core pack integrated into `oat init tools` interactive/non-interactive flow
- Docs bundling from apps/oat-docs/docs/ to ~/.oat/docs/ via assets pipeline
- oat-doctor: diagnostic skill with check mode (terse warnings) and summary mode (full dashboard)
- oat-docs: Q&A skill backed by locally-bundled docs at ~/.oat/docs/ only

**Behavioral changes (user-facing):**

- `oat init tools` now shows 4 packs (core, ideas, workflows, utility) instead of 3
- Core pack is checked by default and always installs to user scope
- `oat tools list` recognizes core pack skills
- `oat tools update` and `oat tools remove` accept 'core' as a pack name
- `/oat-doctor` available for setup diagnostics
- `/oat-docs` available for documentation Q&A

**Key files / modules:**

- `packages/cli/src/commands/init/tools/core/` - core pack subcommand and installer
- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - CORE_SKILLS
- `packages/cli/src/commands/tools/shared/types.ts` - PackName union
- `.agents/skills/oat-doctor/SKILL.md` - doctor skill
- `.agents/skills/oat-docs/SKILL.md` - docs skill
- `packages/cli/scripts/bundle-assets.sh` - docs bundling

**Verification performed:**

- 983/983 tests passing
- Type-check clean
- Lint: 0 warnings, 0 errors
- Bundle consistency test validates CORE_SKILLS alignment

**Design deltas (if any):**

- None — implemented as planned after user feedback incorporated

## References

- Plan: `plan.md`
- Discovery: `discovery.md`
