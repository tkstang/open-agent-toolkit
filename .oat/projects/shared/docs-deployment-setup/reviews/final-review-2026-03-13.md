---
oat_generated: true
oat_generated_at: 2026-03-13
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/docs-deployment-setup
---

# Code Review: final (22e95a13..HEAD)

**Reviewed:** 2026-03-13
**Scope:** Final review -- all tasks (p01-t01, p01-t02) in commit 6237eb24
**Files reviewed:** 4
**Commits:** 1 (6237eb24)

## Summary

The implementation cleanly satisfies the four success criteria from the discovery document. Build separation via Turborepo filter works correctly, the GitHub Pages deployment workflow is well-structured with proper change detection and manual dispatch support, and documentation in AGENTS.md was updated. Two important findings relate to (1) CI no longer validating the docs build on pull requests, which means broken docs will only be caught at deploy time on main, and (2) the `tj-actions/changed-files` action being pinned to a mutable tag rather than a SHA, which is a supply-chain security concern for a public repository.

## Findings

### Critical

None

### Important

- **CI no longer validates docs build on PRs** (`package.json:9`, `.github/workflows/ci.yml:39`)
  - Issue: The CI workflow runs `pnpm build`, which now uses `--filter='!oat-docs'` to exclude docs. This means docs build breakage will not be caught during pull request review -- it will only surface when the deploy workflow runs on push to main. A contributor could merge a PR that breaks the docs build (e.g., changing a shared docs-config type) without any CI signal.
  - Fix: Add a `pnpm build:docs` step to `ci.yml` (possibly conditional on docs-related file changes to keep PR CI fast for non-docs changes), or add a separate docs-build check workflow. Example addition to `ci.yml`:
    ```yaml
    - name: Build docs
      run: pnpm build:docs
    ```
    Alternatively, if the intent is to keep CI fast, a separate workflow with `paths` filter for docs-related directories would work.
  - Requirement: Aligns with discovery constraint "Build depends on three workspace packages that must compile first" -- those packages are shared and could be broken by non-docs PRs.

- **Third-party action pinned to mutable tag** (`.github/workflows/deploy-docs.yml:29`)
  - Issue: `tj-actions/changed-files@v46` is pinned to a major version tag, which is mutable. This is a supply-chain risk for a public open-source repository. The `tj-actions` organization has had a past security incident (March 2025) where malicious code was injected via tag manipulation. All other actions in both workflows use well-known GitHub-maintained actions (`actions/*`), making this the only third-party dependency.
  - Fix: Pin to a specific commit SHA instead of a tag, and add a comment with the version for readability:
    ```yaml
    - name: Check for docs changes
      uses: tj-actions/changed-files@<full-sha> # v46.x.x
    ```
    Alternatively, consider replacing this action with a native `git diff` approach in a run step, which eliminates the third-party dependency entirely:
    ```yaml
    - name: Check for docs changes
      id: doc_changes
      run: |
        if git diff --name-only HEAD~1 HEAD | grep -qE '^(apps/oat-docs/|packages/docs-(config|theme|transforms)/)'; then
          echo "any_modified=true" >> $GITHUB_OUTPUT
        else
          echo "any_modified=false" >> $GITHUB_OUTPUT
        fi
    ```

### Minor

- **Workflow runs on every push to main, even for non-docs changes** (`.github/workflows/deploy-docs.yml:6-7`)
  - Issue: The push trigger has no `paths` filter, so the workflow starts on every push to main. While the `should_deploy` logic correctly skips the build/deploy steps, the runner still spins up, checks out the repo, and runs the changed-files action on every main push. This consumes GitHub Actions minutes unnecessarily (roughly 20-30 seconds per non-docs push).
  - Suggestion: Add a `paths` filter to the push trigger to avoid even starting the workflow when no docs-related files changed. The `workflow_dispatch` trigger would still allow manual deploys independently:
    ```yaml
    push:
      branches: [main]
      paths:
        - 'apps/oat-docs/**'
        - 'packages/docs-config/**'
        - 'packages/docs-theme/**'
        - 'packages/docs-transforms/**'
    ```
    If using `paths`, the `tj-actions/changed-files` step and `should_deploy` logic can be removed entirely, simplifying the workflow. The only downside is that `paths` filter uses the push event's changed files, which for merge commits may differ slightly from `tj-actions/changed-files`, but in practice this is negligible.

- **Plan artifact was not populated** (`.oat/projects/shared/docs-deployment-setup/plan.md`)
  - Issue: The plan.md file contains only the boilerplate template with `{placeholder}` values -- no actual task definitions, file lists, or verification commands were filled in. The implementation.md and discovery.md are the only substantive project artifacts. This is a workflow contract gap for quick mode, which requires `discovery.md` + `plan.md`.
  - Suggestion: For a captured/retroactive project this is understandable, but future projects should populate the plan before implementation. No code fix needed.

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md` (primary requirements), `implementation.md` (verification log). No `spec.md` or `design.md` present (expected for quick mode -- not a gap).

### Requirements Coverage

| Requirement                                                                        | Status      | Notes                                                                                                                     |
| ---------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Docs deploy automatically to GitHub Pages on push to main (when docs files change) | Implemented | Workflow triggers on push to main, change detection via `tj-actions/changed-files`, deploys via `actions/deploy-pages@v4` |
| `pnpm build` no longer includes docs                                               | Implemented | `--filter='!oat-docs'` confirmed working; dry-run shows 4 packages without oat-docs                                       |
| `pnpm build:docs` builds docs and all dependencies                                 | Implemented | `--filter=oat-docs...` correctly pulls in transitive workspace dependencies                                               |
| Manual deploy via workflow_dispatch is available                                   | Implemented | `workflow_dispatch` trigger present; `should_deploy` logic correctly forces deploy=true for manual dispatch               |
| Broader change detection (three workspace packages)                                | Implemented | `apps/oat-docs/**`, `packages/docs-config/**`, `packages/docs-theme/**`, `packages/docs-transforms/**` all watched        |
| Concurrency control                                                                | Implemented | `concurrency.group: pages` with `cancel-in-progress: false` prevents parallel deploys                                     |
| Proper permissions                                                                 | Implemented | `contents: read`, `pages: write`, `id-token: write` are the minimum required set                                          |
| Static export upload path                                                          | Implemented | `apps/oat-docs/out` matches the Next.js `output: 'export'` directory confirmed in `docs-config`                           |
| AGENTS.md documentation updated                                                    | Implemented | `build` description updated, `build:docs` command added                                                                   |

### Extra Work (not in declared requirements)

- `apps/oat-docs/turbo.json` -- Added `out/**` to cached build outputs. This was not explicitly in the requirements but is a necessary correctness fix: without it, Turborepo would not cache the static export artifacts, causing `build:docs` to always rebuild even when inputs haven't changed. This is appropriate supporting work, not scope creep.

## Verification Commands

Run these to verify the implementation:

```bash
# Verify docs excluded from default build
pnpm build --dry-run 2>&1 | grep -c "oat-docs"
# Expected: 0 (oat-docs not in package list)

# Verify docs build includes all dependencies
pnpm build:docs --dry-run 2>&1 | grep "Packages in Scope" -A 10
# Expected: oat-docs, @oat/cli, @oat/docs-config, @oat/docs-theme, @oat/docs-transforms

# Verify actual docs build succeeds
pnpm build:docs
# Expected: Successful build with output in apps/oat-docs/out/

# Verify static export directory exists after build
ls apps/oat-docs/out/index.html
# Expected: File exists

# Validate GitHub Actions workflow syntax
gh workflow view deploy-docs.yml 2>/dev/null || echo "Validate after push to remote"
```
