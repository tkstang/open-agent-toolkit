---
oat_generated: true
oat_generated_at: 2026-03-07
oat_pr_type: project
oat_pr_scope: final
oat_project: .oat/projects/shared/auto-apply-dry-run
---

# feat: flip CLI mutability convention from --apply to --dry-run

## Summary

Unifies all OAT CLI mutating commands under a single convention: **mutate by default, `--dry-run` to preview**. Previously, 6 legacy commands used `--apply` (dry-run by default) while 2 newer `oat tools` commands already used `--dry-run` (mutate by default) per ADR-014. This completes the deferred unification — purely mechanical, no behavior changes beyond default semantics.

This is a **breaking change** (pre-1.0 clean break): `--apply` is removed entirely with no deprecation period.

## Changes

### Phase 1: Core CLI Refactor (7 tasks)
- Renamed `GlobalOptions.apply` / `CommandContext.apply` → `dryRun` in shared command infrastructure
- Flipped 6 commands from `--apply` to `--dry-run`: `sync`, `instructions sync`, `remove skill`, `remove skills`, `cleanup artifacts`, `cleanup project`
- Updated `SyncJsonPayload.apply: boolean` → `SyncJsonPayload.dryRun: boolean` (inverted semantics)
- Removed `--apply` from 3 auto-sync subprocess callers (`tools install`, `tools update`, `tools remove`)
- Updated 8 user-facing guidance strings across init, doctor, instructions validate, and hook engine

### Phase 2: Test Updates (2 tasks)
- Updated 34 test files for the new convention
- All `CommandContext` mocks: `apply: false` → `dryRun: false`
- Apply tests: removed `--apply` flag (now default); dry-run tests: added `--dry-run` flag
- JSON assertions: `apply: true/false` → `dryRun: false/true`
- 793 tests passing across 104 test files

### Phase 3: Documentation & Reference Updates (3 tasks)
- Updated 9 user-facing doc files (README, quickstart, troubleshooting, CLI docs)
- Updated 8 skill/agent doc files (reference-architecture, skills-guide, create-skill, bootstrap)
- Updated `packages/cli/AGENTS.md` convention description
- Moved backlog item to completed archive
- Updated `current-state.md` with new convention

### Review Fixes
- Fixed `package.json` `worktree:init` script (was passing `--apply`)
- Fixed 2 provider-interop doc pages (`config.md`, `providers.md`)
- Fixed pre-commit hook remediation message
- Updated 2 knowledge artifacts (`architecture.md`, `integrations.md`)

## Breaking Changes

| Change | Impact |
|--------|--------|
| `--apply` flag removed | External scripts using `--apply` get Commander "unknown option" error |
| JSON output `apply` → `dryRun` | `SyncJsonPayload.apply: boolean` replaced by `dryRun: boolean` (inverted) |
| Default behavior flipped | Commands now mutate by default; use `--dry-run` to preview |

## Verification

- `pnpm build` — TypeScript compiles
- `pnpm type-check` — no type errors
- `pnpm test` — 793/793 tests passing (104 test files)
- `pnpm lint` — clean
- `rg --apply` — zero remaining references in active codebase

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| final | code | passed | 2026-03-07 | reviews/final-review-2026-03-07-v2.md |

## Stats

- 86 files changed, +1484 / -285 lines
- 11 commits (6 implementation + 5 bookkeeping)

## References

- Plan: [plan.md](https://github.com/tkstang/open-agent-toolkit/blob/auto-apply-dry-run/.oat/projects/shared/auto-apply-dry-run/plan.md)
- Implementation: [implementation.md](https://github.com/tkstang/open-agent-toolkit/blob/auto-apply-dry-run/.oat/projects/shared/auto-apply-dry-run/implementation.md)
- Imported Source: [references/imported-plan.md](https://github.com/tkstang/open-agent-toolkit/blob/auto-apply-dry-run/.oat/projects/shared/auto-apply-dry-run/references/imported-plan.md)
- Reviews: [reviews/](https://github.com/tkstang/open-agent-toolkit/tree/auto-apply-dry-run/.oat/projects/shared/auto-apply-dry-run/reviews)
