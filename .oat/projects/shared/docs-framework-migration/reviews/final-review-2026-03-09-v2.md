---
oat_generated: true
oat_generated_at: 2026-03-09
oat_review_scope: final
oat_review_type: code
oat_project: /Users/thomas.stang/Code/open-agent-toolkit/.worktrees/open-agent-toolkit/migrate-docs-framework/.oat/projects/shared/docs-framework-migration
---

# Code Review: final

**Reviewed:** 2026-03-09
**Scope:** Final re-review of completed review-fix tasks `p04-t06` through `p04-t10` (`267ed13..HEAD`)
**Files reviewed:** 17
**Commits:** 10 commits (`267ed13..HEAD`)

## Summary

This re-review was narrowed to the completed fix-task slice after the prior final review. Most of the original findings are now closed: the index output path/config pointer were corrected, Mermaid wiring is in place, the test race is fixed, and the nested `docs index generate` command now exists. Two merge-blocking issues remain, though: the scaffold scripts still invoke the removed hyphenated command name, and the search configuration is still only returned from `createSourceConfig()` instead of being consumed by the Fumadocs app/runtime.

## Findings

### Critical

- **The scaffold still calls the removed `docs index-generate` command** (`.oat/templates/docs-app-fuma/package.json.template:8`, `.oat/templates/docs-app-fuma/package.json.template:10`)
  - Issue: `p04-t10` changed the CLI surface to `oat docs index generate`, but the Fumadocs scaffold added in `p04-t07` still hard-codes `npx oat docs index-generate` in `predev` and `prebuild`. On the reviewed branch, `pnpm run cli -- docs index-generate` exits with `error: unknown command 'index-generate'`, so newly scaffolded apps will fail before dev/build can regenerate the index artifact.
  - Fix: Update the template scripts to call `oat docs index generate`, or add a compatibility alias so both forms work.
  - Requirement: FR6, NFR2

- **Static search is still not wired into the generated docs app** (`packages/docs-config/src/source-config.ts:16`, `.oat/templates/docs-app-fuma/source.config.ts:10`)
  - Issue: `createSourceConfig()` now returns `search: createSearchConfig()`, but the scaffolded `source.config.ts` still only passes `remarkPlugins` into `defineConfig()`. A repo-wide search for `search:` shows no consumer beyond `source-config.ts`, so FlexSearch remains declared but unused and FR2/NFR3 are still only partially implemented.
  - Fix: Thread `sourceConfig.search` into the actual Fumadocs config/runtime hook that enables static search, then add a test that proves the scaffold consumes it.
  - Requirement: FR2, NFR3

### Important

None

### Medium

None

### Minor

None

## Requirements/Design Alignment

**Evidence sources used:** `spec.md`, `design.md`, `plan.md`, `implementation.md`, `state.md`, `reviews/final-review-2026-03-09.md`, branch diff for `267ed13..HEAD`

**Deferred Findings Ledger (final scope):**
- Deferred Medium count: 0
- Deferred Minor count: 0
- None

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR2 | partial | Mermaid is now wired, but static search is still not consumed by the scaffold/runtime. |
| FR6 | partial | Index generation pathing is fixed and the nested command exists, but the scaffold still invokes the removed hyphenated form. |
| FR7 | implemented | `documentation.index` now points to the app-root artifact. |
| NFR2 | partial | The intended package-manager-agnostic lifecycle hook exists, but it currently calls the wrong CLI command. |
| NFR3 | partial | Static export remains configured, but static search is still not actually enabled. |

### Extra Work (not in requirements)

None identified.

## Verification Commands

Executed during re-review:

```bash
git -C /Users/thomas.stang/Code/open-agent-toolkit/.worktrees/open-agent-toolkit/migrate-docs-framework diff --name-only 267ed13..HEAD
git -C /Users/thomas.stang/Code/open-agent-toolkit/.worktrees/open-agent-toolkit/migrate-docs-framework log --oneline 267ed13..HEAD
pnpm --filter @oat/docs-config exec vitest run src/source-config.test.ts
pnpm --filter @oat/cli exec vitest run src/commands/docs/init/integration.test.ts src/commands/docs/init/mkdocs-compat.test.ts src/commands/docs/init/scaffold.test.ts src/commands/docs/index-generate/generator.test.ts src/commands/help-snapshots.test.ts
pnpm run cli -- docs index generate --help
pnpm run cli -- docs index-generate
```

Results:
- `@oat/docs-config` targeted test: pass
- `@oat/cli` targeted docs tests: pass
- `oat docs index generate --help`: pass
- `oat docs index-generate`: fails with `unknown command 'index-generate'`

## Recommended Next Step

Run the `oat-project-review-receive` skill again to convert the remaining findings into follow-up tasks before merge.
