---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-20
oat_current_task_id: null
oat_generated: false
---

# Implementation: agent-instructions-artifact-bundle

**Started:** 2026-03-19
**Last Updated:** 2026-03-19

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

| Phase   | Status    | Tasks | Completed |
| ------- | --------- | ----- | --------- |
| Phase 1 | completed | 2     | 2/2       |
| Phase 2 | completed | 2     | 2/2       |

**Total:** 4/4 tasks completed

---

## Phase 1: Define Bundle Contract

**Status:** completed
**Started:** 2026-03-19

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Defined a two-layer analyze/apply handoff: review artifact plus companion bundle.
- Introduced stable recommendation IDs and pack references into the contract.
- Added concrete bundle templates for the summary, manifest, and recommendation packs.

**Key files touched:**

- `.agents/skills/oat-agent-instructions-analyze/SKILL.md` - documented bundle-aware analyze output.
- `.agents/skills/oat-agent-instructions-analyze/references/analysis-artifact-template.md` - added recommendation IDs
  and bundle-pack references.
- `.agents/skills/oat-agent-instructions-analyze/references/bundle-summary-template.md` - added bundle summary
  template.
- `.agents/skills/oat-agent-instructions-analyze/references/recommendations-manifest-template.yaml` - added bundle
  manifest template.
- `.agents/skills/oat-agent-instructions-analyze/references/recommendation-pack-template.md` - added per-recommendation
  pack template.
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - made apply bundle-first with legacy fallback.
- `.agents/skills/oat-agent-instructions-apply/references/apply-plan-template.md` - threaded recommendation IDs and
  bundle-pack references into the plan review contract.

**Verification:**

- Run: `pnpm format && pnpm lint`
- Result: pass

**Notes / Decisions:**

- Bundle discovery is based on the markdown artifact basename, so apply can derive `.bundle/` without tracking
  changes.
- Concrete parsing and fixture coverage are deferred to Phase 2.

### Task p01-t01: Define bundle schema and output layout

**Status:** completed
**Commit:** 798cd649

**Outcome (required when completed):**

- Analyze now defines a two-layer output contract: a human review artifact plus a companion `.bundle/` directory.
- Apply now treats the companion bundle as the primary generation contract when present and falls back to markdown-only
  artifacts only for legacy analyses.
- Recommendations now have stable IDs and pack-path expectations in the analysis template so the future bundle layout is
  deterministic.

**Files changed:**

- `.agents/skills/oat-agent-instructions-analyze/SKILL.md` - documented the bundle layout, output paths, and
  analyze/apply boundary
- `.agents/skills/oat-agent-instructions-analyze/references/analysis-artifact-template.md` - added bundle-output
  guidance plus stable recommendation IDs and pack references
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - made apply bundle-first with explicit validation and legacy
  fallback rules

**Verification:**

- Run: `pnpm format && pnpm lint`
- Result: pass

**Notes / Decisions:**

- The companion bundle directory is derived from the markdown artifact basename (`{artifact}.bundle/`) so apply can
  discover it without new tracking keys.
- Concrete bundle templates are deferred to `p01-t02`.

---

### Task p01-t02: Add recommendation-pack templates and validation guidance

**Status:** completed
**Commit:** c69a9ab2

**Outcome (required when completed):**

- Added concrete templates for the bundle summary, recommendations manifest, and recommendation packs.
- Threaded recommendation IDs and bundle-pack paths into the apply plan template.
- Tightened apply guidance so plan construction stays anchored to the same pack file referenced by the manifest.

**Files changed:**

- `.agents/skills/oat-agent-instructions-analyze/references/bundle-summary-template.md` - new apply-facing summary
  template.
- `.agents/skills/oat-agent-instructions-analyze/references/recommendations-manifest-template.yaml` - new manifest
  template.
- `.agents/skills/oat-agent-instructions-analyze/references/recommendation-pack-template.md` - new recommendation-pack
  template.
- `.agents/skills/oat-agent-instructions-analyze/SKILL.md` - linked the new templates in Step 8 and references.
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - carried recommendation ID and bundle-pack guidance into
  planning.
- `.agents/skills/oat-agent-instructions-apply/references/apply-plan-template.md` - added source bundle,
  recommendation ID, and bundle-pack fields.

**Verification:**

- Run: `pnpm format && pnpm lint`
- Result: pass

**Notes / Decisions:**

- The manifest stays intentionally small; dense recommendation detail belongs in the pack file.

---

## Phase 2: Add Verification Coverage

**Status:** completed
**Started:** 2026-03-20

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Added regression coverage for the new bundle contract so semantic bundle drift fails tests instead of surfacing only
  during manual runs.
- Tightened apply guidance so recommendation generation explicitly loads manifest entries and matching packs before
  using markdown review context.

**Key files touched:**

- `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts` - bundle-contract
  regression coverage for analyze/apply handoff semantics.
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - explicit bundle-first generation guidance for per-pack
  application.

**Verification:**

- Run: `pnpm test && pnpm lint && pnpm type-check && pnpm build`
- Result: pass

**Notes / Decisions:**

- The repo still has no runtime parser for analyze/apply bundles, so the correct verification surface is contract
  tests against skill docs/templates.

### Task p02-t01: Add regression fixtures for bundle fidelity

**Status:** completed
**Commit:** 0b5f78f1

**Outcome (required when completed):**

- Added a regression test that locks the bundle contract to the expected pack, manifest, and apply-plan metadata.
- Hardened the summary-template expectation so the test checks semantic bundle markers instead of formatter-specific
  markdown spacing.

**Files changed:**

- `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts` - new contract fixture
  coverage for recommendation packs, bundle manifests, summaries, and apply-plan metadata

**Verification:**

- Run: `pnpm test`
- Result: pass

**Notes / Decisions:**

- Contract tests assert semantic markers such as section headers and pack references so markdown formatting changes do
  not create false failures.

---

### Task p02-t02: Validate apply consumption end to end

**Status:** completed
**Commit:** 05cccdbf

**Outcome (required when completed):**

- Added contract coverage proving apply treats the bundle as the primary generation contract and blocks incomplete
  bundles from silently falling back to markdown-only behavior.
- Clarified apply Step 5 so each approved recommendation loads its manifest entry and matching pack before generation
  work begins.

**Files changed:**

- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - explicit per-recommendation pack loading during
  generation/update flow
- `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts` - end-to-end bundle-first
  consumption assertions for apply

**Verification:**

- Run: `pnpm test && pnpm type-check`
- Result: pass

**Notes / Decisions:**

- The bundle summary remains reviewer-facing context only; apply must not generate from it without first loading the
  manifest entry and matching pack.

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

### 2026-03-19

**Session Start:** 18:28 CT

- [ ] p01-t01: Define bundle schema and output layout - pending

**What changed (high level):**

- Quick-mode project scaffolded
- Discovery, lightweight design, and runnable plan drafted

**Decisions:**

- Use a manifest plus recommendation packs instead of one machine-readable monolith
- Keep analyze and apply as separate skills

**Follow-ups / TODO:**

- Confirm whether bundle artifacts should live beside the existing markdown analysis artifact or under a dedicated
  subdirectory

**Blockers:**

- None

**Session End:** 18:28 CT

---

### 2026-03-20

**Session Start:** 00:00 CT

- [x] p01-t01: Define bundle schema and output layout - 798cd649
- [x] p01-t02: Add recommendation-pack templates and validation guidance - c69a9ab2
- [x] p02-t01: Add regression fixtures for bundle fidelity - 0b5f78f1
- [x] p02-t02: Validate apply consumption end to end - 05cccdbf

**What changed (high level):**

- Confirmed final-only implementation checkpoint at `p02`
- Defined the bundle-aware analyze/apply contract and legacy fallback behavior
- Added bundle-contract regression tests and explicit apply-side pack loading guidance

**Decisions:**

- Use an adjacent `.bundle/` directory derived from the markdown artifact basename so apply can discover bundle files
  deterministically without new tracking keys

**Follow-ups / TODO:**

- Request final code review for the completed implementation before PR work.

**Blockers:**

- None

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

| Phase | Tests Run                                                                                              | Passed | Failed | Coverage |
| ----- | ------------------------------------------------------------------------------------------------------ | ------ | ------ | -------- |
| 1     | `pnpm format && pnpm lint`                                                                             | yes    | 0      | N/A      |
| 2     | `pnpm test`; `pnpm test && pnpm type-check`; `pnpm test && pnpm lint && pnpm type-check && pnpm build` | yes    | 0      | N/A      |

## Final Summary (for PR/docs)

**What shipped:**

- Added a two-layer analyze/apply handoff contract: reviewer-facing markdown analysis plus a companion bundle with
  summary, manifest, and recommendation packs.
- Added bundle contract regression coverage so missing pack metadata, broken pack references, or apply-side
  markdown-only regressions fail tests.
- Tightened apply guidance so per-recommendation generation explicitly loads manifest entries and matching packs before
  using repo evidence or templates.

**Behavioral changes (user-facing):**

- `oat-agent-instructions-analyze` now defines a concrete companion bundle layout and stable recommendation IDs for
  apply consumption.
- `oat-agent-instructions-apply` now treats the bundle as the executable contract and blocks incomplete bundles
  instead of silently falling back.

**Key files / modules:**

- `.agents/skills/oat-agent-instructions-analyze/SKILL.md` - bundle-aware analyze contract and output expectations
- `.agents/skills/oat-agent-instructions-analyze/references/analysis-artifact-template.md` - recommendation IDs and
  bundle pack mapping in the reviewer artifact
- `.agents/skills/oat-agent-instructions-analyze/references/bundle-summary-template.md` - compact bundle index for
  apply-time context
- `.agents/skills/oat-agent-instructions-analyze/references/recommendations-manifest-template.yaml` - machine-readable
  recommendation index
- `.agents/skills/oat-agent-instructions-analyze/references/recommendation-pack-template.md` - recommendation-scoped
  generation contract
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - bundle-first intake, planning, and generation rules
- `.agents/skills/oat-agent-instructions-apply/references/apply-plan-template.md` - bundle-addressable apply-plan
  fields
- `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts` - regression fixtures for
  bundle fidelity and apply consumption

**Verification performed:**

- `pnpm format`
- `pnpm lint`
- `pnpm test`
- `pnpm type-check`
- `pnpm build`

**Design deltas (if any):**

- No material design delta. The implementation stayed within the planned bundle contract and used contract tests as the
  verification surface because there is no runtime bundle parser yet.

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`
