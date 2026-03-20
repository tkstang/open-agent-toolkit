---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-20
oat_current_task_id: p02-t02
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

| Phase   | Status      | Tasks | Completed |
| ------- | ----------- | ----- | --------- |
| Phase 1 | completed   | 2     | 2/2       |
| Phase 2 | in_progress | 2     | 1/2       |

**Total:** 3/4 tasks completed

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

**Status:** in_progress
**Started:** 2026-03-20

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

**Status:** pending
**Commit:** -

**Notes:**

- Confirm apply consumes the manifest and packs as its primary contract.

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
- [ ] p02-t02: Validate apply consumption end to end - pending

**What changed (high level):**

- Confirmed final-only implementation checkpoint at `p02`
- Defined the bundle-aware analyze/apply contract and legacy fallback behavior

**Decisions:**

- Use an adjacent `.bundle/` directory derived from the markdown artifact basename so apply can discover bundle files
  deterministically without new tracking keys

**Follow-ups / TODO:**

- Add fixture coverage proving pack fields survive into apply planning and generation.

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
