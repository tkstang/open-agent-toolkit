---
oat_generated: true
oat_generated_at: 2026-03-13
oat_review_scope: final (re-review, fix tasks only)
oat_review_type: code
oat_project: .oat/projects/shared/docs-deployment-setup
---

# Code Review: final (re-review)

**Reviewed:** 2026-03-13
**Scope:** Re-review of fix tasks p01-t01, p01-t02, p01-t03 (commits 7b958b39..6a2bb889)
**Files reviewed:** 2
**Commits:** 2

## Summary

All three findings from the original review are properly addressed. The CI workflow now includes `pnpm build:docs` to catch docs build breakage on PRs (I1). The `tj-actions/changed-files` third-party action has been completely removed and replaced with a native `paths` filter on the push trigger, eliminating the supply-chain risk (I2). The paths filter also prevents unnecessary workflow runs on non-docs pushes (m1). The changes are clean, minimal, and correct.

## Findings

### Critical

None

### Important

None

### Minor

None

## Original Finding Verification

### I1: CI no longer validates docs build on PRs -- RESOLVED

**Original issue:** `pnpm build` in CI excluded docs via `--filter='!oat-docs'`, so broken docs would only surface at deploy time on main.

**Fix applied (7b958b39):** Added `pnpm build:docs` step to `.github/workflows/ci.yml:41-42`, running unconditionally after the existing `pnpm build` step.

**Verification:**

- The step is correctly positioned after the `Build` step (line 41-42).
- `pnpm build:docs` resolves to `turbo run build --filter=oat-docs...` in `package.json:10`, which builds oat-docs and all its workspace dependencies.
- The step runs unconditionally on both push-to-main and pull-request events, meaning docs breakage will be caught during PR review.
- **Note:** The plan mentioned an alternative of using a `paths` filter for a separate docs-build job to keep non-docs PRs fast. The unconditional approach was chosen instead, which is simpler and provides broader protection (catches breakage from shared dependency changes even when no docs files are directly modified). This is a reasonable trade-off -- the docs build adds time to all CI runs, but it ensures no blind spots. If CI time becomes a concern, this can be optimized later.

**Status:** Properly resolved.

### I2: Third-party action pinned to mutable tag -- RESOLVED

**Original issue:** `tj-actions/changed-files@v46` was pinned to a mutable major version tag, creating a supply-chain risk (this organization had a security incident in March 2025).

**Fix applied (6a2bb889):** The entire `tj-actions/changed-files` action was removed from `.github/workflows/deploy-docs.yml`. The change detection approach was replaced with a native GitHub Actions `paths` filter on the push trigger (lines 7-11). This also removed:

- The `Check for docs changes` step (formerly line 29)
- The `Should deploy` step (formerly line 36)
- All `if: steps.should_deploy.outputs.deploy == 'true'` conditionals from subsequent steps

**Verification:**

- No third-party actions remain in the workflow. All actions are GitHub-maintained: `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.
- The `paths` filter covers all four docs-related directories: `apps/oat-docs/**`, `packages/docs-config/**`, `packages/docs-theme/**`, `packages/docs-transforms/**`.
- `workflow_dispatch` trigger remains on line 4, allowing manual deploys regardless of path filters.
- The workflow is significantly simpler: 59 lines reduced to 40 lines, with no conditional logic.

**Status:** Properly resolved.

### m1: Workflow runs on every push to main -- RESOLVED

**Original issue:** The push trigger had no `paths` filter, causing the workflow to spin up a runner on every push to main even when no docs files changed.

**Fix applied (6a2bb889, same commit as I2):** The `paths` filter added to the push trigger (lines 7-11) ensures the workflow only starts when docs-related files are modified. This was correctly combined with the I2 fix as noted in the plan (p01-t03 states "This is addressed by p01-t02").

**Status:** Properly resolved.

### m2: Plan artifact not populated -- DEFERRED (acknowledged)

Per the deferred findings ledger, this was explicitly deferred by the user. The plan has since been populated with fix tasks (Phase 1: Review Fixes), which is sufficient for the current scope. No code fix needed for a captured/retroactive project.

**Status:** Deferred (no action required).

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md` (primary requirements for quick mode), `plan.md` (fix task definitions), `implementation.md` (verification log), original review artifact `reviews/archived/final-review-2026-03-13.md`.

### Requirements Coverage

| Requirement                                                        | Status                     | Notes                                                                                         |
| ------------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------- |
| Docs deploy automatically on push to main (when docs files change) | Implemented                | `paths` filter triggers on docs changes; `workflow_dispatch` for manual                       |
| `pnpm build` no longer includes docs                               | Implemented (pre-existing) | Not modified by fix commits -- confirmed still using `--filter='!oat-docs'`                   |
| `pnpm build:docs` builds docs and all dependencies                 | Implemented (pre-existing) | Not modified by fix commits -- confirmed still maps to `turbo run build --filter=oat-docs...` |
| Manual deploy via workflow_dispatch is available                   | Implemented                | `workflow_dispatch` trigger preserved at line 4, independent of `paths` filter                |
| CI validates docs build on PRs                                     | Implemented (new)          | `pnpm build:docs` step added to ci.yml                                                        |
| No third-party supply-chain risk                                   | Implemented (new)          | `tj-actions/changed-files` removed entirely                                                   |
| No unnecessary workflow runs on non-docs pushes                    | Implemented (new)          | `paths` filter prevents workflow from starting                                                |

### Extra Work (not in declared requirements)

None. Both commits are tightly scoped to the fix tasks.

## Verification Commands

Run these to verify the implementation:

```bash
# Validate CI workflow YAML syntax (requires actionlint or yq)
yq eval '.' .github/workflows/ci.yml > /dev/null && echo "ci.yml: valid YAML"
yq eval '.' .github/workflows/deploy-docs.yml > /dev/null && echo "deploy-docs.yml: valid YAML"

# Confirm docs build step exists in CI
grep -A1 'Build docs' .github/workflows/ci.yml
# Expected: "run: pnpm build:docs"

# Confirm no tj-actions references remain
grep -r 'tj-actions' .github/workflows/
# Expected: no output (no matches)

# Confirm paths filter is present on deploy workflow push trigger
grep -A6 'push:' .github/workflows/deploy-docs.yml
# Expected: branches: [main] followed by paths with 4 entries

# Confirm no conditional steps remain in deploy workflow
grep 'if:' .github/workflows/deploy-docs.yml
# Expected: no output (no conditionals)

# Verify docs build still works
pnpm build:docs
# Expected: successful build with output in apps/oat-docs/out/
```
