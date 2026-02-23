---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-02-21
oat_current_task_id: null
oat_generated: false
---

# Implementation: rename-full-to-spec-driven-workflow

**Started:** 2026-02-21
**Last Updated:** 2026-02-21

> This document is used to resume interrupted implementation sessions.

## Progress Overview

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1 | completed | 2 | 2/2 |
| Phase 2 | completed | 2 | 2/2 |
| Phase 3 | completed | 2 | 2/2 |
| Phase 4 | completed | 9 | 9/9 |

**Total:** 15/15 tasks completed

---

## Phase 1: Canonical Workflow Contract Rename

**Status:** completed

### Task p01-t01: Rename mode literals in templates and CLI runtime

**Status:** completed
**Commit:** 150c426

**Outcome:**
- Renamed canonical workflow mode defaults and routing from `full` to `spec-driven` in templates and CLI runtime.
- Updated project-new mode enum/default and dashboard language to the spec-driven term.

**Verification:**
- `pnpm --filter @oat/cli exec vitest run src/commands/project/new/index.test.ts src/commands/project/new/scaffold.test.ts src/commands/state/generate.test.ts` (pass)
- `pnpm --filter @oat/cli type-check` (pass)

### Task p01-t02: Rename promote skill and workflow registry references

**Status:** completed
**Commit:** 23a6836

**Outcome:**
- Renamed promotion skill id/path to `oat-project-promote-spec-driven`.
- Updated workflow install/bundle references and skills docs.

**Verification:**
- `pnpm --filter @oat/cli exec vitest run src/commands/init/tools/workflows/install-workflows.test.ts` (pass)
- `pnpm --filter @oat/cli type-check` (pass)

---

## Phase 2: Update Docs And Skill Contracts

**Status:** completed

### Task p02-t01: Update workflow docs and examples to Spec-Driven lane

**Status:** completed
**Commit:** d503e4a

**Outcome:**
- Updated README + workflow/CLI/project docs to `Spec-Driven/spec-driven` lane wording.
- Replaced `--mode full` examples with `--mode spec-driven`.
- Updated `.oat/repo/reference/*`, `.oat/repo/knowledge/project-index.md`, and `.oat/sync/manifest.json` references for renamed promote skill and mode contract.

**Verification:**
- `rg -n "promote-full|--mode full|Full workflow lane|\bfull mode\b|full/quick/import|full\|quick\|import|oat_workflow_mode.*full|oat_plan_source.*full" ...` on planned surfaces (no hits)
- `pnpm lint` (pass)

### Task p02-t02: Update OAT skill/reviewer mode contracts

**Status:** completed
**Commit:** b90d5b9

**Outcome:**
- Updated reviewer and selected `oat-project-*` skill contracts to default to/use `spec-driven` mode.
- Updated mode matrices, wording, and promote-skill references in affected skills.

**Verification:**
- `rg -n "oat_workflow_mode.*full|default.*full|\bfull mode\b" .agents/agents/oat-reviewer.md .agents/skills/oat-project-*/SKILL.md` (no hits)
- `pnpm run cli -- internal validate-oat-skills` (pass)

---

## Phase 3: Final Test Alignment And Release Readiness

**Status:** completed

### Task p03-t01: Update tests and help snapshots for renamed mode

**Status:** completed
**Commit:** 2b8ee3d

**Outcome:**
- Updated CLI help snapshot for `project new --mode` to `spec-driven` default/choices.

**Verification:**
- RED: targeted test run failed on expected snapshot mismatch.
- GREEN: `pnpm --filter @oat/cli exec vitest run src/commands/help-snapshots.test.ts src/commands/project/new/index.test.ts src/commands/project/new/scaffold.test.ts src/commands/state/generate.test.ts` (pass)
- `pnpm --filter @oat/cli build && pnpm --filter @oat/cli test` (pass)

### Task p03-t02: End-to-end smoke + workspace validation

**Status:** completed
**Commit:** e33c1a5, 3f5424e

**Outcome:**
- Verified CLI smoke scaffolding with `--mode spec-driven` and dashboard refresh behavior.
- Restored active project pointer back to this project after smoke validation.
- Reconciled provider-view drift by syncing manifest/provider links to `oat-project-promote-spec-driven` and removing stale `oat-project-promote-full` symlinks.

**Verification:**
- `pnpm run cli -- project new smoke-spec-driven --mode spec-driven --json` (pass)
- `pnpm run cli -- state refresh` (pass)
- `pnpm lint && pnpm type-check && pnpm test` (pass)

---

## Phase 4: Review Fixes (Plan Artifact)

**Status:** completed

Completed review-fix tasks and commits:
- `p04-t01` - `dae9910`
- `p04-t02` - `71674a1`
- `p04-t03` - `2823afe`
- `p04-t04` - `068b95d`
- `p04-t05` - `b4401fc`
- `p04-t06` - `4ad612a`
- `p04-t07` - `0c9f3ec`
- `p04-t08` - `d8376dd`
- `p04-t09` - `739ff7f`

---

### Review Received: plan

**Date:** 2026-02-21
**Review artifact:** reviews/artifact-plan-review-2026-02-21.md

**Findings:**
- Critical: 2
- Important: 3
- Medium: 0
- Minor: 4

**New tasks added:** p04-t01..p04-t09

**Minor findings disposition:**
- m1, m2, m3, m4 converted to review tasks per user instruction.

**Next:** Request plan artifact re-review (`oat-project-review-provide artifact plan`) and process with `oat-project-review-receive`.

---

### Review Received: final

**Date:** 2026-02-21
**Review artifact:** reviews/final-review-2026-02-21.md

**Findings:**
- Critical: 0
- Important: 0
- Medium: 0
- Minor: 1

**New tasks added:** none

**Deferred Findings (Minor):**
- `m1` Archived external plan still references legacy `full/quick/import` wording (`.oat/repo/reference/external-plans/2026-02-19-subagent-implement-skill-refactor.md:92`).
  - Disposition: deferred by explicit user decision (2026-02-21).
  - Rationale: archived external-plans surface is historical/non-contract and out of scope for this rename.

**Finding disposition map:**
- `m1` -> deferred (explicit user approval; non-contract archived content)

**Next:** Run `oat-project-pr-final`.

---

### Review Received: final

**Date:** 2026-02-23
**Review artifact:** reviews/final-review-2026-02-22.md

**Findings:**
- Critical: 0
- Important: 0
- Medium: 0
- Minor: 2

**New tasks added:** none

**Deferred Findings (Minor):**
- `m1` PR artifact diff summary is slightly stale (`pr/project-pr-2026-02-22.md:76`).
  - Disposition: deferred by explicit user decision (2026-02-23).
  - Rationale: cosmetic artifact drift after a later commit; GitHub shows correct live diff stats.
- `m2` Archived external plan references legacy `oat-project-promote-full` (`.oat/repo/reference/external-plans/b15-b02-project-lifecycle-config-consolidation.md:331`).
  - Disposition: deferred by explicit user decision (2026-02-23).
  - Rationale: archived external-plans surface is historical/non-contract and out of scope for this rename.

**Finding disposition map:**
- `m1` -> deferred (explicit user approval; cosmetic/non-blocking)
- `m2` -> deferred (explicit user approval; non-contract archived content)

**Next:** Run `oat-project-complete`.

---

## Implementation Log

### 2026-02-21

- [x] p01-t01 - 150c426
- [x] p01-t02 - 23a6836
- [x] p02-t01 - d503e4a
- [x] p02-t02 - b90d5b9
- [x] p03-t01 - 2b8ee3d
- [x] p03-t02 - e33c1a5
- [x] p03-t02 follow-up (provider sync) - 3f5424e
- [x] p04-t01 - dae9910
- [x] p04-t02 - 71674a1
- [x] p04-t03 - 2823afe
- [x] p04-t04 - 068b95d
- [x] p04-t05 - b4401fc
- [x] p04-t06 - 4ad612a
- [x] p04-t07 - 0c9f3ec
- [x] p04-t08 - d8376dd
- [x] p04-t09 - 739ff7f

---

## Final Summary (for PR/docs)

- Replaced long-lifecycle mode contract from `full` to `spec-driven` across templates, CLI mode handling, skill wiring, and documentation.
- Renamed promotion skill to `oat-project-promote-spec-driven` and aligned registry/manifest/reference surfaces.
- Updated skill/reviewer mode contracts and CLI help snapshots to remove legacy `full` mode usage.
- Validation completed with targeted CLI tests, skill validation, smoke scaffolding, provider sync reconciliation, and full workspace `lint/type-check/test`.
