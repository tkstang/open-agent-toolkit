---
oat_generated: true
oat_generated_at: 2026-03-11
oat_review_scope: plan
oat_review_type: artifact
oat_project: .oat/projects/shared/docs-reorganization
---

# Artifact Review: plan (re-review after rebase)

**Reviewed:** 2026-03-11
**Scope:** Quick-workflow plan readiness and alignment re-review for `docs-reorganization` after rebase
**Files reviewed:** 5 (discovery.md, design.md, plan.md, implementation.md, state.md)
**Commits:** N/A (artifact review)

## Summary

The rebased plan resolves all four findings from the 2026-03-10 review. MkDocs targeting is gone (C1 resolved), placeholder index files are scaffolded in p01-t01 (I1 resolved), `cli/index.md` is explicitly moved (I2 resolved), and legacy-path removal is gated on repo-wide stale-reference audits (I3 resolved). The plan is execution-ready with two important issues around move sequencing and one minor naming inconsistency to address before or during implementation.

## Prior Finding Resolution

| Prior ID | Severity  | Finding                                                          | Status       | Notes                                                                                                                        |
| -------- | --------- | ---------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| C1       | Critical  | Plan targeted nonexistent MkDocs workflow                        | **Resolved** | Verification commands now use `pnpm --filter oat-docs build`, `docs:format:check`, `docs:lint`. No MkDocs references remain. |
| I1       | Important | Required new index.md files not fully created before later tasks | **Resolved** | p01-t01 (lines 96-125) now creates all seven placeholder index.md files before any moves.                                    |
| I2       | Important | `docs/cli/index.md` left stranded                                | **Resolved** | p01-t05 (line 219) explicitly moves `cli/index.md` to `guide/cli-reference.md`.                                              |
| I3       | Important | Old paths removed without stale-link cleanup criteria            | **Resolved** | p03-t01 (lines 462-489) gates deletion on a stale-reference audit pass; p05-t01 runs a final audit.                          |

## Findings

### Critical

None

### Important

- **Placeholder-then-overwrite conflict for three index.md files** (`plan.md:101,133` / `plan.md:104,220,222`)
  - Issue: p01-t01 creates placeholder `index.md` files for `guide/provider-sync/`, `guide/skills/`, and `guide/ideas/`. Subsequent tasks then `git mv` the old `cli/provider-interop/index.md`, `skills/index.md`, and `ideas/index.md` onto those same paths, overwriting the just-created placeholders. `git mv` to an existing path will succeed but produces a confusing diff (create file, then immediately replace it) and wastes a step. More importantly, if the implementer uses `git mv --no-overwrite` or a strict move tool, the operation would fail.
  - Fix: Either (a) remove those three specific placeholder creations from p01-t01 since the old index files will be moved there by p01-t02 / p01-t05, relying on the directory being created implicitly by the first `git mv`, or (b) change the move tasks to `Modify` the placeholder instead of `Move` the old file, merging old content into the new placeholder. Option (a) is simpler and recommended.

- **Legacy `workflow/index.md` and `projects/index.md` are never moved or explicitly retired** (`plan.md:157-185`)
  - Issue: p01-t03 moves six content files out of `workflow/` and `projects/` but does not move `workflow/index.md` or `projects/index.md`. These files contain introductory content and `## Contents` links. The plan intends p02-t06 (line 414) to "merge workflow and project intros" into the new `guide/workflow/index.md`, but it does not reference these old index files as source material. During the gap between p01-t03 (moves content) and p03-t01 (removes legacy directories), these orphaned index files will have broken `## Contents` links pointing to files that have already moved. This will cause the docs build or markdown lint to fail at the end of Phase 1 if any intermediate verification is run.
  - Fix: Add `workflow/index.md` and `projects/index.md` to p01-t03's move list (or to p01-t05's "retain temporarily" list), and add an explicit note in p02-t06 that the new `guide/workflow/index.md` should absorb content from both old index files. Alternatively, if they should stay in place as stubs during moves, update their `## Contents` links to point to the new locations so intermediate builds do not break.

### Minor

- **`guide/documentation/index.md` placeholder is the only "Create-then-keep" index** (`plan.md:102`)
  - Issue: Unlike the three problematic placeholders above, the `guide/documentation/` section has no old index.md file being moved to replace its placeholder. This is correct behavior. However, p02-t06 (line 402) lists it as `Modify` rather than acknowledging it starts from placeholder content. The implementer should know this file begins as a near-empty stub. This is informational, not blocking.
  - Suggestion: Add a note in p02-t06 that `guide/documentation/index.md` starts from the p01-t01 placeholder rather than from moved content.

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md`, `design.md`, `plan.md`, `implementation.md`, `state.md`, prior review `reviews/artifact-plan-review-2026-03-10.md`

### Requirements Coverage

| Requirement                                            | Status      | Notes                                                                                                                          |
| ------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Audience separation (guide / contributing / reference) | implemented | Target structure at plan lines 43-94 explicitly implements the three-audience split.                                           |
| Provider sync elevation to user-facing guide section   | implemented | p01-t02 moves all provider-interop files. p02-t06 rewrites the landing page.                                                   |
| Workflow + Projects merge                              | implemented | p01-t03 merges content into `guide/workflow/`. p02-t06 rewrites the combined landing.                                          |
| Contributing decomposition into sub-pages              | implemented | p01-t05 + p02-t04 create code, docs, markdown-features, skills, design-principles, commit-conventions, hooks-and-safety pages. |
| No content deletion                                    | implemented | Plan explicitly retains all content; "retain temporarily" items have absorption targets.                                       |
| Maintain docs index contract                           | implemented | p01-t01 scaffolds all index.md files. p02-t06 rewrites them. p05-t01 validates the contract.                                   |
| Generated surface refresh                              | implemented | p02-t07 regenerates `apps/oat-docs/index.md`. p05-t02 reruns it as final check.                                                |
| Stale-link cleanup before removal                      | implemented | p03-t01 gates removal on audit pass. p05-t01 runs final audit.                                                                 |
| Fumadocs build verification                            | implemented | p05-t02 runs `docs:format:check`, `docs:lint`, and `build`.                                                                    |
| Mermaid and tabs remain compatible                     | implemented | p04-t01 (Mermaid) and p04-t02 (tabs) are dedicated tasks with verification.                                                    |
| `diagnostics.md` and `local-paths.md` cleanup          | implemented | Retained temporarily per p01-t05 (line 227), absorbed in p02-t05 (line 386), removed in p03-t01.                               |
| `hill-checkpoints.md` naming consistency               | implemented | Plan line 69 uses `hill-checkpoints.md` matching the on-disk filename `workflow/hill-checkpoints.md`.                          |
| `oat-directory-structure.md` naming consistency        | implemented | Plan line 92 uses `oat-directory-structure.md` matching on-disk `reference/oat-directory-structure.md`.                        |

### Alignment with Upstream Artifacts

**discovery.md alignment:** The plan covers all eight key decisions from discovery (lines 67-76), all six success criteria (lines 87-93), and respects all six constraints (lines 79-84).

**design.md alignment:** The plan follows the three-component design (audience-driven tree, generated surface index, cleanup/verification layer). Verification commands match the design's specified interfaces (design lines 113-147). The staged move-and-rewrite flow matches the design's migration steps (design lines 320-325).

### Extra Work (not in declared requirements)

None. All plan tasks map to discovery requirements or design components.

## Verification Commands

Run these to validate plan assumptions before implementation:

```bash
# Confirm no mkdocs.yml in the docs app
test ! -f apps/oat-docs/mkdocs.yml && echo "PASS: no mkdocs.yml" || echo "FAIL"

# Confirm Fumadocs source config exists
test -f apps/oat-docs/source.config.ts && echo "PASS: source.config.ts exists" || echo "FAIL"

# Confirm the docs build works on the current tree before any moves
pnpm --filter oat-docs build

# Confirm the index generation command works
pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md

# List current docs files to confirm baseline matches plan assumptions
find apps/oat-docs/docs -type f -name '*.md' | sort
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.
