---
oat_generated: true
oat_generated_at: 2026-02-22
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/b15-b02-project-lifecycle-config-consolidation
---

# Code Review: Final (b31c077..HEAD)

**Reviewed:** 2026-02-22
**Scope:** final -- all 14 tasks (p01-t01 through p11-t02), 15 commits, 62 files changed
**Files reviewed:** 62
**Commits:** cb613bb..1073192 (15 commits)

## Summary

The implementation is well-structured and closely follows the imported plan. Config infrastructure, lifecycle commands (open/pause), dashboard updates, CLI consumer migration, and skill batch migration are all delivered with good test coverage. The main gaps are: (1) descriptive/documentation text in skills still references `.oat/active-project` as the storage location despite code snippets being correctly migrated, (2) `removeFrontmatterField` is duplicated across open and pause commands instead of being exported from the shared frontmatter-write module, and (3) a few minor test coverage gaps for edge cases specified in the plan.

## Findings

### Critical

None

### Important

- **Stale `.oat/active-project` documentation text in 18+ skill files** (multiple skill SKILL.md files)
  - Issue: While all bash code snippets were correctly migrated from `cat .oat/active-project` to `oat config get activeProject`, the descriptive/documentation text in many skills still references `.oat/active-project` as the storage location. For example:
    - `.agents/skills/oat-project-implement/SKILL.md:68` -- "OAT stores the active project path in `.oat/active-project` (single line, local-only)."
    - `.agents/skills/oat-project-new/SKILL.md:12` -- "scaffold standard artifacts from `.oat/templates/`, and set `.oat/active-project`."
    - `.agents/skills/oat-project-new/SKILL.md:59` -- "Active project pointer set: `.oat/active-project`"
    - `.agents/skills/oat-project-new/SKILL.md:69` -- success criteria references `.oat/active-project`
    - `.agents/skills/oat-project-discover/SKILL.md:67,92`
    - `.agents/skills/oat-project-spec/SKILL.md:69`
    - `.agents/skills/oat-project-plan/SKILL.md:79`
    - `.agents/skills/oat-project-design/SKILL.md:37`
    - `.agents/skills/oat-project-progress/SKILL.md:102`
    - `.agents/skills/oat-project-review-provide/SKILL.md:79,94`
    - `.agents/skills/oat-project-review-receive/SKILL.md:59`
    - `.agents/skills/oat-project-pr-final/SKILL.md:23,83`
    - `.agents/skills/oat-project-pr-progress/SKILL.md:23,81`
    - `.agents/skills/oat-project-import-plan/SKILL.md:179,207`
    - `.agents/skills/oat-project-quick-start/SKILL.md:80`
    - `.agents/skills/oat-project-subagent-implement/SKILL.md:116`
    - `.agents/skills/create-oat-skill/SKILL.md:19,47,75,76`
    - `.agents/skills/oat-review-provide/SKILL.md:17`
  - Fix: Update these descriptive text references to say `.oat/config.local.json` (or "local config") instead of `.oat/active-project`. The plan (Phase 8) says to update skill snippets, and the functional code was updated, but the surrounding documentation text was not. This creates user confusion since the text tells users one thing while the commands do another.
  - Requirement: Phase 8 / imported plan Phase 7 -- "Update all 22 project-related skills from pointer file reads to `oat config` CLI commands"

- **Stale `.oat/projects-root` documentation in `create-oat-skill`** (`.agents/skills/create-oat-skill/SKILL.md:70`)
  - Issue: Line 70 still lists `.oat/projects-root` as a resolution source. After Phase 10, the legacy fallback was removed from `resolveProjectsRoot()`.
  - Fix: Update the resolution chain documentation in `create-oat-skill/SKILL.md` to list `oat config get projects.root` instead of `.oat/projects-root`.
  - Requirement: Phase 10 / imported plan Phase 9

- **Duplicated `removeFrontmatterField` function** (`packages/cli/src/commands/project/open/index.ts:75` and `packages/cli/src/commands/project/pause/index.ts:71`)
  - Issue: The `removeFrontmatterField` helper is identically defined in both the open and pause command files. Phase 1 extracted shared frontmatter utilities (`upsertFrontmatterField`, `replaceFrontmatter`) into `packages/cli/src/commands/shared/frontmatter-write.ts`, but `removeFrontmatterField` was not included.
  - Fix: Export `removeFrontmatterField` from `packages/cli/src/commands/shared/frontmatter-write.ts` and import it in both open and pause command files. This follows the same pattern established in Phase 1.
  - Requirement: Phase 1 -- "Move helper implementations... and update imports" / general DRY principle

### Minor

- **Missing test: `oat config get` unknown key returns exit code 1** (`packages/cli/src/commands/config/index.test.ts`)
  - Issue: The plan specifies "Exit 1 if key is unrecognized" and the implementation correctly does this (`runGet` catches the error and sets `process.exitCode = 1`). However, there is no explicit test for calling `get` with an unknown key.
  - Suggestion: Add a test like `it('errors for unknown config key', ...)` that calls `get` with `'unknownKey'` and asserts `process.exitCode === 1` and the error message contains "Unknown config key".

- **Missing test: `oat config get projects.root` legacy `.oat/projects-root` fallback** (`packages/cli/src/commands/config/index.test.ts`)
  - Issue: The plan explicitly lists "get `projects.root` falls back to `.oat/projects-root` file when config.json has no value" as a test case. This test is missing. Note: after Phase 10 the legacy fallback was removed from `resolveProjectsRoot()`, so this test may no longer be applicable. The current `resolveProjectsRootWithSource` calls `resolveProjectsRoot` as a fallback which returns the default. If the plan intended the fallback to exist during intermediate phases and be removed later, the absence is acceptable. However, the plan's test specification was not updated to reflect the removal.
  - Suggestion: Either add a test confirming `projects.root` returns the default `.oat/projects/shared` when config.json is absent (this is partially covered by the list test), or update the plan's test specifications to reflect the removal of legacy fallback.

- **`.oat/active-project` file still present** (`.oat/active-project`)
  - Issue: The file `.oat/active-project` still exists in the repo with content `.oat/projects/shared/b15-b02-project-lifecycle-config-consolidation`. It was also removed from `.gitignore`. While the imported plan explicitly says "Don't delete existing `.oat/active-project` files from users -- they just become inert", having this file present alongside the new config system without a gitignore entry means it could be accidentally committed in the future.
  - Suggestion: Either add `.oat/active-project` back to `.gitignore` (as an inert legacy file) or explicitly document in the PR description that it is intentionally left as an inert artifact. The imported plan's Phase 9b says "Remove `.oat/active-project` entry (file no longer created)" which was done, but also says "they just become inert" -- an inert file that is no longer gitignored could be accidentally committed.

- **`oat-project-subagent-implement` not in changed files list** (`.agents/skills/oat-project-subagent-implement/SKILL.md:116`)
  - Issue: This skill references `.oat/active-project` at line 116 ("Resolve active project from `.oat/active-project`") but was not included in the batch migration (Phase 8). It was listed in the imported plan's skill migration list.
  - Suggestion: Verify whether this skill's code snippets also need migration, or if it delegates to a migrated skill and only the documentation text needs updating.

## Requirements/Design Alignment

**Evidence sources used:** plan.md (normalized imported plan), references/imported-plan.md (original imported plan), implementation.md, state.md

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| p01-t01: Extract shared frontmatter write utilities | implemented | `frontmatter-write.ts` created with `upsertFrontmatterField` + `replaceFrontmatter`; tests pass. `removeFrontmatterField` not extracted (see Important finding). |
| p02-t01: Config types and read/write/active-project helpers | implemented | `oat-config.ts` with all specified interfaces and functions; good test coverage including round-trip, normalization, resolve/set/clear. |
| p02-t02: Projects-root resolution chain and gitignore | implemented | `resolveProjectsRoot` updated with env -> config -> default precedence; `.oat/config.local.json` added to gitignore. |
| p03-t01: `oat config get/set/list` commands | implemented | All three subcommands with key routing, JSON output, null coercion. Registered in root command. |
| p04-t01: `oat project open` | implemented | Full behavior: switch messaging, pause resume, validation, dashboard refresh, JSON mode. |
| p05-t01: `oat project pause` | implemented | Pointer clearing conditional on active match, reason persistence, `lastPausedProject` tracking. |
| p06-t01: Dashboard config-local and pause awareness | implemented | `readActiveProject` reads from config.local.json; pause-aware next-step; `lastPausedProject` resume guidance; quick commands updated. |
| p07-t01: Migrate project new/set-mode | implemented | `scaffold.ts` uses `setActiveProject()`; `set-mode` reads from `readOatLocalConfig()`. |
| p07-t02: Migrate cleanup/install-workflows | implemented | Cleanup reads from config.local.json; install-workflows writes to config.json alongside legacy file. |
| p08-t01: Batch migrate skills | partial | Code snippets migrated; descriptive text still references `.oat/active-project` in 18+ skills (see Important finding). |
| p09-t01: Worktree bootstrap propagation | implemented | Skill updated to copy `.oat/config.local.json` + `.oat/active-idea`. |
| p10-t01: Remove legacy pointer fallbacks | implemented | `resolveProjectsRoot` no longer reads `.oat/projects-root`; `.oat/active-project` removed from gitignore; clear/open skills simplified to command delegation. |
| p11-t01: ADR-012 and ADR-013 | implemented | Both ADRs present in decision-record.md with correct content. |
| p11-t02: Full verification and backlog follow-up | implemented | Verification checklist complete; active-idea migration added to backlog inbox. |

### Extra Work (not in declared requirements)

None. All changes map to plan tasks.

## Verification Commands

```bash
# Full CLI test suite
pnpm --filter @oat/cli test

# Build + lint + type-check
pnpm build && pnpm lint && pnpm type-check

# Skill validation
pnpm oat:validate-skills

# Check for remaining pointer-file code usage in skills (should return 0 matches)
rg -n "cat \.oat/(active-project|projects-root)" .agents/skills

# Check for stale documentation references to .oat/active-project in skills
rg -n "\.oat/active-project" .agents/skills --count

# Verify duplicated removeFrontmatterField (should show exactly 2 matches)
rg -n "function removeFrontmatterField" packages/cli/src
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.
