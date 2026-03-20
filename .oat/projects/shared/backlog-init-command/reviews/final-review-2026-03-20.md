---
oat_generated: true
oat_generated_at: 2026-03-20
oat_review_scope: final
oat_review_type: code
oat_project: /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/backlog-init-command
---

# Code Review: final

**Reviewed:** 2026-03-20
**Scope:** Final code review for `a9e5cd84f298baf8bb61214bc4ba85db03250d19..HEAD` in quick mode (`p01-t01`, `p01-t02`, `p02-t01`)
**Files reviewed:** 9
**Commits:** `a9e5cd84f298baf8bb61214bc4ba85db03250d19..HEAD` (8 commits in scope)

## Summary

I reviewed the quick-mode artifacts (`discovery.md`, `plan.md`, `implementation.md`, `state.md`) and the scoped CLI/test changes. The feature is mostly aligned with the discovery and plan, but the scaffold currently omits tracked placeholders for the empty `items/` and `archived/` directories, which means a freshly initialized backlog does not survive a commit/clone round-trip and `oat backlog regenerate-index` then fails with `ENOENT`. I also found a command-level verification gap: the helper is tested, but the actual `oat backlog init` action path and its text/JSON output contract are not covered by automated tests.

## Findings

### Critical

- **Empty backlog directories are not persisted in git, breaking cloned scaffolds** (`packages/cli/src/commands/backlog/init.ts:69`)
  - Issue: `initializeBacklog()` creates `items/` and `archived/` as empty directories but does not seed tracked placeholders such as `.gitkeep`. In practice, `oat backlog init` only leaves `index.md` and `completed.md` as tracked files; after committing and cloning that repo, the empty directories disappear and `oat backlog regenerate-index` fails with `ENOENT` because `.oat/repo/reference/backlog/items` is gone. That violates the quick-mode goal of creating the canonical local backlog scaffold and the success criterion that freshly scaffolded backlogs work with existing backlog commands.
  - Fix: Create `items/.gitkeep` and `archived/.gitkeep` when seeding a fresh scaffold, without overwriting existing directory contents. Add a regression test that proves a committed/cloned initialized backlog still has the canonical directory shape and that `oat backlog regenerate-index` succeeds without rerunning `oat backlog init`.
  - Requirement: Discovery success criteria "creates `.oat/repo/reference/backlog/`, `items/`, `archived/`, `index.md`, and `completed.md`" and "Freshly scaffolded backlog roots work with existing backlog commands such as `oat backlog regenerate-index`"

### Important

- **`oat backlog init` command wiring and output contract are untested** (`packages/cli/src/commands/backlog/index.ts:66`)
  - Issue: The scoped tests exercise `initializeBacklog()` directly and cover help snapshots, but nothing executes the actual Commander action added in `createBacklogCommand()`. That leaves default root resolution, `--backlog-root`, exit-code behavior, and the plan-required text/JSON output contract unverified. This repo already uses command-level harness tests for comparable CLI surfaces, so the omission is notable.
  - Fix: Add a command-level test file for the backlog command group that runs `backlog init` through Commander with injected dependencies and asserts default root resolution, `--backlog-root` override behavior, text output, JSON payload `{ status: 'ok', backlogRoot }`, and `process.exitCode`.

### Minor

None

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md`, `plan.md`, `implementation.md`, `state.md`, `packages/cli/src/commands/backlog/index.ts`, `packages/cli/src/commands/backlog/init.ts`, `packages/cli/src/commands/backlog/init.test.ts`, `packages/cli/src/commands/backlog/regenerate-index.test.ts`, `packages/cli/src/commands/help-snapshots.test.ts`

**Design alignment:** Not applicable (`design.md` is not present for quick mode).

### Requirements Coverage

| Requirement                                                                                         | Status      | Notes                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add an explicit `oat backlog init` subcommand under the backlog CLI group                           | implemented | Registered in `createBacklogCommand()` and exposed in help snapshots.                                                                                           |
| Create the canonical backlog scaffold when missing                                                  | partial     | Root, `items/`, `archived/`, `index.md`, and `completed.md` are created, but the empty directories are not trackable in git because no placeholders are seeded. |
| Seed starter files with the managed index markers and expected starter sections                     | implemented | `index.md` and `completed.md` starter content matches the current backlog headings and marker contract.                                                         |
| Re-running the scaffold must be idempotent and preserve curated content                             | implemented | `writeFileIfMissing()` keeps existing file contents intact; helper tests cover rerun preservation.                                                              |
| Freshly scaffolded backlogs must work with existing commands such as `oat backlog regenerate-index` | partial     | Works in a temp directory before commit, but a committed/cloned empty backlog loses `items/` and then `regenerate-index` fails until `init` is rerun.           |
| `oat backlog init` should report the backlog root in text and JSON modes                            | implemented | The action logs both formats, but there is no command-level regression coverage for this contract yet.                                                          |

### Extra Work (not in declared requirements)

None

## Verification Commands

Run these to verify the implementation:

```bash
pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts src/commands/backlog/regenerate-index.test.ts src/commands/help-snapshots.test.ts
pnpm type-check
tmp=$(mktemp -d) && repo="$tmp/repo" && clone="$tmp/clone" && git init -q "$repo" && (cd "$repo" && git config user.email review@example.com && git config user.name reviewer) && pnpm run cli -- --cwd "$repo" backlog init && (cd "$repo" && git add . && git commit -qm init) && git clone -q "$repo" "$clone" && pnpm run cli -- --cwd "$clone" backlog regenerate-index
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.
