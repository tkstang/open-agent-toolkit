---
oat_status: complete
oat_ready_for: oat-project-implement
oat_last_updated: 2026-06-03
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p02']
oat_auto_review_at_hill_checkpoints: true
oat_plan_parallel_groups: [['p01', 'p02'], ['p03', 'p04']]
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
oat_template: false
---

# Implementation Plan: skill-automation-and-review

> Execute this plan using `oat-project-implement` — parallel groups declared (see Parallelism).

**Goal:** Reduce OAT lifecycle friction by (A) making more skills natural-language invokable, (B) adding a `find-latest-review` CLI, and (C/D) adding a shared bounded auto artifact-review loop that fact-checks plans and analysis artifacts before they are consumed.

**Architecture:** A single auto-review-loop primitive layered on the existing `oat-reviewer` agent (extended with `plan` + `analysis` review subjects) and its Tier 1/Tier 2 dispatch, gated by a new default-on `workflow.autoArtifactReview` config and bounded by the existing `oat_orchestration_retry_limit`. The loop is owned by authoring skills (plan-writing, analyze); the reviewer stays stateless.

**Tech Stack:** TypeScript ESM (packages/cli, packages/control-plane), oxlint/oxfmt, vitest, OAT skill/agent markdown under `.agents/`.

**Commit Convention:** `{type}({scope}): {description}` — e.g. `feat(p01-t02): add oat review latest command`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user (checkpoint after p02 — the core primitive; final review always gated)
- [x] Set `oat_plan_hill_phases` in frontmatter
- [x] Evaluated phases for parallelism opportunities
- [x] Set `oat_plan_parallel_groups` in frontmatter

---

## Parallelism

- **Group 1 — `['p01','p02']`:** P01 (config + CLI) writes only under `packages/cli` + `packages/control-plane`; P02 (reviewer agent + shared loop contract) writes only under `.agents/`. Disjoint write sets, independent verification (vitest vs. contract/asset assertions). Safe to run concurrently in isolated worktrees.
- **Group 2 — `['p03','p04']`:** P03 (plan-write wiring) touches `oat-project-plan-writing`, `-plan`, `-quick-start`, `-import-plan`; P04 (analyze wiring) touches `oat-docs-analyze`, `oat-agent-instructions-analyze`. Disjoint skill files. Both **read** the shared loop contract authored in P02 (no write conflict). Both depend on Group 1 completing, so they run as the second group.
- **P05 (invocability A)** depends on the P01 CLI (`review-receive` consumes `oat review latest`), so it runs sequentially after Group 2.
- **P06 (release + docs)** depends on everything; sequential last.

Groups run in order: Group 1 → Group 2 → p05 → p06.

---

## Phase 1: Foundations — config schema + review-discovery CLI

### Task p01-t01: Add `workflow.autoArtifactReview` config schema

**Files:**

- Modify: `packages/cli/src/config/oat-config.ts` (schema + defaults + getter support)
- Modify: `packages/control-plane/**` config types if the schema is shared there
- Modify: `packages/cli/src/config/oat-config.test.ts`

**Step 1: Write test (RED)** — assert `workflow.autoArtifactReview.plan` and `.analysis` default to `true`, accept boolean overrides, reject non-boolean, and resolve via `oat config get`.

Run: `pnpm --filter @open-agent-toolkit/cli exec vitest run src/config/oat-config.test.ts`
Expected: RED.

**Step 2: Implement (GREEN)** — add the nested `autoArtifactReview` keys to the `workflow` config schema with default-on, mirroring existing `workflow.*` resolution (config → project override → default).

Run: `pnpm --filter @open-agent-toolkit/cli exec vitest run src/config/oat-config.test.ts`
Expected: GREEN.

**Step 3: Refactor** — keep key naming consistent with existing `workflow.postImplementSequence` / `workflow.designMode`.

**Step 4: Verify** — `pnpm lint && pnpm type-check`

**Step 5: Commit** — `feat(p01-t01): add workflow.autoArtifactReview config keys`

---

### Task p01-t02: Implement `oat review latest` CLI command

**Files:**

- Create: `packages/cli/src/commands/review/index.ts` (command group + `latest` subcommand)
- Create: `packages/cli/src/commands/review/latest.ts` (resolver)
- Create: `packages/cli/src/commands/review/__tests__/latest.test.ts`
- Modify: `packages/cli/src/commands/index.ts` (register command)

**Step 1: Write test (RED)** — given fixture review dirs (`<project>/reviews/`, `<project>/reviews/archived/`, ad-hoc location), assert `latest` returns the newest by `oat_generated_at` frontmatter (NOT mtime), prefers a tie-break order, emits `--json` `{path, scope, generatedAt, kind}`, and handles the no-review case with a clean non-error empty result.

Run: `pnpm --filter @open-agent-toolkit/cli exec vitest run src/commands/review/__tests__/latest.test.ts`
Expected: RED.

**Step 2: Implement (GREEN)** — scan project + ad-hoc review locations, parse frontmatter `oat_generated_at`, sort descending, return newest. Reuse existing frontmatter-parsing util if present.

Run: same vitest command.
Expected: GREEN.

**Step 3: Refactor** — extract the scan/sort into a small exported helper so `review-receive` semantics and tests share one implementation.

**Step 4: Verify** — `pnpm lint && pnpm type-check` and `pnpm --filter @open-agent-toolkit/cli exec vitest run src/commands/review` (scoped to the new group).

**Step 5: Commit** — `feat(p01-t02): add oat review latest review-discovery command`

---

### Task p01-t03: Help/snapshot + command-registry coverage

**Files:**

- Modify: `packages/cli/src/commands/help-snapshots.test.ts` (and regenerate snapshots)
- Modify: `packages/cli/src/commands/commands.integration.test.ts` if it enumerates commands

**Step 1: Update test (RED)** — expect `review latest` to appear in help output / command registry.

Run: `pnpm --filter @open-agent-toolkit/cli exec vitest run src/commands/help-snapshots.test.ts`
Expected: RED (snapshot mismatch), then update snapshot intentionally.

**Step 2: Implement (GREEN)** — ensure help text + registration are correct; update snapshots.

Run: same.
Expected: GREEN.

**Step 4: Verify** — `pnpm lint && pnpm type-check`

**Step 5: Commit** — `test(p01-t03): cover oat review latest in help + registry`

---

## Phase 2: Core — reviewer extension + shared auto-review-loop contract

### Task p02-t01: Extend `oat-reviewer` with `plan` artifact scope

**Files:**

- Modify: `.agents/agents/oat-reviewer.md` (Inputs + checklist + version bump)

**Step 1: Author (spec)** — Add `plan` to the `type: artifact` scope list. Author a plan-review checklist: canonical-format conformance (stable `pNN-tNN` IDs, required sections, review-table preserve-never-delete), task atomicity/verifiability, coverage of design/discovery, parallelism-claim sanity. Add an **import-mode note**: bias to conformance + completeness, do not rewrite imported intent.

**Step 2: Self-check** — Re-read the agent file; confirm `plan` is handled symmetrically in artifact mode and structured-output mode. Bump `version:`.

**Step 3: Verify** — `pnpm lint` (markdown) + reviewer/contract suite: `pnpm test -- review`.

**Step 4: Commit** — `feat(p02-t01): add plan artifact scope to oat-reviewer`

---

### Task p02-t02: Extend `oat-reviewer` with `analysis` review type

**Files:**

- Modify: `.agents/agents/oat-reviewer.md` (new `type: analysis` with `docs` / `agent-instructions` sub-kinds + version bump)

**Step 1: Author (spec)** — Add a `type: analysis` mode whose job is **accuracy** fact-checking of a severity-rated analysis artifact: each finding's evidence must exist (cite file/line), severity must be justified, recommendations must be accurate (no hallucinated contract checks). Document the two sub-kinds and what each may consult (docs contract vs. instruction files). Always honors `oat_output_mode: structured`.

**Step 2: Self-check** — Confirm the new mode does not regress existing `code`/`artifact` branches. Bump `version:` (a second bump on this file this branch — both land per the per-content-release convention).

**Step 3: Verify** — `pnpm lint` + reviewer contract tests.

**Step 4: Commit** — `feat(p02-t02): add analysis review type to oat-reviewer`

---

### Task p02-t03: Author the shared "Auto Artifact-Review Loop" contract

**Files:**

- Modify: `.agents/skills/oat-project-plan-writing/SKILL.md` (canonical loop section + `plan` review-row rule + version bump)

**Step 1: Author (spec)** — Write the canonical procedure (the single source the other skills reference): (1) resolve `workflow.autoArtifactReview.<target>` gate → skip+note if off; (2) resolve bound `oat_orchestration_retry_limit` (default 2); (3) dispatch `oat-reviewer` (Tier 1 subagent → Tier 2 inline fallback) in structured mode; (4) apply (default) or offer fixes ≥ actionable severity, re-write, re-dispatch, decrement bound; (5) on clean or bound-exhausted, record outcome + surface residual findings before handoff. Define the actionable-severity threshold (apply Important+, offer Minor).

**Step 2: Author (spec)** — Add the `plan` artifact row to the Reviews table rules alongside `spec`/`design`; reaffirm preserve-never-delete.

**Step 3: Verify** — Validate against `create-oat-skill` conventions (step indicators match, required sections present). Bump `version:`. Run plan-writing contract test if present.

**Step 4: Commit** — `feat(p02-t03): add shared auto artifact-review loop contract`

---

## Phase 3: Wire C — plan-write integration (all three plan paths)

### Task p03-t01: Invoke loop from `oat-project-plan` (spec-driven)

**Files:** Modify `.agents/skills/oat-project-plan/SKILL.md` — call the shared loop at plan-finalize, before setting `oat_ready_for: oat-project-implement`; record the `plan` review row. Bump `version:`.

**Step 1: Author** the new finalization step with matching step-indicator updates.
**Step 2: Verify** — convention check + contract test; document a manual smoke in implementation.md.
**Step 3: Commit** — `feat(p03-t01): run auto plan-review loop in oat-project-plan`

---

### Task p03-t02: Invoke loop from `oat-project-quick-start`

**Files:** Modify `.agents/skills/oat-project-quick-start/SKILL.md` — add a step between plan generation (Step 3) and state sync, updating ALL step indicators to match. Bump `version:`.

**Step 1: Author** the new step + renumber indicators.
**Step 2: Verify** — step indicators match actual steps; contract test.
**Step 3: Commit** — `feat(p03-t02): run auto plan-review loop in quick-start`

---

### Task p03-t03: Invoke loop from `oat-project-import-plan` (import-aware)

**Files:** Modify `.agents/skills/oat-project-import-plan/SKILL.md` — call the loop with the import-aware checklist flag. Bump `version:`.

**Step 1: Author** the step; confirm the import note routes reviewer to conformance/completeness, not intent rewrite.
**Step 2: Verify** — convention check.
**Step 3: Commit** — `feat(p03-t03): run import-aware plan-review loop in import-plan`

---

### Task p03-t04: Fix quick-start lightweight-design discovery-completion gap

**Files:** Modify `.agents/skills/oat-project-quick-start/SKILL.md` — close the gap where the lightweight-design path leaves `discovery.md` `in_progress` while the plan is `complete`. Bump `version:`.

**Context:** Step 2.6 (straight-to-plan) is the only quick path that calls `oat project complete-discovery`, and it is explicitly skipped when "Lightweight design first" is chosen (`SKILL.md:210`). So the design path never marks discovery complete — surfaced as finding `M1` in this project's own plan review.

**Step 1: Author** — In the lightweight-design path (Step 2.75, after design is captured and before Step 3 plan generation), call `oat project complete-discovery "$PROJECT_PATH" --ready-for oat-project-quick-start` so `discovery.md` reaches `oat_status: complete`. Update step indicators if the step count changes; commit the completed discovery artifact per the existing persist-before-pause rules.

**Step 2: Verify** — convention check (step indicators match actual steps); confirm `complete-discovery` accepts a design-path completion (does not reject when `design.md` exists); manually confirm a lightweight-design quick-start run leaves discovery `complete`.

**Step 3: Commit** — `fix(p03-t04): complete discovery in quick-start lightweight-design path`

---

## Phase 4: Wire D — analyze integration

### Task p04-t01: Invoke loop from `oat-docs-analyze`

**Files:** Modify `.agents/skills/oat-docs-analyze/SKILL.md` — after artifact write, run the loop `type: analysis` sub-kind `docs`; mark artifact verified in tracking before apply. Bump `version:`.

**Step 1: Author** the step (mode assertion still forbids editing docs — the loop edits the analysis artifact, not docs).
**Step 2: Verify** — step indicators match; contract test.
**Step 3: Commit** — `feat(p04-t01): add accuracy review loop to docs-analyze`

---

### Task p04-t02: Invoke loop from `oat-agent-instructions-analyze`

**Files:** Modify `.agents/skills/oat-agent-instructions-analyze/SKILL.md` — run the loop `type: analysis` sub-kind `agent-instructions`; mark verified. Bump `version:`.

**Step 1: Author** the step.
**Step 2: Verify** — step indicators + contract test.
**Step 3: Commit** — `feat(p04-t02): add accuracy review loop to agent-instructions-analyze`

---

## Phase 5: Wire A — model-invocability pass

### Task p05-t01: Flip `oat-project-review-provide`

**Files:** Modify `.agents/skills/oat-project-review-provide/SKILL.md`: `disable-model-invocation: false`, #71-style description (explicit-ask trigger "review project" + "do NOT auto-invoke" clause), document gating (active project OR resolvable review; always offer). Bump `version:`.
**Commit:** `feat(p05-t01): make review-provide model-invokable with gating`

### Task p05-t02: Flip `oat-project-review-receive` + CLI target resolution

**Files:** Modify `.agents/skills/oat-project-review-receive/SKILL.md`: flip + description ("receive review"/"process review" + do-NOT clause), replace inline `find` with `oat review latest` to resolve project **or** ad-hoc target, document gating + offer. Bump `version:`.
**Step 1: Author** changes; confirm the CLI call + a fallback when the CLI is unavailable.
**Commit:** `feat(p05-t02): make review-receive model-invokable, use review-latest CLI`

### Task p05-t03: Flip `oat-project-discover` (gated)

**Files:** Modify `.agents/skills/oat-project-discover/SKILL.md`: flip + description, gate on **active spec-driven project**; decline + route to new/quick-start otherwise. Bump `version:`.
**Commit:** `feat(p05-t03): make discover model-invokable gated on active spec-driven project`

### Task p05-t04: Flip `oat-project-progress`

**Files:** Modify `.agents/skills/oat-project-progress/SKILL.md`: flip + description ("check progress"/"what's next" + do-NOT clause); no gate (read-only router) but still offer before routing. Bump `version:`.
**Commit:** `feat(p05-t04): make progress router model-invokable`

### Task p05-t05: Update skill-contract tests for flipped invocation

**Files:** Modify the review-skill-contract / public-package-contract test(s) asserting `disable-model-invocation` + descriptions for the four flipped skills.

**Step 1: Update test (RED)** — expect the four skills invokable with the new description shape.
Run: `pnpm test -- contract`
Expected: RED then GREEN after assertions updated.
**Commit:** `test(p05-t05): assert invocability + descriptions for flipped skills`

---

## Phase 6: Release, docs, and definition-of-done

### Task p06-t01: Documentation updates

**Files:** Modify `apps/oat-docs/docs/**` (config keys `workflow.autoArtifactReview`, `oat review latest`, auto-review behavior for plans/analysis, invocability changes); run `oat docs generate-index`.
**Verify:** `pnpm build:docs`. **Commit:** `docs(p06-t01): document auto-review loop, review-latest CLI, invocability`

### Task p06-t02: Lockstep public-package version bump

**Files:** Modify `packages/cli/package.json`, `packages/control-plane/package.json`, `packages/docs-config/package.json`, `packages/docs-theme/package.json`, `packages/docs-transforms/package.json`, and `packages/cli/assets/public-package-versions.json`. Bump all five together (one step).
**Verify:** `pnpm release:validate`. **Commit:** `chore(p06-t02): lockstep public-package version bump`

### Task p06-t03: Full definition-of-done gate

**Step 1: Verify** — `pnpm build && pnpm lint && pnpm format && pnpm type-check && pnpm test` then `pnpm release:validate`; `git diff --check` clean.
**Step 2: Commit** — `chore(p06-t03): finalize DoD for skill-automation-and-review` (only if residual formatting/asset regen).

---

## Reviews

| Scope  | Type     | Status  | Date       | Artifact                                            |
| ------ | -------- | ------- | ---------- | --------------------------------------------------- |
| p01    | code     | passed  | 2026-06-03 | reviews/p01-code-review-2026-06-03.md               |
| p02    | code     | passed  | 2026-06-03 | reviews/p02-code-review-2026-06-03.md               |
| p03    | code     | pending | -          | -                                                   |
| p04    | code     | pending | -          | -                                                   |
| p05    | code     | pending | -          | -                                                   |
| p06    | code     | pending | -          | -                                                   |
| final  | code     | pending | -          | -                                                   |
| spec   | artifact | pending | -          | -                                                   |
| design | artifact | pending | -          | -                                                   |
| plan   | artifact | passed  | 2026-06-03 | reviews/archived/artifact-plan-review-2026-06-03.md |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

---

## Implementation Complete

**Summary:**

- Phase 1: 3 tasks — config schema + `oat review latest` CLI (+ help coverage)
- Phase 2: 3 tasks — reviewer `plan` + `analysis` modes + shared loop contract
- Phase 3: 4 tasks — wire plan-review loop into all three plan paths + fix quick-start discovery-completion gap
- Phase 4: 2 tasks — wire accuracy review loop into both analyze skills
- Phase 5: 5 tasks — model-invocability pass (4 skills + contract tests)
- Phase 6: 3 tasks — docs, lockstep bump, DoD

**Total: 20 tasks**

Ready for code review and merge.

---

## References

- Design: `design.md`
- Discovery: `discovery.md`
- Prior art: PR #71 (end-of-lifecycle model-invocability)
