---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-06
oat_current_task_id: null
oat_generated: false
---

# Implementation: quick-start-discovery-capture

**Started:** 2026-03-06
**Last Updated:** 2026-03-06

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
> - `oat_current_task_id` always points at the next plan task to do.
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are not plan tasks. Track review status in `plan.md` under `## Reviews`.

## Progress Overview

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1 | complete | 2 | 2/2 |
| Phase 2 | complete | 2 | 2/2 |

**Total:** 4/4 tasks completed

---

## Phase 1: Tighten Quick-Start Discovery and Design Semantics

**Status:** complete
**Started:** 2026-03-06

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- Quick-start now has explicit guidance for synthesizing and backfilling discovery from session context before planning.
- Quick-mode discovery scaffolding now points directly to plan authoring and marks separate design creation as optional and threshold-based.

**Key files touched:**
- `.agents/skills/oat-project-quick-start/SKILL.md` - quick-start behavior contract
- `packages/cli/src/validation/skills.test.ts` - regression coverage for skill wording

**Verification:**
- Run: `pnpm --filter @oat/cli test -- src/validation/skills.test.ts src/commands/project/new/scaffold.test.ts`
- Result: pass

**Notes / Decisions:**
- Kept the change surface narrow by updating the quick-start skill plus the shared discovery template, without adding workflow-specific template branching.

### Task p01-t01: Update the quick-start skill to require session-context synthesis and discovery backfill

**Status:** completed
**Commit:** 5f31acc

**Notes:**
- Ensure the skill explicitly uses existing session detail before asking new questions and backfills discovery if questions were needed.

**Outcome (required):**
- Quick-start now explicitly tells agents to synthesize `discovery.md` from session context when enough detail is already available.
- The skill now requires blocker-only startup questions and backfilling discovery with product discussion, Q&A, options considered, and resulting decisions before planning.
- The quick-start contract now sets a higher bar for creating a separate design artifact instead of drifting into spec-driven behavior by default.

**Files changed:**
- `.agents/skills/oat-project-quick-start/SKILL.md` - added session-context synthesis, discovery backfill, and quick-safe design guidance
- `packages/cli/src/validation/skills.test.ts` - added a regression test for the new quick-start semantics

**Verification:**
- Run: `pnpm --filter @oat/cli test -- src/validation/skills.test.ts`
- Result: pass
- Run: `pnpm run cli -- internal validate-oat-skills`
- Result: fail due to a pre-existing unrelated finding in `.agents/skills/oat-repo-maintainability-review/SKILL.md` (`Missing section heading: ## Progress Indicators (User-Facing)`)

**Notes / Decisions:**
- The plan’s original `--runInBand` example was adapted to a package-local Vitest invocation because Vitest does not support that Jest flag.
- I kept the repo-level validator failure as a noted verification caveat rather than expanding scope into an unrelated skill fix.

**Issues Encountered:**
- `pnpm test -- --runInBand ...` failed because `--runInBand` is not a valid Vitest option; resolved by using `pnpm --filter @oat/cli test -- src/validation/skills.test.ts`.

---

### Task p01-t02: Define the optional-design threshold and align quick scaffolding

**Status:** completed
**Commit:** e688182

**Notes:**
- Keep template wording compatible with quick mode and make separate design creation clearly optional, not default.

**Outcome (required):**
- The shared discovery template no longer routes quick projects straight into `oat-project-spec`.
- Quick-mode next-step guidance now points directly to `plan.md`.
- The discovery template now states that a separate `design.md` is optional and only justified when the available technical detail materially benefits from a distinct artifact.

**Files changed:**
- `.oat/templates/discovery.md` - replaced spec-driven-only next steps with workflow-safe quick/spec guidance
- `packages/cli/src/commands/project/new/scaffold.test.ts` - added a repo-template regression asserting quick-safe discovery wording

**Verification:**
- Run: `pnpm --filter @oat/cli test -- src/commands/project/new/scaffold.test.ts`
- Result: pass
- Run: `pnpm --filter @oat/cli test -- src/commands/project/new/scaffold.test.ts src/validation/skills.test.ts`
- Result: pass

**Notes / Decisions:**
- I treated the quick-mode design threshold as a wording concern in the shared discovery template rather than modifying the design template itself.

**Issues Encountered:**
- The first scaffold assertion failed because the template did not explicitly call separate design optional; resolved by tightening the quick-mode next-step wording.

---

## Phase 2: Add Durable Workflow Guards

**Status:** complete
**Started:** 2026-03-06

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- Quick-start semantics are now enforced both in the skill text and in validator-backed regression coverage.
- Repo-facing quick-mode references now describe discovery-first planning and optional design, matching the updated workflow behavior.

**Key files touched:**
- `packages/cli/src/validation/skills.ts` - quick-start-specific validator guard
- `packages/cli/src/validation/skills.test.ts` - fixture and repo-content regression coverage
- `.oat/repo/reference/current-state.md` - current-state quick-mode summary
- `.oat/repo/reference/decision-record.md` - ADR wording for quick-mode discovery/design behavior

**Verification:**
- Run: `pnpm test && pnpm lint && pnpm type-check && pnpm build`
- Result: pass

**Notes / Decisions:**
- Repo-level `internal validate-oat-skills` still reports an unrelated pre-existing gap in `oat-repo-maintainability-review`; implementation work here did not introduce that failure.

### Task p02-t01: Add regression coverage for quick-start discovery-ready projects

**Status:** completed
**Commit:** 1ae8ed4

**Outcome (required):**
- The OAT skill validator now enforces quick-start-specific discovery semantics instead of relying only on repo-file assertions.
- The validator now reports missing session-context synthesis, discovery backfill, and blocker-only follow-up guidance for `oat-project-quick-start`.
- A dedicated fixture test now proves those validator findings appear when the quick-start-specific guidance is missing.

**Files changed:**
- `packages/cli/src/validation/skills.ts` - added quick-start-specific semantic validation
- `packages/cli/src/validation/skills.test.ts` - added a fixture-driven regression test for missing quick-start guidance

**Verification:**
- Run: `pnpm --filter @oat/cli test -- src/validation/skills.test.ts src/commands/project/new/scaffold.test.ts`
- Result: pass
- Run: `pnpm run cli -- internal validate-oat-skills`
- Result: fail due to the same pre-existing unrelated finding in `.agents/skills/oat-repo-maintainability-review/SKILL.md`

**Notes / Decisions:**
- I kept the validator rule scoped to `oat-project-quick-start` so the new guard is durable without imposing generic content requirements on unrelated skills.

---

### Task p02-t02: Refresh OAT-facing references after the workflow change

**Status:** completed
**Commit:** 26a3519

**Outcome (required):**
- Repo-facing quick-mode references now describe the updated discovery-first behavior instead of leaving quick mode as an underspecified shorthand.
- The quick/import ADR now records that quick mode should synthesize/backfill discovery from session context and treat separate design creation as optional.

**Files changed:**
- `.oat/repo/reference/current-state.md` - updated the quick-lane summary
- `.oat/repo/reference/decision-record.md` - captured the discovery-first and optional-design quick-mode contract

**Verification:**
- Run: `pnpm --filter @oat/cli test -- src/validation/skills.test.ts src/commands/project/new/scaffold.test.ts`
- Result: pass
- Run: `pnpm run cli -- internal validate-oat-skills`
- Result: fail due to the same pre-existing unrelated finding in `.agents/skills/oat-repo-maintainability-review/SKILL.md`

**Notes / Decisions:**
- I updated only the references that materially understated the new quick-mode behavior instead of broad repo-wide wording churn.

---

## Orchestration Runs

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

### 2026-03-06

**Session Start:** planning

- [x] p01-t01: Update the quick-start skill to require session-context synthesis and discovery backfill - 5f31acc
- [x] p01-t02: Define the optional-design threshold and align quick scaffolding - e688182
- [x] p02-t01: Add regression coverage for quick-start discovery-ready projects - 1ae8ed4
- [x] p02-t02: Refresh OAT-facing references after the workflow change - 26a3519

**What changed (high level):**
- Quick-start skill now describes session-context synthesis and discovery backfill
- Shared discovery scaffolding now routes quick mode directly to planning and makes separate design creation optional
- Regression coverage now checks both the quick-start skill semantics and the shared discovery template wording
- The OAT skill validator now enforces the quick-start semantics directly
- Repo-facing quick-mode references now match the discovery-first, optional-design workflow

**Decisions:**
- Keep this as a quick workflow project
- Treat the quick-start skill contract and discovery/design templates as the primary change surface
- Accept a package-local Vitest invocation as the correct verification path for this repo
- Treat the design threshold as a discovery-template concern unless a later task proves the design template itself needs quick-specific guidance
- Prefer validator-level enforcement for quick-start semantics so the repo can detect drift without relying only on repo-file assertions

**Follow-ups / TODO:**
- Request final review
- Decide whether to fix the unrelated pre-existing `oat-repo-maintainability-review` validator issue in a follow-up

**Blockers:**
- Repo-wide OAT skill validation currently reports an unrelated pre-existing finding in `oat-repo-maintainability-review`

**Session End:** implementation tasks complete

---

## Deviations from Plan

| Task | Planned | Actual | Reason |
|------|---------|--------|--------|
| - | - | - | - |

## Test Results

| Phase | Tests Run | Passed | Failed | Coverage |
|-------|-----------|--------|--------|----------|
| 1 | - | - | - | - |
| 2 | - | - | - | - |

## Final Summary (for PR/docs)

**What shipped:**
- `oat-project-quick-start` now requires session-context synthesis and discovery backfill before planning
- The shared discovery template now keeps quick projects in the discovery -> plan path unless a separate design artifact is truly warranted
- The OAT skill validator now enforces the new quick-start semantics, and repo references describe the updated behavior

**Behavioral changes (user-facing):**
- Quick-start can confidently synthesize `discovery.md` from the active conversation instead of leaving placeholder scaffolding when enough detail already exists
- If quick-start needs startup Q&A, it now treats that discussion as artifact input and backfills discovery before writing the plan
- Quick-mode guidance now makes separate design creation explicitly optional and threshold-based

**Key files / modules:**
- `.agents/skills/oat-project-quick-start/SKILL.md` - primary behavior contract
- `.oat/templates/discovery.md` - shared discovery scaffold wording

**Verification performed:**
- `pnpm --filter @oat/cli test -- src/validation/skills.test.ts`
- `pnpm --filter @oat/cli test -- src/commands/project/new/scaffold.test.ts`
- `pnpm --filter @oat/cli test -- src/validation/skills.test.ts src/commands/project/new/scaffold.test.ts`
- `pnpm test`
- `pnpm lint`
- `pnpm type-check`
- `pnpm build`
- `pnpm run cli -- internal validate-oat-skills` (still fails on a pre-existing unrelated finding in `oat-repo-maintainability-review`)

**Design deltas (if any):**
- Quick mode no longer implies “no design ever”; it now treats `design.md` as an optional artifact only when the available technical detail justifies it

## References

- Plan: `plan.md`
- Discovery: `discovery.md`
