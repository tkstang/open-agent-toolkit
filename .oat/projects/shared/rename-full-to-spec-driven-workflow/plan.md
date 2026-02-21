---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-21
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: Rename Full Workflow To Spec-Driven

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Replace the long workflow mode/lane term `full` with `spec-driven` across OAT runtime contracts and user-facing workflow surfaces.

**Architecture:** Single-contract rename that updates canonical metadata values, CLI mode parsing/scaffolding, skill contracts, and documentation in one atomic rollout.

**Tech Stack:** TypeScript ESM, pnpm workspaces, markdown-based skill/docs artifacts

**Commit Convention:** `{type}({scope}): {description}` - e.g., `refactor(p01-t01): rename workflow mode to spec-driven`

## Planning Checklist

- [x] Confirmed quick-mode plan source and no import reference
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Canonical Workflow Contract Rename

### Task p01-t01: Rename mode literals in templates and CLI runtime

**Files:**
- Modify: `.oat/templates/state.md`
- Modify: `.oat/templates/plan.md`
- Modify: `packages/cli/assets/templates/state.md`
- Modify: `packages/cli/assets/templates/plan.md`
- Modify: `packages/cli/src/commands/project/new/scaffold.ts`
- Modify: `packages/cli/src/commands/project/new/index.ts`
- Modify: `packages/cli/src/commands/state/generate.ts`
- Modify: `packages/cli/src/commands/cleanup/project/project.ts`

**Step 1: Write test (RED)**

Update CLI unit tests/snapshots to expect `spec-driven` mode values before code changes.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/new/index.test.ts packages/cli/src/commands/project/new/scaffold.test.ts packages/cli/src/commands/state/generate.test.ts`
Expected: Failing assertions referencing legacy `full` mode

**Step 2: Implement (GREEN)**

- Replace canonical workflow mode from `full` to `spec-driven` in templates and CLI defaults.
- Update mode enum/choices to `spec-driven | quick | import`.
- Update state routing keys and mode rendering logic for the renamed contract.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/new/index.test.ts packages/cli/src/commands/project/new/scaffold.test.ts packages/cli/src/commands/state/generate.test.ts`
Expected: Tests pass with `spec-driven`

**Step 3: Refactor**

Run a targeted search to ensure no workflow-mode literals remain incorrectly set to `full`.

Run: `rg -n "oat_workflow_mode:\s*full|oat_plan_source:\s*full|--mode full|\bfull mode\b" packages/cli .oat/templates`
Expected: No workflow-mode contract hits

**Step 4: Verify**

Run: `pnpm --filter @oat/cli type-check`
Expected: No type errors

**Step 5: Commit**

```bash
git add .oat/templates packages/cli/assets/templates packages/cli/src/commands
git commit -m "refactor(p01-t01): rename workflow mode contract to spec-driven"
```

---

### Task p01-t02: Rename promote skill and workflow registry references

**Files:**
- Rename: `.agents/skills/oat-project-promote-full/` -> `.agents/skills/oat-project-promote-spec-driven/`
- Modify: `.agents/skills/oat-project-promote-spec-driven/SKILL.md`
- Modify: `packages/cli/scripts/bundle-assets.sh`
- Modify: `packages/cli/src/commands/init/tools/workflows/install-workflows.ts`
- Modify: `packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts`
- Modify: `docs/oat/skills/index.md`

**Step 1: Write test (RED)**

Update workflow install tests to expect the new skill id.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts`
Expected: Fails until registry and skill rename are applied

**Step 2: Implement (GREEN)**

- Rename skill folder/id and replace internal references to Spec-Driven naming.
- Update workflow install/bundle references to new skill id.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts`
Expected: Test passes

**Step 3: Refactor**

Check for stale promote-full references.

Run: `rg -n "oat-project-promote-full" .agents docs packages/cli`
Expected: No hits

**Step 4: Verify**

Run: `pnpm --filter @oat/cli type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add .agents/skills packages/cli docs/oat/skills/index.md
git commit -m "refactor(p01-t02): rename promote skill to spec-driven"
```

---

## Phase 2: Update Docs And Skill Contracts

### Task p02-t01: Update workflow docs and examples to Spec-Driven lane

**Files:**
- Modify: `README.md`
- Modify: `docs/oat/quickstart.md`
- Modify: `docs/oat/workflow/lifecycle.md`
- Modify: `docs/oat/workflow/pr-flow.md`
- Modify: `docs/oat/projects/artifacts.md`
- Modify: `docs/oat/cli/index.md`
- Modify: `docs/oat/cli/provider-interop/commands.md`
- Modify: `docs/oat/reference/oat-directory-structure.md`

**Step 1: Write test (RED)**

Use grep-based checks to define expected terminology changes.

Run: `rg -n "\bFull workflow lane\b|\bfull lifecycle\b|--mode full|workflow mode metadata \(`full`" README.md docs/oat`
Expected: Hits present before edits

**Step 2: Implement (GREEN)**

- Rewrite lane/mode naming to `Spec-Driven`/`spec-driven` for the long workflow.
- Update CLI examples to `--mode spec-driven`.
- Keep Quick and Import lane behavior unchanged.

Run: `rg -n "--mode full|\bFull workflow lane\b|workflow mode metadata \(`full`" README.md docs/oat`
Expected: No hits for workflow contract contexts

**Step 3: Refactor**

Normalize wording for consistency (`Spec-Driven lane`, `quick`, `import`).

**Step 4: Verify**

Run: `pnpm lint`
Expected: No markdown/lint regressions

**Step 5: Commit**

```bash
git add README.md docs/oat
git commit -m "docs(p02-t01): rename full workflow lane to spec-driven"
```

---

### Task p02-t02: Update OAT skill/reviewer mode contracts

**Files:**
- Modify: `.agents/agents/oat-reviewer.md`
- Modify: `.agents/skills/oat-project-new/SKILL.md`
- Modify: `.agents/skills/oat-project-progress/SKILL.md`
- Modify: `.agents/skills/oat-project-plan/SKILL.md`
- Modify: `.agents/skills/oat-project-plan-writing/SKILL.md`
- Modify: `.agents/skills/oat-project-review-provide/SKILL.md`
- Modify: `.agents/skills/oat-project-pr-progress/SKILL.md`
- Modify: `.agents/skills/oat-project-pr-final/SKILL.md`
- Modify: `.agents/skills/oat-project-quick-start/SKILL.md`

**Step 1: Write test (RED)**

Define mode-contract grep checks in skill/reviewer files.

Run: `rg -n "oat_workflow_mode.*full|default.*full|\bfull mode\b" .agents/agents/oat-reviewer.md .agents/skills/oat-project-*.md`
Expected: Hits present before edits

**Step 2: Implement (GREEN)**

- Replace workflow mode contract references from `full` to `spec-driven`.
- Update defaults/examples/routing text accordingly.
- Keep unrelated `full` wording untouched.

Run: `rg -n "oat_workflow_mode.*full|default.*full|\bfull mode\b" .agents/agents/oat-reviewer.md .agents/skills/oat-project-*.md`
Expected: No contract hits for legacy full mode

**Step 3: Refactor**

Standardize lane language in skill output snippets.

**Step 4: Verify**

Run: `pnpm run cli -- internal validate-oat-skills`
Expected: Skill validation passes

**Step 5: Commit**

```bash
git add .agents/agents/oat-reviewer.md .agents/skills
git commit -m "docs(p02-t02): update skills for spec-driven workflow mode"
```

---

## Phase 3: Final Test Alignment And Release Readiness

### Task p03-t01: Update tests and help snapshots for renamed mode

**Files:**
- Modify: `packages/cli/src/commands/help-snapshots.test.ts`
- Modify: `packages/cli/src/commands/commands.integration.test.ts`
- Modify: `packages/cli/src/commands/project/new/index.test.ts`
- Modify: `packages/cli/src/commands/project/new/scaffold.test.ts`
- Modify: `packages/cli/src/commands/state/generate.test.ts`

**Step 1: Write test (RED)**

Run impacted test set without snapshot refresh to capture failures.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/help-snapshots.test.ts packages/cli/src/commands/project/new/index.test.ts packages/cli/src/commands/project/new/scaffold.test.ts packages/cli/src/commands/state/generate.test.ts`
Expected: Failures for legacy mode text/snapshots

**Step 2: Implement (GREEN)**

Update assertions and snapshots to the new `spec-driven` mode terminology.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/help-snapshots.test.ts packages/cli/src/commands/project/new/index.test.ts packages/cli/src/commands/project/new/scaffold.test.ts packages/cli/src/commands/state/generate.test.ts`
Expected: Tests pass

**Step 3: Refactor**

Clean test names/messages that still mention "full workflow" for this lane.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test`
Expected: CLI package tests pass

**Step 5: Commit**

```bash
git add packages/cli/src/commands
git commit -m "test(p03-t01): update cli tests for spec-driven mode"
```

---

### Task p03-t02: End-to-end smoke + workspace validation

**Files:**
- Modify: (none required unless issues are discovered)

**Step 1: Write test (RED)**

Not applicable for this validation task.

**Step 2: Implement (GREEN)**

Run CLI smoke checks against the renamed mode:
- `pnpm run cli -- project new smoke-spec-driven --mode spec-driven --json`
- `pnpm run cli -- state refresh`

**Step 3: Refactor**

If smoke checks reveal wording/contract drift, fix and re-run impacted tests.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: Workspace checks pass

**Step 5: Commit**

```bash
git add -A
git commit -m "chore(p03-t02): validate spec-driven workflow rename end-to-end"
```

---

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| p03 | code | pending | - | - |
| final | code | pending | - | - |
| spec | artifact | pending | - | - |
| design | artifact | pending | - | - |
| plan | artifact | received | 2026-02-21 | reviews/artifact-plan-review-2026-02-21.md |

**Status values:** `pending` -> `received` -> `fixes_added` -> `fixes_completed` -> `passed`

**Meaning:**
- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**
- Phase 1: 2 tasks - Rename core workflow contract and promotion skill id
- Phase 2: 2 tasks - Update docs and skill/reviewer contracts
- Phase 3: 2 tasks - Align tests and run end-to-end validation

**Total: 6 tasks**

Ready for implementation.

---

## References

- Discovery: `discovery.md`
- Workflow docs: `docs/oat/workflow/lifecycle.md`
- Workflow docs: `docs/oat/workflow/pr-flow.md`
- CLI scaffolding: `packages/cli/src/commands/project/new/`
- State routing: `packages/cli/src/commands/state/generate.ts`
- Skill registry: `packages/cli/src/commands/init/tools/workflows/install-workflows.ts`
