# P04 Review Gate Analysis (`oat-project-subagent-implement`)

## Scope

File analyzed: `.agents/skills/oat-project-subagent-implement/SKILL.md`

Target sections:
- Step 4: Autonomous Review Gate
- Step 5: Fan-In Reconciliation
- Review Interaction Log template
- Hard constraints (`## Constraints`)

## Current State Observations

### Step 4 (Current)

Current location:
- `Step 4` starts around line 185.
- Defines a two-stage gate (`spec`, `quality`) and retry loop.
- Includes a generic verdict capture block with `verdict`, `retry_count`, and severity buckets.

Gaps against project requirements:
1. Reviewer dispatch mechanism is implicit; it does not require a dedicated peer `oat-reviewer` subagent.
2. No explicit review artifact path per unit (required: `reviews/{unit-id}-gate-review.md`).
3. Fix-loop dispatch is described generally but does not require re-dispatch of a reviewer after each fix pass.
4. No explicit in-memory verdict-map requirement as Step 5 source of truth.

### Step 5 (Current)

Current location:
- `Step 5` starts around line 222.
- Merge policy relies on "merge passing units" phrasing and conflict fallback.

Gaps against project requirements:
1. Missing hard pre-merge validation block that checks verdict-map presence.
2. Missing explicit refusal behavior for:
   - missing verdict entry -> `review_gate_missing`
   - non-pass verdict -> `review_gate_failed`
3. Lacks a strict statement that only `verdict == pass` may enter merge loop.

### Review Interaction Log Template (Current)

Current location:
- Template block under Step 6 (`Run {N}` log), around line 269.

Gaps against project requirements:
1. Unit outcomes table has no explicit `review_gate_executed: true|false` field.
2. No required field for review artifact path per unit.
3. No structured fix-loop iteration detail field (what findings were fixed vs persisted).
4. Reviewer dispatch method (peer subagent) is not recorded.

### Constraints Section (Current)

Current location:
- `## Constraints` around line 447.

Gaps against project requirements:
1. Existing rule blocks merge for units that did not pass, but it allows policy-based skip wording and does not enforce explicit reviewer verdict provenance.
2. Missing explicit requirement to always dispatch reviewer as a peer subagent (not nested, not inline).

## Required Text Changes (for next tasks)

### For p04-t02 (Step 4 hardening)

Add mandatory dispatch flow:
- Reviewer is dispatched as peer subagent type `oat-reviewer` targeting same unit worktree.
- Reviewer writes artifact at `reviews/{unit-id}-gate-review.md`.
- Orchestrator extracts verdict from artifact.
- On fail, dispatch fix subagent then re-dispatch reviewer.
- Retry up to configured limit, then exclude unit.
- Maintain verdict map keyed by `unit_id`.

### For p04-t03 (Step 5 hardening)

Insert HARD GATE pre-merge block before merge loop:
1. If no verdict entry -> disposition `skipped`, reason `review_gate_missing`, refuse merge.
2. If verdict != `pass` -> disposition `excluded`, reason `review_gate_failed`, refuse merge.
3. Only units with `verdict == pass` may merge.

### For p04-t04 (run-log schema)

Extend log schema to include per unit:
- reviewer dispatch method
- review artifact path
- fix-loop iteration summary
- `review_gate_executed: true|false`

### For p04-t05 (hard constraints)

Add explicit constraints:
- Never merge a unit without explicit reviewer pass verdict.
- Always dispatch reviewer as peer subagent (not nested/inline).

## Verification Checklist for P04

- Step 4 includes explicit peer reviewer dispatch + artifact path.
- Step 4 includes reviewer re-dispatch after each fix-loop iteration.
- Step 4 includes verdict map as source-of-truth.
- Step 5 includes hard pre-merge verdict checks with `review_gate_missing` and `review_gate_failed`.
- Run log template includes `review_gate_executed` and artifact path.
- Constraints include mandatory peer reviewer dispatch and merge prohibition without pass verdict.
