---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-06-03
oat_generated: false
oat_template: false
---

# Design: skill-automation-and-review

Lightweight (quick-mode) design covering four workstreams. The center of gravity is a single **bounded auto artifact-review loop** primitive shared by workstreams C and D.

## Overview

This project reduces dogfooding friction in the OAT skill lifecycle along three axes:

1. **Reach** — make more lifecycle skills natural-language invokable (offer-and-confirm, never silent), continuing the PR #71 pattern (A), backed by a CLI that resolves "the most recent review" so review skills can be triggered conversationally (B).
2. **Quality** — automatically subject machine-authored artifacts to an independent reviewer before they are consumed downstream: plans before implementation (C) and analysis artifacts before their `-apply` step (D).
3. **Consistency** — implement C and D on one shared loop primitive layered on the existing `oat-reviewer` agent and its established Tier 1/Tier 2 dispatch, so behavior, config, and bounds are identical across artifact types and can later extend to spec/design.

Confirmed design decisions (collaborative round):

- **Reviewer:** extend `oat-reviewer` — add a `plan` artifact scope and a new `analysis` review type. No new agent.
- **Loop policy:** bounded (reuse `oat_orchestration_retry_limit`, default 2) + config-gated, **default-on**, with a `workflow.*` opt-out.
- **Review discovery (B):** new CLI `oat review latest --json`.
- **Invocability set (A):** `review-provide`, `review-receive`, `discover` (gated), `progress`. **Exclude** `revise` this pass.

## Architecture

### System context

```
Authoring skill (plan-writing / docs-analyze / agent-instructions-analyze)
        │  writes artifact (plan.md | analysis artifact)
        ▼
[Shared Auto Artifact-Review Loop]  ◀── config: workflow.autoArtifactReview.* (default on)
        │  dispatch (Tier 1 subagent → Tier 2 inline fallback)
        ▼
   oat-reviewer  (mode: artifact:plan | analysis:<docs|agent-instructions>, oat_output_mode: structured)
        │  StructuredFindings
        ▼
   Loop controller (in the authoring skill)
        ├── apply/offer fixes to the artifact
        ├── re-dispatch until clean OR retry bound (oat_orchestration_retry_limit, default 2)
        └── record review row / surface residual findings to user
```

### Key components

| #   | Component                                                                    | Type                         | Workstream | Change                                                                                                               |
| --- | ---------------------------------------------------------------------------- | ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | `oat-reviewer` agent                                                         | agent def                    | C, D       | Add `plan` artifact scope + `analysis` review type (mode-aware checklist)                                            |
| 2   | Shared auto-review-loop contract                                             | skill prose (shared section) | C, D       | New canonical "Auto Artifact-Review Loop" procedure referenced by authoring skills                                   |
| 3   | `oat-project-plan-writing`                                                   | skill                        | C          | Anchor the loop after plan authoring; add `plan` row to `## Reviews` table convention                                |
| 4   | `oat-project-plan` / `-quick-start` / `-import-plan`                         | skills                       | C          | Invoke the shared loop at their plan-finalization step                                                               |
| 5   | `oat-docs-analyze` / `oat-agent-instructions-analyze`                        | skills                       | D          | Invoke the shared loop after writing the analysis artifact                                                           |
| 6   | `oat review latest` CLI                                                      | CLI command                  | B          | New command resolving most-recent review by `oat_generated_at`                                                       |
| 7   | `oat-project-review-receive` / `-review-provide` / `-discover` / `-progress` | skills                       | A          | Flip `disable-model-invocation`, #71-style description rewrite + gating                                              |
| 8   | Config schema                                                                | control-plane/cli            | C, D       | Add `workflow.autoArtifactReview` keys (default-on, per-target opt-out)                                              |
| 9   | `oat-project-quick-start` discovery completion                               | skill                        | E          | Call `complete-discovery` in the lightweight-design path so `discovery.md` reaches `complete` before plan generation |

### Data flow / control

- The **loop lives in the authoring skill**, not the reviewer — matching how `oat-project-implement` owns its review→fix loop while `oat-reviewer` stays stateless. The reviewer always returns `StructuredFindings`; the authoring skill decides apply-vs-offer, counts cycles, and writes the artifact/review row.
- **Bound source:** `oat_orchestration_retry_limit` (project `state.md`, range 0–5, default 2) — the same key implement already honors. No new bound key.
- **Gate source:** `workflow.autoArtifactReview` config (see Config below). Resolved before dispatch; when off, the authoring skill skips the loop and notes it.

## Component Design

### 1. `oat-reviewer` extension (C, D)

Add two review subjects to the existing mode-aware reviewer (it already branches on `type` and `oat_output_mode`):

- **`type: artifact`, scope `plan`** (C): review `plan.md` for canonical-format conformance (stable task IDs, required sections, review-table preservation), task atomicity/verifiability, coverage of design/discovery, and parallelism-claim sanity. For **import** projects, bias toward conformance + completeness, **not** rewriting imported intent (a dedicated note in the checklist).
- **`type: analysis`** (D), with a sub-kind (`docs` | `agent-instructions`): fact-check the severity-rated analysis artifact — verify each finding's evidence actually exists (cite file/line), severity is justified, recommendations are accurate and not hallucinated, and no contract checks were fabricated. This is an **accuracy** review, distinct from requirements-alignment.

Both honor `oat_output_mode: structured` (return `StructuredFindings`, write no file) so the calling loop controls the artifact. Reviewer `version:` bumps.

### 2. Shared "Auto Artifact-Review Loop" contract (C, D)

A single canonical procedure (authored once — likely a shared section in `oat-project-plan-writing` for C and referenced/duplicated minimally for D, final home decided in plan) specifying:

1. Resolve gate (`workflow.autoArtifactReview.<target>`); if off → skip + note.
2. Resolve bound (`oat_orchestration_retry_limit`, default 2).
3. Dispatch `oat-reviewer` (Tier 1 subagent; Tier 2 inline fallback per `oat-project-review-provide`) in structured mode for the artifact.
4. If findings at/above the actionable severity: apply fixes (default-on policy) or offer (when configured), re-write artifact, re-dispatch. Decrement bound.
5. On clean OR bound exhausted: record outcome (review row for plan; tracking metadata for analysis) and surface any residual findings to the user before handoff.

### 3–4. Plan-write integration (C)

- `oat-project-plan-writing`: document the loop as part of plan finalization and add the `plan` row to the `## Reviews` table rules (alongside existing `spec`/`design` artifact rows; preserve-never-delete still applies).
- `oat-project-plan`, `-quick-start`, `-import-plan`: at their existing "plan complete" step, invoke the shared loop before declaring `oat_ready_for: oat-project-implement`. Import mode passes the import-aware checklist flag.

### 5. Analyze integration (D)

- `oat-docs-analyze`, `oat-agent-instructions-analyze`: after writing the analysis artifact to `.oat/repo/analysis/`, run the shared loop with `type: analysis` and the matching sub-kind, then update analysis tracking metadata to mark the artifact verified before `-apply` consumes it.

### 6. `oat review latest` CLI (B)

- New command under `packages/cli/src/commands/` (new `review/` group or under an existing group — settle in plan).
- Behavior: scan project review dirs (`<project>/reviews/`, `<project>/reviews/archived/`) for the active/specified project, plus ad-hoc review locations used by `oat-review-provide`/`-receive`; parse `oat_generated_at` frontmatter; return the newest as `--json` (path, scope, generated_at, kind: project|adhoc).
- `oat-project-review-receive` calls it to resolve a target when triggered by natural language; replaces the duplicated inline `find`.

### 7. Invocability pass (A)

For `review-provide`, `review-receive`, `discover`, `progress`: set `disable-model-invocation: false`, rewrite `description:` to lead with explicit-ask triggers + a "do NOT auto-invoke" clause, and document the gating predicate inside the skill body:

- `discover` → require an active **spec-driven** project; otherwise decline + point to `oat-project-new`/`quick-start`.
- `review-provide` / `review-receive` → require an active project **or** a resolvable review (via the new CLI); always **offer** before acting.
- `progress` → no gate needed (read-only router); still offer/confirm before any routing action.

Each touched skill `version:` bumps.

### 8. Config schema (C, D)

Add `workflow.autoArtifactReview` to the config schema (control-plane + cli config), default-on, with per-target opt-out, e.g.:

```
workflow.autoArtifactReview.plan      = true   # C
workflow.autoArtifactReview.analysis  = true   # D
```

Resolution mirrors existing `workflow.*` keys (config → optional project override → default). Schema + `oat config` validation + docs updated.

### 9. Quick-start discovery completion (E)

`oat-project-quick-start` Step 2.75 (lightweight design) currently returns to Step 3 (plan generation) without ever completing discovery — Step 2.6, the only straight-to-plan step that calls `oat project complete-discovery`, is skipped on this path. Add a `complete-discovery "$PROJECT_PATH" --ready-for oat-project-quick-start` call at the end of the lightweight-design path so `discovery.md` reaches `oat_status: complete` before the plan is written, then commit it under the existing persist-before-pause rules. Verify `complete-discovery` accepts a design-path completion (it validates discovery and sets `oat_ready_for`; presence of `design.md` must not cause rejection).

## Testing Strategy

- **CLI (B):** unit tests for `oat review latest` — frontmatter parsing, `oat_generated_at` ordering (not mtime), project vs ad-hoc precedence, empty/no-review cases, `--json` shape. Follows existing `packages/cli/src/commands/**/__tests__` patterns.
- **Config (8):** schema validation tests for `workflow.autoArtifactReview.*` (defaults, opt-out, invalid values), mirroring existing `oat-config.test.ts`.
- **Skill contracts:** existing review-skill-contract / public-package-contract suites assert on changed skills — extend so flipped `disable-model-invocation` and new descriptions are covered; add a `plan` review-row expectation if the plan-writing contract is asserted.
- **Reviewer (1):** since it's an agent prose def, verification is by contract/asset assertions + a manual smoke (dispatch artifact:plan and analysis modes) documented in the plan's verification steps.
- **Loop behavior (2):** verified via skill-level smoke scenarios in the plan (gate-off skip, one fix cycle, bound-exhaustion residual surface) rather than unit tests, since the loop is skill-orchestrated.
- **Release gate:** `pnpm build && pnpm lint && pnpm format && pnpm type-check && pnpm test`, then `pnpm release:validate` with the five lockstep public-package bumps.

## Open Items Carried to Plan

- Final home for the shared loop contract (single shared section vs. per-skill references) — decide when writing tasks.
- Exact CLI command placement (new `review/` group vs. existing group).
- Whether `analysis` sub-kinds share one checklist with conditional sections or two short variants.
- Actionable-severity threshold for auto-apply in the loop (e.g. apply Important+, offer Minor).
