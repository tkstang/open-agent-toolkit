---
oat_generated: true
oat_generated_at: 2026-03-15
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/oat-cli-doctor-skills
---

# Code Review: final

**Reviewed:** 2026-03-15
**Scope:** Final code review for the full `oat-cli-doctor-skills` branch range `c53e2181..HEAD`
**Files reviewed:** 25
**Commits:** c53e2181..HEAD

## Summary

The core-pack implementation is broadly in place and the reviewed CLI test suite and type-check both pass on this branch. The remaining blocker is a scope-accounting bug in `oat init tools`: the new `core` pack is installed to user scope, but the shared scope map still records it as project scope, which produces incorrect AGENTS output and wrong sync guidance.

Artifacts used for this review: `discovery.md`, `plan.md`, `implementation.md`, and the prior final review findings recorded in `implementation.md`.

## Findings

### Critical

None.

### Important

- **`oat init tools` misreports the core pack as project-scoped and can skip the required user-sync instruction** (`packages/cli/src/commands/init/tools/index.ts:158`, `packages/cli/src/commands/init/tools/index.ts:174`, `packages/cli/src/commands/init/tools/index.ts:381`, `packages/cli/src/commands/init/tools/index.ts:528`)
  - Issue: `resolvePackScopes()` treats every non-user-eligible pack as project-scoped, which includes `core`. Later, `installCore()` correctly writes to `userRoot`, but `packScopeInfo` and `hasUserScope` still consume the stale `packScopes.core = 'project'` value. That makes `buildToolPacksSectionBody()` omit the `core` pack from the user-scoped section and makes `reportSuccess()` recommend only `oat sync --scope project` when `core` is the only user-scoped install.
  - Impact: a normal `oat init tools` run can leave users without the follow-up `oat sync --scope user` instruction even though `oat-docs` and `oat-doctor` were installed under `~/.agents/skills/`. The generated AGENTS section also lies about where the core pack was installed.
  - Fix: model `core` as always-`user` in the shared scope map, or override `packScopeInfo`/`hasUserScope` to use the actual install target for `core`. Add a regression test that asserts `core` is marked user-scoped in the generated AGENTS section and that the success output includes the user-sync instruction when only `core` is selected.

### Medium

None.

### Minor

None.

## Deferred Findings Disposition

- Deferred Medium count: 0
- Deferred Minor count: 2
- `m2` (`install-core.ts` uses a single `docsStatus` summary) remains acceptable. The current simplification does not hide required behavior for this pack.
- `m3` (`oat-doctor` hardcodes its manifest list inline) remains acceptable. The drift risk is real but low, and it does not create an immediate behavior regression in this branch.

## Spec/Design Alignment

### Requirements Coverage

| Requirement  | Status      | Notes                                                                                                             |
| ------------ | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| D1 / p02-t04 | partial     | Core is installed at user scope, but the orchestration layer still reports it as project-scoped in AGENTS/output. |
| D3 / p04-t02 | implemented | `oat tools update --pack core` refreshes bundled docs into `~/.oat/docs/`.                                        |
| D8 / Phase 3 | implemented | `oat-doctor` and `oat-docs` were rewritten to follow the OAT skill template conventions.                          |

### Extra Work (not in requirements)

- The reviewed branch also contains the rebased research-pack/help-text changes from PR #75 and the follow-up documentation refresh commits.

## Verification Commands

- `git log --oneline c53e2181..HEAD`
- `git diff --name-only origin/main..HEAD`
- `pnpm --filter @oat/cli type-check`
- `pnpm --filter @oat/cli test`
- `sed -n '150,360p' packages/cli/src/commands/init/tools/index.ts`
- `sed -n '360,620p' packages/cli/src/commands/init/tools/index.ts`
- `pnpm --filter @oat/cli exec tsx -e "import { buildToolPacksSectionBody } from './src/commands/init/tools/index.ts'; console.log(buildToolPacksSectionBody([{pack:'core',scope:'project'},{pack:'workflows',scope:'project'}]));"`

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.
