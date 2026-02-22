---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-21
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ["p05"]
oat_plan_source: imported
oat_import_reference: references/imported-plan.md
oat_import_source_path: /Users/thomas.stang/Code/open-agent-toolkit/external-plans/b09-review-workflow-hardening.md
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: Review Workflow Hardening (B09 + Review Gates)

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add missing review-receive workflows (local + GitHub PR) and enforce autonomous review gates before subagent merges.

**Architecture:** Introduce three new receive skills that normalize findings to a common format, then harden `oat-project-subagent-implement` so merge decisions require explicit reviewer-pass verdicts.

**Tech Stack:** Markdown skill specs, OAT CLI skill installers, workspace tests (`pnpm`, Biome, Vitest).

**Commit Convention:** `{type}({scope}): {description}` - e.g., `feat(p01-t01): add local review receive skill`

## Planning Checklist

- [x] Imported source preserved at `references/imported-plan.md`
- [x] Canonical `pNN-tNN` task IDs generated
- [ ] Confirm HiLL checkpoints before implementation

---

## Phase 1: `oat-review-receive` (Ad-hoc Local Review Receive)

### Task p01-t01: Capture local receive constraints from existing patterns

**Files:**
- Read: `.agents/skills/oat-project-review-receive/SKILL.md`
- Read: `.agents/skills/oat-review-provide/SKILL.md`
- Read: `.agents/skills/create-oat-skill/references/oat-skill-template.md`
- Create: `.oat/projects/shared/b09-review-workflow-hardening/references/p01-local-receive-constraints.md`

**Step 1: Write test (RED)**

Run: `TODO: define a checklist for required sections (mode assertion, progress banner, success criteria)`
Expected: Checklist is incomplete before analysis notes are written.

**Step 2: Implement (GREEN)**

Document concrete constraints and reusable phrasing for local receive skill behavior in `references/p01-local-receive-constraints.md`.

**Step 3: Refactor**

Condense duplicated notes into a single ordered checklist that can be applied while authoring `oat-review-receive`.

**Step 4: Verify**

Run: `rg -n "Mode Assertion|Progress|Success Criteria" .oat/projects/shared/b09-review-workflow-hardening/references/p01-local-receive-constraints.md`
Expected: Required sections are explicitly captured.

**Step 5: Commit**

```bash
git add .oat/projects/shared/b09-review-workflow-hardening/references/p01-local-receive-constraints.md
git commit -m "chore(p01-t01): capture local receive constraints"
```

---

### Task p01-t02: Create `.agents/skills/oat-review-receive/SKILL.md`

**Files:**
- Create: `.agents/skills/oat-review-receive/SKILL.md`

**Step 1: Write test (RED)**

Run: `TODO: add a validation command/assertion for required frontmatter keys and numbered process steps`
Expected: Validation would fail before `SKILL.md` is authored.

**Step 2: Implement (GREEN)**

Author the local receive skill with:
- required frontmatter (`disable-model-invocation: true`, `user-invocable: true`, allowed tools list)
- `OAT ▸ REVIEW RECEIVE` progress banner and `[1/4]..[4/4]` step indicators
- local artifact discovery and parsing into the common 4-tier findings format
- interactive triage flow (`convert`, `defer`, `dismiss`)
- standalone markdown task-list output

**Step 3: Refactor**

Align wording and section order with the OAT skill template and remove ambiguous triage guidance.

**Step 4: Verify**

Run: `pnpm oat:validate-skills`
Expected: No validation errors for `oat-review-receive`.

**Step 5: Commit**

```bash
git add .agents/skills/oat-review-receive/SKILL.md
git commit -m "feat(p01-t02): add local review receive skill"
```

---

### Task p01-t03: Validate local receive skill conventions and size budget

**Files:**
- Modify: `.agents/skills/oat-review-receive/SKILL.md` (if fixes are needed)

**Step 1: Write test (RED)**

Run: `TODO: record explicit convention checks (mode assertion, progress indicators, success criteria, <=500 lines)`
Expected: One or more checks may fail before cleanup.

**Step 2: Implement (GREEN)**

Apply targeted fixes for convention gaps found during validation.

**Step 3: Refactor**

Trim repetitive examples to keep the skill concise without losing required guardrails.

**Step 4: Verify**

Run: `wc -l .agents/skills/oat-review-receive/SKILL.md && pnpm oat:validate-skills`
Expected: Line count remains within budget and validation passes.

**Step 5: Commit**

```bash
git add .agents/skills/oat-review-receive/SKILL.md
git commit -m "chore(p01-t03): validate local receive skill conventions"
```

---

## Phase 2: `oat-review-receive-remote` (Ad-hoc Remote Review Receive)

### Task p02-t01: Create `.agents/skills/oat-review-receive-remote/SKILL.md`

**Files:**
- Create: `.agents/skills/oat-review-receive-remote/SKILL.md`

**Step 1: Write test (RED)**

Run: `TODO: define checks for PR resolution flow, agent-reviews command usage, triage, and optional reply behavior`
Expected: Checks fail until remote intake steps are documented.

**Step 2: Implement (GREEN)**

Author remote receive skill with:
- PR resolution (`--pr` or auto-detect)
- `npx agent-reviews --json --unresolved --pr <N>` fetch flow
- severity classification and normalization into common findings format
- triage + standalone task list output
- optional PR reply workflow via `agent-reviews --reply`
- troubleshooting guidance for auth/network/no-comments cases

**Step 3: Refactor**

Ensure severity guidance is consistent with local receive skill and remove duplicate parser descriptions.

**Step 4: Verify**

Run: `pnpm oat:validate-skills`
Expected: `oat-review-receive-remote` passes skill validation.

**Step 5: Commit**

```bash
git add .agents/skills/oat-review-receive-remote/SKILL.md
git commit -m "feat(p02-t01): add remote review receive skill"
```

---

## Phase 3: `oat-project-review-receive-remote` (Project-Scoped Remote Receive)

### Task p03-t01: Create `.agents/skills/oat-project-review-receive-remote/SKILL.md`

**Files:**
- Create: `.agents/skills/oat-project-review-receive-remote/SKILL.md`

**Step 1: Write test (RED)**

Run: `TODO: define checks for project resolution, plan task creation, Reviews table updates, implementation pointer updates, and cycle limit`
Expected: Checks fail before project-scoped remote workflow is fully documented.

**Step 2: Implement (GREEN)**

Author project-scoped remote receive skill with:
- active project resolution
- remote PR intake/classification flow
- findings overview + interactive triage
- review-fix task creation with next `pNN-tNN` IDs
- `plan.md` updates (Reviews row + totals)
- `implementation.md` updates (new fix tasks + pointer)
- 3-cycle review limit and next-action routing

**Step 3: Refactor**

Align task-conversion language with `oat-project-review-receive` to keep behavior deterministic.

**Step 4: Verify**

Run: `pnpm oat:validate-skills`
Expected: `oat-project-review-receive-remote` passes validation and section ordering checks.

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-review-receive-remote/SKILL.md
git commit -m "feat(p03-t01): add project remote review receive skill"
```

---

## Phase 4: Harden `oat-project-subagent-implement` Review Gate

### Task p04-t01: Inspect current Step 4 and Step 5 behavior

**Files:**
- Read: `.agents/skills/oat-project-subagent-implement/SKILL.md`
- Create: `.oat/projects/shared/b09-review-workflow-hardening/references/p04-review-gate-analysis.md`

**Step 1: Write test (RED)**

Run: `TODO: define explicit acceptance criteria for required review-gate enforcement points`
Expected: Criteria document is missing before analysis is written.

**Step 2: Implement (GREEN)**

Capture exact sections and gaps for Step 4 (review dispatch) and Step 5 (merge preconditions).

**Step 3: Refactor**

Map each gap to one required text change to avoid overlap and drift.

**Step 4: Verify**

Run: `rg -n "Step 4|Step 5|review gate|merge" .oat/projects/shared/b09-review-workflow-hardening/references/p04-review-gate-analysis.md`
Expected: Analysis references each required gate area.

**Step 5: Commit**

```bash
git add .oat/projects/shared/b09-review-workflow-hardening/references/p04-review-gate-analysis.md
git commit -m "chore(p04-t01): capture review gate hardening analysis"
```

---

### Task p04-t02: Add explicit reviewer peer-subagent dispatch + fix loop to Step 4

**Files:**
- Modify: `.agents/skills/oat-project-subagent-implement/SKILL.md`

**Step 1: Write test (RED)**

Run: `TODO: define assertions that Step 4 includes reviewer dispatch, artifact path, retry loop, and verdict map`
Expected: Assertions fail before Step 4 is expanded.

**Step 2: Implement (GREEN)**

Update Step 4 with:
- reviewer dispatched as peer subagent (`oat-reviewer`) in same worktree
- gate artifact output path (`reviews/{unit-id}-gate-review.md`)
- fix-loop orchestration and retry limit handling
- in-memory verdict map structure per unit

**Step 3: Refactor**

Simplify wording so gate state transitions are unambiguous (`pass`, `fail`, retry exhausted).

**Step 4: Verify**

Run: `rg -n "peer subagent|gate-review|retry|verdict map" .agents/skills/oat-project-subagent-implement/SKILL.md`
Expected: All Step 4 enforcement terms are present.

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-subagent-implement/SKILL.md
git commit -m "feat(p04-t02): enforce reviewer dispatch and fix loop"
```

---

### Task p04-t03: Add hard pre-merge verdict checks to Step 5

**Files:**
- Modify: `.agents/skills/oat-project-subagent-implement/SKILL.md`

**Step 1: Write test (RED)**

Run: `TODO: define assertions that merge is blocked when verdict is missing or non-pass`
Expected: Assertions fail until Step 5 hard gate text is present.

**Step 2: Implement (GREEN)**

Add pre-merge validation that:
- refuses merge when no verdict entry exists (`review_gate_missing`)
- refuses merge when verdict is not `pass` (`review_gate_failed`)
- merges only units with explicit pass verdict

**Step 3: Refactor**

Keep preconditions centralized in one ordered block before merge loop execution.

**Step 4: Verify**

Run: `rg -n "review_gate_missing|review_gate_failed|Only units with verdict == pass" .agents/skills/oat-project-subagent-implement/SKILL.md`
Expected: Step 5 hard-gate checks are present and specific.

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-subagent-implement/SKILL.md
git commit -m "feat(p04-t03): add hard pre-merge review gate checks"
```

---

### Task p04-t04: Extend orchestration run log schema for gate evidence

**Files:**
- Modify: `.agents/skills/oat-project-subagent-implement/SKILL.md`

**Step 1: Write test (RED)**

Run: `TODO: define assertions for required log fields (dispatch method, artifact path, fix-loop details, review_gate_executed)`
Expected: Assertions fail before schema updates are added.

**Step 2: Implement (GREEN)**

Update Review Interaction Log template with explicit gate-evidence fields for each unit.

**Step 3: Refactor**

Ensure log field names are consistent with verdict-map terminology.

**Step 4: Verify**

Run: `rg -n "review_gate_executed|artifact path|fix-loop" .agents/skills/oat-project-subagent-implement/SKILL.md`
Expected: New log fields are visible in the run log template section.

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-subagent-implement/SKILL.md
git commit -m "chore(p04-t04): expand review gate run logging"
```

---

### Task p04-t05: Add non-negotiable review-gate hard constraints

**Files:**
- Modify: `.agents/skills/oat-project-subagent-implement/SKILL.md`

**Step 1: Write test (RED)**

Run: `TODO: define assertions for two new hard constraints (no merge without pass, reviewer must be peer subagent)`
Expected: Assertions fail before constraints are documented.

**Step 2: Implement (GREEN)**

Add hard constraints that forbid merging without explicit reviewer pass and require reviewer peer-subagent dispatch.

**Step 3: Refactor**

Place constraints next to existing non-negotiable orchestration rules for visibility.

**Step 4: Verify**

Run: `rg -n "Never merge a unit without an explicit pass verdict|Always dispatch reviewer as a peer subagent" .agents/skills/oat-project-subagent-implement/SKILL.md`
Expected: Both constraints exist verbatim.

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-subagent-implement/SKILL.md
git commit -m "chore(p04-t05): codify review gate hard constraints"
```

---

## Phase 5: Registration, Sync, and Verification

### Task p05-t01: Register new skills in CLI install/bundle surfaces

**Files:**
- Modify: `packages/cli/scripts/bundle-assets.sh`
- Modify: `packages/cli/src/commands/init/tools/utility/install-utility.ts`
- Modify: `packages/cli/src/commands/init/tools/workflows/install-workflows.ts`
- Modify: `packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts`
- Modify: `packages/cli/src/commands/init/tools/utility/index.test.ts`

**Step 1: Write test (RED)**

Run: `pnpm test packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts packages/cli/src/commands/init/tools/utility/index.test.ts`
Expected: Tests fail before new skills and count assertions are updated.

**Step 2: Implement (GREEN)**

Add the three new skill identifiers to the correct lists and update hardcoded test expectations (`toHaveLength(21)` and expected utility skills arrays).

**Step 3: Refactor**

Re-sort arrays where required so list ordering remains deterministic and alphabetized by existing convention.

**Step 4: Verify**

Run: `pnpm test packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts packages/cli/src/commands/init/tools/utility/index.test.ts`
Expected: Updated install/bundle tests pass.

**Step 5: Commit**

```bash
git add packages/cli/scripts/bundle-assets.sh packages/cli/src/commands/init/tools/utility/install-utility.ts packages/cli/src/commands/init/tools/workflows/install-workflows.ts packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts packages/cli/src/commands/init/tools/utility/index.test.ts
git commit -m "feat(p05-t01): register review receive skills in cli installers"
```

---

### Task p05-t02: Run skill sync and validation

**Files:**
- Modify: provider-linked skill views (generated by `oat sync --apply`)

**Step 1: Write test (RED)**

Run: `pnpm oat:validate-skills`
Expected: Validation may fail until all new/modified skills satisfy conventions.

**Step 2: Implement (GREEN)**

Run `oat sync --apply`, then fix any resulting validation issues in modified skill files.

**Step 3: Refactor**

Reconcile repeated wording across related skills to keep findings and severity terminology consistent.

**Step 4: Verify**

Run: `oat sync --apply && pnpm oat:validate-skills`
Expected: Sync succeeds and validation passes.

**Step 5: Commit**

```bash
git add .agents .claude .cursor .github .vscode
git commit -m "chore(p05-t02): sync provider views and validate new review skills"
```

---

### Task p05-t03: Build and run workspace tests

**Files:**
- Modify: files required to fix any regressions discovered by build/test

**Step 1: Write test (RED)**

Run: `pnpm build && pnpm test`
Expected: Any regressions from skill registration or docs changes are surfaced.

**Step 2: Implement (GREEN)**

Apply fixes required to restore clean build/test outcomes.

**Step 3: Refactor**

Minimize incidental diffs while preserving behavior and test determinism.

**Step 4: Verify**

Run: `pnpm build && pnpm test`
Expected: Build and tests pass workspace-wide.

**Step 5: Commit**

```bash
git add -A
git commit -m "fix(p05-t03): resolve build and test regressions"
```

---

### Task p05-t04: Perform manual verification checklist

**Files:**
- Modify: `.oat/projects/shared/b09-review-workflow-hardening/implementation.md` (verification notes)

**Step 1: Write test (RED)**

Run: `TODO: define manual verification checklist for skill visibility, gate wording, and content budgets`
Expected: Checklist is incomplete before verification notes are recorded.

**Step 2: Implement (GREEN)**

Manually verify:
- new skills appear in provider views after sync
- `oat-project-subagent-implement` includes hardened gate behavior
- each new skill has required sections and remains under size budget

**Step 3: Refactor**

Convert ad-hoc notes into a single concise checklist in `implementation.md`.

**Step 4: Verify**

Run: `rg -n "oat-review-receive|oat-review-receive-remote|oat-project-review-receive-remote|review_gate_executed" .agents .oat/projects/shared/b09-review-workflow-hardening/implementation.md`
Expected: Verification evidence is discoverable in artifacts.

**Step 5: Commit**

```bash
git add .oat/projects/shared/b09-review-workflow-hardening/implementation.md
git commit -m "chore(p05-t04): record manual verification outcomes"
```

---

## Reviews

Track review status for this imported plan. Do not delete existing rows.

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| p03 | code | pending | - | - |
| p04 | code | pending | - | - |
| p05 | code | pending | - | - |
| final | code | passed | 2026-02-21 | reviews/final-review-2026-02-21.md |
| spec | artifact | pending | - | - |
| design | artifact | pending | - | - |

**Status values:** `pending` -> `received` -> `fixes_added` -> `fixes_completed` -> `passed`

---

## Implementation Complete

**Summary:**
- Phase 1: 3 tasks - local ad-hoc receive foundation and validation
- Phase 2: 1 task - ad-hoc remote receive skill
- Phase 3: 1 task - project-scoped remote receive skill
- Phase 4: 5 tasks - review-gate hardening in subagent orchestration
- Phase 5: 4 tasks - registration, sync, and verification

**Total: 14 tasks**

Ready for implementation execution.

---

## References

- Imported Source: `references/imported-plan.md`
- Project State: `state.md`
- Implementation Log: `implementation.md`
- Key Existing Skills:
  - `.agents/skills/oat-project-review-receive/SKILL.md`
  - `.agents/skills/oat-review-provide/SKILL.md`
  - `.agents/skills/oat-project-subagent-implement/SKILL.md`
