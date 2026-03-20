---
oat_generated: true
oat_generated_at: 2026-03-20
oat_review_scope: final (re-review)
oat_review_type: code
oat_project: .oat/projects/shared/agent-instructions-artifact-bundle
---

# Code Review: final (re-review)

**Reviewed:** 2026-03-20
**Scope:** final (65d5ec92..c3d2a938) -- re-review after fix tasks p03-t01 and p03-t02
**Files reviewed:** 17
**Commits:** 17 (3 docs-only pre-project + 4 task + 4 tracking + 2 review-receive + 2 fix-task + 2 fix-tracking)

## Summary

This is a re-review verifying that the two Medium findings (M1 prose coupling, M2 fragile repo root) from the first review
were addressed by fix tasks p03-t01 and p03-t02, and dispositioning the deferred findings (1 Medium, 4 Minor). Both fixes
are well-executed: the test now uses structural markers instead of editorial prose, and repo root resolution uses
`git rev-parse --show-toplevel` instead of a brittle seven-level parent traversal. No new findings were introduced by the
fix commits. All verification commands pass. No Critical or Important findings remain.

## Evidence Sources Used

- `discovery.md` (complete)
- `design.md` (complete)
- `plan.md` (complete, 3 phases / 6 tasks)
- `implementation.md` (6/6 tasks completed)
- First review: `reviews/archived/final-review-2026-03-20.md`

## Fix Verification

### M1: Prose coupling in bundle contract test -- VERIFIED FIXED

**Fix commit:** 06177a21 (p03-t01)
**File:** `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts:74-91`

**Before (exact prose assertions):**

- `'the bundle is the primary generation contract'`
- `'If the bundle exists but is incomplete, stop and require a refreshed analysis rather than falling back silently to the'`
- `'build the plan from the bundle manifest and recommendation packs first'`
- `"load the approved recommendation's manifest entry and matching pack before"`
- `'Do not generate from the markdown summary alone.'`

**After (structural markers):**

- `'### Step 0: Intake -- Find Analysis Artifact'` -- section header
- `'BUNDLE_DIR="${ARTIFACT_PATH%.md}.bundle"'` -- code-path marker
- `'MANIFEST_PATH="${BUNDLE_DIR}/recommendations.yaml"'` -- code-path marker
- `'**Bundle-first behavior:**'` -- section marker
- `'### Step 2: Build Recommendation Plan'` -- section header
- `'### Step 5: Generate/Update Instruction Files'` -- section header
- `'matching pack'` -- semantic signal (appears in generation step)

**Assessment:** The fix correctly replaces editorial-prose assertions with durable structural markers. The test still
enforces that the apply skill doc contains the bundle-first intake, planning, and generation contract, but it will not
break on routine copy edits. All 7 new assertions match content verified in the actual skill file. The test name was also
updated to reflect the new assertion strategy (`'requires apply to define bundle-first intake, planning, and generation markers'`).

### M2: Fragile repo-root resolution -- VERIFIED FIXED

**Fix commit:** 19ee809a (p03-t02)
**File:** `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts:1-14`

**Before:**

```ts
function repoFilePath(relativePath: string): string {
  return join(import.meta.dirname, '../../../../../../../', relativePath);
}
```

**After:**

```ts
const REPO_ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: import.meta.dirname,
  encoding: 'utf8',
}).trim();

function repoFilePath(relativePath: string): string {
  return join(REPO_ROOT, relativePath);
}
```

**Assessment:** The fix replaces the brittle seven-level parent traversal with `git rev-parse --show-toplevel`, anchored
to the test file's own directory via `cwd: import.meta.dirname`. This is robust against file moves within the repo tree
and will produce a clear error if git is unavailable rather than silently resolving to a wrong path. The use of
`execFileSync` (not `execSync`) is a nice touch since it avoids shell interpretation. The repo root is computed once
at module scope, keeping per-test overhead minimal.

## Deferred Findings Disposition

### Deferred Medium

| ID  | Finding                                                                                 | Disposition  | Rationale                                                                                                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M3  | Three docs-only commits (b335a768, 18bfa729, 98152074) on branch but outside plan scope | accept-defer | These commits predate the project and motivated the bundle work. They touch files the project later modifies but introduce no product defect. Splitting/rebasing would add workflow churn outside the scoped implementation. The PR description should note these as pre-project context commits. |

### Deferred Minor

| ID  | Finding                                                              | Disposition  | Rationale                                                                                                                                                                             |
| --- | -------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| m1  | Version bump convention not documented                               | accept-defer | Separate process/documentation concern outside this project's scope. The version numbers (analyze 1.9.0, apply 1.6.1) are internally consistent.                                      |
| m2  | Bundle summary template frontmatter uses spaces in YAML placeholders | accept-defer | Benign -- `{ artifact-path }` and `{ N }` parse as YAML strings. No tool currently parses these template placeholders as real YAML. Consistent with the manifest template convention. |
| m3  | Quality checklist criterion renumbering (old 14 became 15)           | accept-defer | Already internally consistent after the insert. SKILL.md references updated to match. Historical reference renumbering is a known consequence of inserting criteria.                  |
| m4  | `agents-md-root.md` adds Commit Format field                         | accept-defer | Positive observation, no action needed. The conditional note ("only if the repo enforces one") is correct guidance.                                                                   |

## Findings

### Critical

None

### Important

None

### Minor

None

## New Findings Introduced by Fix Commits

Checked both fix commits (06177a21, 19ee809a) for regressions or new issues:

- **No new imports without usage** -- `execFileSync` from `node:child_process` is used at line 7.
- **No remaining prose-locked assertions** -- all 4 test cases now assert structural markers (section headers, code blocks, field names, or template anchors).
- **No test logic changes beyond scope** -- the first three test cases are identical to the pre-fix version.
- **No type errors** -- `pnpm type-check` passes clean.
- **No lint issues** -- `pnpm lint` passes clean.

No new findings.

## Requirements/Design Alignment

**Evidence sources used:** discovery.md, design.md, plan.md, implementation.md

### Requirements Coverage

| Requirement                                  | Status      | Notes                                                                   |
| -------------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| Keep analyze and apply as separate skills    | implemented | Each skill maintains its own SKILL.md                                   |
| Add bundle contract beside human summary     | implemented | `.bundle/` directory with summary, manifest, packs                      |
| Bundle granularity: per-recommendation packs | implemented | Pack template with 9 sections; manifest indexes packs                   |
| Apply consumes bundle as primary contract    | implemented | Bundle-first intake at Step 0, planning at Step 2, generation at Step 5 |
| Regression fixtures for bundle fidelity      | implemented | 4 contract tests covering pack sections, manifest, summary, apply skill |
| Apply stops on incomplete bundles            | implemented | "stop and require a refreshed analysis" in apply SKILL.md:117           |
| Preserve human review experience             | implemented | Markdown artifact unchanged; bundle is additive                         |
| (Fix) Reduce prose coupling in contract test | implemented | p03-t01, commit 06177a21                                                |
| (Fix) Stabilize repo-root resolution         | implemented | p03-t02, commit 19ee809a                                                |

### Extra Work (not in declared requirements)

Same as first review -- instruction load budget assessment, parent absorption test, split decision guidance, config
override reading, and 3 pre-project docs commits. All aligned with project direction; no scope creep.

## Verification Commands

```bash
cd /Users/thomas.stang/.codex/worktrees/2968/open-agent-toolkit

# Full test suite (includes bundle contract tests)
pnpm test

# Lint
pnpm lint

# Type check
pnpm type-check

# Format check
pnpm format
```

**Verification results (run during this re-review):**

- `pnpm test` -- 1024 tests passed across 132 test files (4 bundle contract tests pass)
- `pnpm lint` -- clean (no errors)
- `pnpm type-check` -- clean (no errors)

## Review Outcome

**Result: PASS**

No Critical or Important findings. Both Medium fix tasks verified as correctly implemented. All deferred findings
dispositioned as accept-defer with documented rationale. No new findings introduced by the fix commits.
