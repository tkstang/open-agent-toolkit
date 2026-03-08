---
oat_generated: true
oat_generated_at: 2026-03-07
oat_review_scope: final
oat_review_type: code
oat_project: /Users/thomas.stang/Code/open-agent-toolkit/.worktrees/open-agent-toolkit/auto-apply-dry-run/.oat/projects/shared/auto-apply-dry-run
---

# Code Review: final

**Reviewed:** 2026-03-07
**Scope:** Final branch review for the `--apply` -> `--dry-run` CLI convention flip
**Files reviewed:** 78
**Commits:** `b803d39e18b5ced5b0a6a1572b9cf7fd4d7afac7..HEAD`

## Summary

The command and test refactor is largely consistent, and the CLI test suite still passes (`104` files, `793` tests). The remaining problems are rollout gaps: one active bootstrap script still invokes the removed `--apply` flag, and several shipped guidance surfaces still tell users to run commands that now fail.

## Findings

### Critical

None.

### Important

1. `package.json:27` still defines `worktree:init` as `pnpm install && pnpm run build && pnpm run cli -- sync --scope project --apply`. This branch removes `--apply`, so the documented worktree bootstrap flow now fails at the final step with `error: unknown option '--apply'`. Because `AGENTS.md` instructs contributors to run `pnpm run worktree:init` after creating or switching worktrees, this is a live regression in a primary setup path.

### Medium

1. `apps/oat-docs/docs/cli/provider-interop/config.md:60` and `apps/oat-docs/docs/cli/provider-interop/providers.md:32,48` still instruct users to run `oat sync ... --apply`. Those pages are part of the docs app, so the shipped documentation now contradicts the new CLI contract and sends readers to a command that exits with `unknown option '--apply'`.

2. `tools/git-hooks/pre-commit:7` still tells users to recover drift with `oat sync --apply --scope project`. The hook itself still runs, but the remediation it prints is no longer valid on this branch, so users responding to the warning will hit a failing command instead of clearing drift.

### Minor

1. `.oat/repo/knowledge/architecture.md:183` and `.oat/repo/knowledge/integrations.md:131` still describe sync as an `--apply`-gated workflow. These internal knowledge artifacts are now stale relative to the implemented CLI behavior, which increases the chance of future docs or automation continuing to regenerate the old convention.

## Import-Plan Alignment

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| Flip legacy mutating commands to mutate by default and use `--dry-run` for preview | implemented | Core command plumbing and help output are aligned with the new convention. |
| Update tests for the new convention | implemented | `pnpm --filter @oat/cli test` passed (`104` files / `793` tests). |
| Propagate the convention through user-facing scripts, docs, and guidance | partial | Active bootstrap and guidance surfaces still reference `--apply`, so rollout is incomplete. |

### Extra Work (not in requirements)

None.

## Verification Commands

```bash
pnpm --filter @oat/cli test
pnpm run cli -- sync --help
pnpm run cli -- sync --scope project --apply
rg -n --hidden --glob '!node_modules' --glob '!dist' --glob '!.turbo' --glob '!.git' --glob '!.oat/projects/**' -- '\\-\\-apply' .
```

## Recommended Next Step

Fix the remaining live `--apply` references in active scripts, docs, and hook messaging, then rerun final review. The highest-priority fix is `package.json:27`, because it currently breaks the documented `pnpm run worktree:init` workflow.
