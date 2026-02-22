---
oat_generated: true
oat_generated_at: 2026-02-22
oat_pr_type: project
oat_pr_scope: final
oat_project: .oat/projects/shared/oat-instructions-validate-sync
---

# PR: oat-instructions-validate-sync

## Summary

Adds a new `oat instructions` command group to validate and repair AGENTS.md to CLAUDE.md pointer integrity across the repository. The implementation ships `oat instructions validate` (read-only integrity checks) and `oat instructions sync` (dry-run by default with optional apply/force writes), plus registration and integration coverage. Final review findings were fully addressed in Phase 3, and final re-review is marked `passed`.

This project ran in `import` workflow mode, so requirements and architecture are grounded in the imported plan plus implementation outcomes rather than full spec/design phase artifacts.

## Goals / Non-Goals

### Goals
- Add deterministic CLI validation for AGENTS.md sibling CLAUDE.md pointer integrity.
- Add repair workflow with safe dry-run default and explicit apply/force semantics.
- Ensure CI and local workflows can detect/fix drift with text and JSON outputs.

### Non-Goals
- Expanding validation/sync to provider-specific instruction files beyond AGENTS.md/CLAUDE.md.
- Reworking existing `oat sync` provider-view synchronization responsibilities.

## What Changed

### Phase 1: Command foundations
- Added shared instructions types and DI contracts.
- Added scanner/utilities for recursive discovery, exclusions, CRLF normalization, payload/report construction.
- Implemented `oat instructions validate` with exit-code and JSON/text behavior.

### Phase 2: Sync + registration + integration
- Implemented `oat instructions sync` with dry-run/apply and `--force` mismatch handling.
- Registered `instructions` parent command with `validate` and `sync` subcommands.
- Added integration tests for missing->create->ok flow, mismatch skip/force flows, exclusions, symlink safety, and CRLF acceptance.

### Phase 3: Final review-fix tasks
- Added optional scanner debug callback logging for read/stat error paths.
- Added help snapshot coverage for `instructions`, `instructions validate`, and `instructions sync`.

### Git context
- Range: `b31c0776ab8136abf00ca25294cf555405c206c5..HEAD`
- Commits: 12
- Diffstat: `20 files changed, 3044 insertions(+)`

## Verification

- `pnpm --filter @oat/cli test`
- `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts`
- `pnpm --filter @oat/cli exec vitest run src/commands/help-snapshots.test.ts`
- `pnpm --filter @oat/cli exec vitest run src/commands/instructions/validate/validate.test.ts`
- `pnpm --filter @oat/cli exec vitest run src/commands/instructions/sync/sync.test.ts`
- `pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.integration.test.ts`
- `pnpm lint && pnpm type-check`
- `pnpm build && pnpm run cli -- instructions validate`

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| final | code | passed | 2026-02-22 | reviews/final-review-2026-02-22.md |

## References

- Plan: `.oat/projects/shared/oat-instructions-validate-sync/plan.md`
- Implementation: `.oat/projects/shared/oat-instructions-validate-sync/implementation.md`
- State: `.oat/projects/shared/oat-instructions-validate-sync/state.md`
- Imported source: `.oat/projects/shared/oat-instructions-validate-sync/references/imported-plan.md`
- Reviews: `.oat/projects/shared/oat-instructions-validate-sync/reviews/`
