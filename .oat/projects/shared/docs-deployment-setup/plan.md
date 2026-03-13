---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-13
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: true
---

# Implementation Plan: docs-deployment-setup

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Set up docs deployment to GitHub Pages and separate docs build from default build pipeline.

**Commit Convention:** `fix({scope}): {description}`

---

## Phase 1: Review Fixes

### Task p01-t01: (review) Add docs build validation to CI

**Files:**

- Modify: `.github/workflows/ci.yml`

**Step 1: Understand the issue**

Review finding: `pnpm build` now excludes docs via `--filter='!oat-docs'`, so broken docs won't be caught during PR review — only at deploy time on main.
Location: `package.json:9`, `.github/workflows/ci.yml:39`

**Step 2: Implement fix**

Add `pnpm build:docs` step to CI workflow. Consider either:

- Adding it unconditionally after the existing build step
- Adding a separate job with `paths` filter for docs-related directories to keep non-docs PRs fast

**Step 3: Verify**

Run: Review the workflow YAML for correctness
Expected: CI validates docs build on PRs that touch docs-related files

**Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "fix(p01-t01): add docs build validation to CI"
```

---

### Task p01-t02: (review) Replace tj-actions with native git diff and paths filter

**Files:**

- Modify: `.github/workflows/deploy-docs.yml`

**Step 1: Understand the issue**

Review finding: `tj-actions/changed-files@v46` is pinned to a mutable tag. This org had a supply-chain incident in March 2025. The action is the only third-party dependency in the workflows.
Location: `.github/workflows/deploy-docs.yml:29`

**Step 2: Implement fix**

Replace the `tj-actions/changed-files` action and `should_deploy` logic with a `paths` filter on the push trigger. This eliminates the third-party dependency entirely and also addresses the unnecessary runner spin-up (m1):

```yaml
on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'apps/oat-docs/**'
      - 'packages/docs-config/**'
      - 'packages/docs-theme/**'
      - 'packages/docs-transforms/**'
```

Remove the `tj-actions/changed-files` step, the `should_deploy` step, and all `if: steps.should_deploy.outputs.deploy == 'true'` conditionals from subsequent steps.

**Step 3: Verify**

Run: Review the workflow YAML for correctness; `workflow_dispatch` still allows manual deploys regardless of paths
Expected: Workflow only triggers on docs-related changes or manual dispatch, no third-party actions

**Step 4: Commit**

```bash
git add .github/workflows/deploy-docs.yml
git commit -m "fix(p01-t02): replace tj-actions with paths filter"
```

---

### Task p01-t03: (review) Add paths filter to deploy workflow trigger

**Files:**

- Modify: `.github/workflows/deploy-docs.yml`

**Step 1: Understand the issue**

Review finding: Workflow starts on every push to main, wasting ~20-30s of Actions minutes on non-docs pushes.
Location: `.github/workflows/deploy-docs.yml:6-7`

**Step 2: Implement fix**

This is addressed by p01-t02 — the `paths` filter on the push trigger eliminates unnecessary workflow runs. Verify this was applied correctly in p01-t02.

**Step 3: Verify**

Run: Confirm `paths` filter is present on the push trigger
Expected: Push trigger includes paths for all four docs directories

**Step 4: Commit**

```bash
# Combined with p01-t02 if done together
```

---

## Reviews

| Scope | Type | Status | Date       | Artifact                              |
| ----- | ---- | ------ | ---------- | ------------------------------------- |
| final | code | passed | 2026-03-13 | reviews/final-review-2026-03-13-v2.md |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**

- Phase 1: 3 tasks - Review fixes (CI validation, supply-chain fix, paths filter)

**Total: 3 tasks**

---

## References

- Discovery: `discovery.md`
- Implementation: `implementation.md`
