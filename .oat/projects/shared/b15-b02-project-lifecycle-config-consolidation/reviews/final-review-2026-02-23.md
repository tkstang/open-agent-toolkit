---
oat_generated: true
oat_generated_at: 2026-02-23
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/b15-b02-project-lifecycle-config-consolidation
---

# Code Review: Final Re-Review (post Phase 12 fixes)

**Reviewed:** 2026-02-23
**Scope:** final re-review -- all 19 tasks (p01-t01 through p12-t05), 23 commits, 67 files changed. Focus on verifying 5 fix tasks (p12-t01 through p12-t05) that addressed 3 Important and 2 Minor findings from prior review.
**Files reviewed:** 67
**Commits:** cb613bb..8f92dc1 (23 commits)
**Prior review:** reviews/final-review-2026-02-22.md

## Summary

All three Important findings and both selected Minor findings from the prior review have been properly resolved. The `removeFrontmatterField` function is now shared from `frontmatter-write.ts` with both `open` and `pause` importing it. All 18+ skill files that had stale `.oat/active-project` documentation text now correctly reference `.oat/config.local.json` / `activeProject` / `oat config get activeProject`. The `create-oat-skill` projects-root resolution docs are updated. An explicit regression test for unknown config key handling is in place. The `oat-project-subagent-implement` skill is migrated. No new Critical or Important issues were introduced by the fixes.

## Prior Review Finding Disposition

| Prior Finding | Severity | Fix Task | Status | Verification |
|---------------|----------|----------|--------|--------------|
| I1: Stale `.oat/active-project` docs in 18+ skills | Important | p12-t01 | **Resolved** | `rg '\.oat/active-project' .agents/skills` returns only 1 match: a grep search pattern in `update-repo-reference/SKILL.md:84` (auditing command, not stale doc text). Spot-checked `oat-project-implement`, `oat-project-new`, `oat-project-discover`, `oat-project-pr-final`, `oat-project-import-plan` -- all now reference `config.local.json` / `activeProject`. |
| I2: Stale `.oat/projects-root` docs in create-oat-skill | Important | p12-t02 | **Resolved** | `create-oat-skill/SKILL.md:70` now reads `oat config get projects.root`. No remaining `.oat/projects-root` documentation references outside auditing grep. |
| I3: Duplicated `removeFrontmatterField` | Important | p12-t03 | **Resolved** | Single definition at `frontmatter-write.ts:32`. Both `open/index.ts:12` and `pause/index.ts:9` import from shared module. Dedicated test at `frontmatter-write.test.ts:91`. |
| m1: Missing unknown config key test | Minor | p12-t04 | **Resolved** | Test at `config/index.test.ts:110` -- asserts `process.exitCode === 1` and error message `'Unknown config key: unknown.key'`. |
| m4: subagent-implement not migrated | Minor | p12-t05 | **Resolved** | `oat-project-subagent-implement/SKILL.md:116` now reads: "Resolve active project via `oat config get activeProject` (stored in `.oat/config.local.json`)". |

### Deferred Findings (carried from prior review, accepted as-is)

| Finding | Severity | Disposition | Rationale |
|---------|----------|-------------|-----------|
| m2: Plan test spec for legacy fallback not updated | Minor | Deferred | Phase 10 intentionally removed fallback; current tests verify config/default behavior. Plan doc drift only. |
| m3: `.oat/active-project` file still present, not gitignored | Minor | Deferred | Imported plan explicitly says "they just become inert". File is intentionally tracked per user request. |

## Findings

### Critical

None

### Important

None

### Minor

None -- all prior findings resolved or explicitly deferred with documented rationale.

## Requirements/Design Alignment

**Evidence sources used:** plan.md (normalized imported plan), references/imported-plan.md (original imported plan), implementation.md, state.md, reviews/final-review-2026-02-22.md (prior review)

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| p01-t01: Extract shared frontmatter write utilities | implemented | Shared module includes `upsertFrontmatterField`, `replaceFrontmatter`, and now `removeFrontmatterField` (added in p12-t03). |
| p02-t01: Config types and read/write/active-project helpers | implemented | Full config utility layer with tests. |
| p02-t02: Projects-root resolution chain and gitignore | implemented | Config-based resolution with env override. |
| p03-t01: `oat config get/set/list` commands | implemented | All subcommands with key routing, JSON output, unknown key error handling (p12-t04 added test). |
| p04-t01: `oat project open` | implemented | Full behavior with shared `removeFrontmatterField` import. |
| p05-t01: `oat project pause` | implemented | Full behavior with shared `removeFrontmatterField` import. |
| p06-t01: Dashboard config-local and pause awareness | implemented | Config-local reads, pause-aware next-step guidance. |
| p07-t01: Migrate project new/set-mode | implemented | Config-backed active project handling. |
| p07-t02: Migrate cleanup/install-workflows | implemented | Config-local reads for cleanup; config.json writes for workflows. |
| p08-t01: Batch migrate skills | implemented | All code snippets AND descriptive text now aligned (p12-t01 completed doc text migration). |
| p09-t01: Worktree bootstrap propagation | implemented | Copies `config.local.json` + `active-idea`. |
| p10-t01: Remove legacy pointer fallbacks | implemented | No fallback code remains; gitignore updated. |
| p11-t01: ADR-012 and ADR-013 | implemented | Both ADRs in decision-record.md. |
| p11-t02: Full verification and backlog follow-up | implemented | Verification checklist complete; active-idea follow-up in backlog. |
| p12-t01: Update stale active-project docs in skills | implemented | All 18+ skills verified clean. |
| p12-t02: Update create-oat-skill projects-root docs | implemented | Resolution chain references `oat config get projects.root`. |
| p12-t03: Extract removeFrontmatterField to shared | implemented | Single shared definition, both consumers import it, dedicated test exists. |
| p12-t04: Unknown config key test | implemented | Explicit test for exit code 1 and error message. |
| p12-t05: Update subagent-implement docs | implemented | References config-local semantics. |

### Extra Work (not in declared requirements)

None. All Phase 12 changes map directly to review-fix tasks.

## Verification Commands

Run these to verify the implementation:

```bash
# Full CLI test suite
pnpm --filter @oat/cli test

# Build + lint + type-check
pnpm build && pnpm lint && pnpm type-check

# Skill validation
pnpm oat:validate-skills

# Verify NO stale pointer-file code usage in skills (should return 0 matches)
rg -n "cat \.oat/(active-project|projects-root)" .agents/skills

# Verify NO stale documentation references to .oat/active-project in skills
# (should return only the auditing grep in update-repo-reference)
rg -n "\.oat/active-project" .agents/skills

# Verify removeFrontmatterField is defined exactly once (should return 1 match)
rg -n "function removeFrontmatterField" packages/cli/src

# Verify open and pause import from shared (should return 2 matches, one per file)
rg -n "removeFrontmatterField" packages/cli/src/commands/project/open/index.ts packages/cli/src/commands/project/pause/index.ts
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert this review into a `passed` status update (no Critical/Important findings remain).
