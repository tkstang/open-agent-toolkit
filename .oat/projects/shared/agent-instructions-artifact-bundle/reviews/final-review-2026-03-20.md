---
oat_generated: true
oat_generated_at: 2026-03-20
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/agent-instructions-artifact-bundle
---

# Code Review: final

**Reviewed:** 2026-03-20
**Scope:** final (65d5ec92..ac0e9018) — all branch changes since divergence from main
**Files reviewed:** 17
**Commits:** 11 (3 docs-only pre-project commits + 4 task commits + 4 tracking commits)

## Summary

This branch introduces a two-layer analyze/apply handoff: the existing human-readable markdown artifact plus a companion bundle (summary, YAML manifest, per-recommendation packs). It also tightens analyze guidance around numeric claims, nested directory coverage, file-type behavioral conventions, and instruction load budgets. The implementation is well-structured and matches the discovery/design artifacts. The contract tests are a good approach for locking the bundle schema, though the test assertions are coupled to template prose in ways that could create friction during routine template edits.

## Findings

### Critical

None

### Important

None

### Medium

#### M1: Contract tests assert exact prose strings from skill docs — high coupling risk

**File:** `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts:74-88`

The fourth test case (`requires apply to consume the bundle before falling back`) asserts exact sentence fragments from `oat-agent-instructions-apply/SKILL.md`. Any editorial rewording that preserves the same semantic requirement will break the test, creating false failures.

The first three test cases (pack sections, manifest markers, summary markers) assert structural section headers and field names — these are genuinely contractual and appropriate. But the fourth test crosses from "contract marker" to "prose wording lock."

**Recommendation:** Replace the exact-string assertions in the fourth test with structural markers that represent the bundle-first contract without locking editorial phrasing. For example, assert the presence of the `BUNDLE_DIR` derivation code block, or assert that the string `bundle` and `primary` both appear within the same paragraph, rather than asserting the exact sentence "the bundle is the primary generation contract."

**Severity justification:** Medium — the tests pass today and correctly lock the contract, but they will create maintenance friction on the next editorial pass of apply SKILL.md.

#### M2: `repoFilePath` uses a fragile seven-level parent traversal

**File:** `packages/cli/src/commands/init/tools/shared/agent-instructions-bundle-contract.test.ts:6-8`

```ts
function repoFilePath(relativePath: string): string {
  return join(import.meta.dirname, '../../../../../../../', relativePath);
}
```

This traverses seven `../` levels to reach the repo root. If the test file is moved or the directory structure changes, the path silently resolves to the wrong location and tests fail with a confusing "file not found" error rather than a clear message.

**Recommendation:** Use a git-root or workspace-root resolution strategy instead of counting parent directories. For example:

```ts
import { execSync } from 'node:child_process';
const REPO_ROOT = execSync('git rev-parse --show-toplevel', {
  encoding: 'utf8',
}).trim();
function repoFilePath(relativePath: string): string {
  return join(REPO_ROOT, relativePath);
}
```

Or, if the project has a shared test utility for repo root resolution, use that instead.

**Severity justification:** Medium — works today but is brittle. Other test files in the repo should be checked for the same pattern.

#### M3: Three docs-only commits are on the branch but outside plan scope

**Commits:**

- `b335a768` docs: strengthen agent-instruction verification gates
- `18bfa729` docs: clarify nested AGENTS coverage decisions
- `98152074` docs: capture behavioral instruction handoff

These three commits predate the project and touch the same files that the plan tasks later modify. They appear to be incremental improvements that motivated the project. Including them in the branch is not wrong, but it means the PR diff will include changes that are not tracked by the plan and were not produced under the project's verification workflow.

**Recommendation:** Decide whether to:

1. **Accept as-is** — note in the PR description that the first 3 commits are pre-project tightening of analyze/apply guidance that motivated the bundle work.
2. **Split into a separate PR** — land the 3 docs-only commits first, then rebase the bundle work on top.

Option 1 is simpler if the reviewer is comfortable with a larger diff. Option 2 produces cleaner traceability.

**Severity justification:** Medium — no code correctness issue, but affects reviewability and traceability.

### Minor

#### m1: Version bump convention is not documented

**Files:** `.agents/skills/oat-agent-instructions-analyze/SKILL.md:1` (1.6.1 → 1.9.0), `.agents/skills/oat-agent-instructions-apply/SKILL.md:1` (1.3.2 → 1.6.1)

The version jumps are significant (especially analyze jumping from 1.6.1 to 1.9.0) but there is no changelog or version policy documented. This is fine for now but could create confusion if multiple branches modify the same skill concurrently.

#### m2: Bundle summary template frontmatter uses spaces in YAML values

**File:** `.agents/skills/oat-agent-instructions-analyze/references/bundle-summary-template.md:3-6`

```yaml
analysis_artifact: { artifact-path }
manifest: recommendations.yaml
pack_count: { N }
```

The `{ artifact-path }` and `{ N }` placeholders use spaces inside braces. This is valid YAML (they parse as strings), but if any tooling attempts to parse these as actual YAML values, the spaces inside braces could be misinterpreted as flow mappings. The manifest template uses the same convention consistently, so this is internally consistent.

#### m3: Quality checklist criterion renumbering

**File:** `.agents/skills/oat-agent-instructions-analyze/references/quality-checklist.md`

The old Criterion 14 (Available Documentation Is Referenced) became Criterion 15 after inserting the new Criterion 14 (Nested Directory Coverage Decisions). The SKILL.md references were updated to match. This is correct but worth noting for anyone referencing criterion numbers from prior analyses.

#### m4: `agents-md-root.md` template adds `Commit Format` field

**File:** `.agents/skills/oat-agent-instructions-apply/references/instruction-file-templates/agents-md-root.md:39`

The new field `**Commit Format:** {e.g., Conventional Commits with commitlint — only if the repo enforces one}` is a useful addition. The conditional note ("only if the repo enforces one") is good. This is a minor observation — no action needed.

## Spec/Design Alignment

### Requirements Coverage

| Requirement                                  | Status      | Notes                                                              |
| -------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| Keep analyze and apply as separate skills    | implemented | No merge; each skill maintains its own SKILL.md                    |
| Add bundle contract beside human summary     | implemented | Bundle dir structure with summary, manifest, packs                 |
| Bundle granularity: per-recommendation packs | implemented | Pack template with 9 sections; manifest indexes packs              |
| Apply consumes bundle as primary contract    | implemented | SKILL.md updated with bundle-first intake + fallback rules         |
| Regression fixtures for bundle fidelity      | implemented | Contract test with 4 test cases                                    |
| Apply stops on incomplete bundles            | implemented | "stop and require a refreshed analysis" language in apply SKILL.md |
| Preserve human review experience             | implemented | Markdown artifact unchanged; bundle is additive                    |

### Extra Work (not in requirements)

- **Instruction load budget assessment** — new section in analysis artifact template and quality checklist for computing task-load scenarios (always-on baseline, typical, worst-case). Not in discovery/design but a sensible addition.
- **Parent Absorption Test** — new procedure in directory-assessment-criteria.md for evaluating whether parent recommendations subsume nested children. Aligns with the nested coverage strengthening goal.
- **Split decision guidance** — new Step 5a in file-type discovery checklist for deciding whether to split patterns into separate rules. Extends the behavioral conventions theme.
- **Config file override reading** — new guidance in analyze SKILL.md to read scoped config sections before making file-type claims. Good defensive addition.
- **3 pre-project docs commits** — strengthen verification gates, nested coverage, behavioral handoff (see M3).

All extra work is aligned with the project's direction and does not introduce scope creep risk.

## Verification Commands

```bash
# All commands should be run in the worktree
cd /Users/thomas.stang/.codex/worktrees/2968/open-agent-toolkit

# Tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm type-check

# Format check
pnpm format
```

**Verification results (run during review):**

- `pnpm test` — 8/8 tasks passed (cached)
- `pnpm lint` — 8/8 tasks passed (cached)
- `pnpm type-check` — 8/8 tasks passed (cached)

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.
