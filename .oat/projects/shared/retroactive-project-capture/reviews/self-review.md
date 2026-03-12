---
oat_generated: true
oat_generated_at: 2026-03-11
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/retroactive-project-capture/
---

# Code Review: oat-project-capture (Final)

**Reviewed:** 2026-03-11
**Scope:** All files changed on `happier-test` branch (unstaged/untracked changes against `main`)
**Files reviewed:** 7
**Commits:** Pre-commit (working tree changes, no commits yet)

## Summary

The `oat-project-capture` skill is well-structured, follows OAT skill conventions consistently, and differentiates clearly from related skills (`oat-project-reconcile` and `oat-project-quick-start`). CLI registration in both `bundle-assets.sh` and `skill-manifest.ts` is correct, and test count assertions are updated. One minor test description string is stale. The skill itself has a few areas where edge case handling could be tightened.

## Findings

### Critical

None

### Important

- **Missing `oat-project-capture` in the `install-workflows.ts` source file** (`packages/cli/src/commands/init/tools/shared/skill-manifest.ts`)
  - Issue: The skill is correctly added to `skill-manifest.ts` (the re-exported source of truth), but the plan task p01-t02 references `install-workflows.ts` as the file to modify. I verified that `skill-manifest.ts` is the actual source of truth and it IS correctly updated there. This is a plan inaccuracy, not a code bug. No action needed on the code side.
  - Fix: N/A - code is correct; plan description was slightly off.

### Minor

- **Stale test description string** (`packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts:81`)
  - Issue: The `it()` description says `'copies all 22 skills, 2 agents, 6 templates, and 2 scripts on fresh install'` but the assertion on line 89 correctly expects 23 skills. The description string was not updated to match.
  - Suggestion: Change the description to `'copies all 23 skills, 2 agents, 6 templates, and 2 scripts on fresh install'`.

- **No `argument-hint` in SKILL.md frontmatter** (`.agents/skills/oat-project-capture/SKILL.md:1-8`)
  - Issue: Some skills include an `argument-hint` field in frontmatter (e.g., `oat-project-quick-start` has `argument-hint: '<project-name>'`). Since `oat-project-capture` infers the name from conversation context and doesn't accept arguments, omitting this is defensible. However, for consistency, it could explicitly note this.
  - Suggestion: Optional. Could add `argument-hint: ''` or leave as-is since the skill truly takes no arguments.

- **Step 0 base branch detection is fragile** (`.agents/skills/oat-project-capture/SKILL.md:93-96`)
  - Issue: The base branch detection uses `git rev-parse --verify main 2>/dev/null && echo main || echo master`. This will fail silently for repos that use a different default branch name (e.g., `develop`, `trunk`). The `oat-project-quick-start` skill avoids this problem by using `oat config get` for project resolution.
  - Suggestion: Consider adding a note that this heuristic covers the common case, or add a fallback to `git remote show origin | grep 'HEAD branch'` for non-standard base branch names.

- **No `PROJECTS_ROOT` resolution** (`.agents/skills/oat-project-capture/SKILL.md:117`)
  - Issue: Step 1 mentions checking `{PROJECTS_ROOT}/{name}` for collisions but `PROJECTS_ROOT` is never resolved. Other skills like `oat-project-quick-start` (lines 73-75) explicitly resolve it via `oat config get projects.root`.
  - Suggestion: Add a `PROJECTS_ROOT` resolution step, either in Step 0 or Step 1, matching the pattern from `oat-project-quick-start`:
    ```bash
    PROJECTS_ROOT="${OAT_PROJECTS_ROOT:-$(oat config get projects.root 2>/dev/null || echo ".oat/projects/shared")}"
    PROJECTS_ROOT="${PROJECTS_ROOT%/}"
    ```

- **Validation fixes in sibling skills are cosmetic only** (`.agents/skills/oat-project-quick-start/SKILL.md:114`, `.agents/skills/oat-project-document/SKILL.md:4`)
  - Issue: These are minor wording improvements bundled with the capture skill work. They are low-risk but represent scope creep from the plan (which only defined 3 tasks, none involving these files).
  - Suggestion: Acceptable as incidental fixes. Consider noting them in the commit message or implementation.md as deviations.

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md`, `plan.md` (quick workflow mode - no spec or design artifacts expected)

### Requirements Coverage

| Requirement                                | Status      | Notes                                                            |
| ------------------------------------------ | ----------- | ---------------------------------------------------------------- |
| Skill-only, no CLI command                 | Implemented | SKILL.md only, no CLI registration beyond distribution           |
| Conversation context is primary input      | Implemented | Step 4 explicitly prioritizes conversation context over commits  |
| Quick-mode scaffold                        | Implemented | Step 3 uses `oat project new --mode quick`                       |
| No plan generation                         | Implemented | Mode assertion blocks plan generation; success criteria confirms |
| Lifecycle state is user-chosen             | Implemented | Step 6 uses AskUserQuestion with recommended default             |
| Name collision check                       | Implemented | Step 1 validates against PROJECTS_ROOT                           |
| Commit SHA references in implementation.md | Implemented | Step 5 specifies commit SHAs per task                            |
| Dashboard refresh                          | Implemented | Step 7 runs `oat state refresh`                                  |
| CLI distribution registration              | Implemented | bundle-assets.sh + skill-manifest.ts both updated                |
| Test count assertions updated              | Implemented | 22 -> 23 in three assertion sites                                |
| Backlog update                             | Implemented | Moved to In Progress with project link                           |
| Differentiation from reconcile             | Implemented | "When NOT to Use" section clearly distinguishes                  |
| Differentiation from quick-start           | Implemented | "When NOT to Use" section clearly distinguishes                  |
| User confirmation of discovery content     | Implemented | Step 4 uses AskUserQuestion after drafting                       |
| `oat_workflow_origin: captured` metadata   | Implemented | Step 3 sets this value                                           |

### Extra Work (not in declared requirements)

- Validation wording fixes in `oat-project-quick-start/SKILL.md` and `oat-project-document/SKILL.md` (cosmetic, low-risk)

## Skill Convention Compliance

| Convention                               | Status | Notes                                                                           |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Frontmatter (name, version, description) | Pass   | All required fields present                                                     |
| `disable-model-invocation: true`         | Pass   | Correctly set                                                                   |
| `user-invocable: true`                   | Pass   | Correctly set                                                                   |
| `allowed-tools` scoped                   | Pass   | Uses `Bash(git:*)` not unrestricted `Bash`                                      |
| Mode Assertion section                   | Pass   | OAT MODE: Capture with blocked/allowed/self-correction/recovery                 |
| Progress Indicators section              | Pass   | Phase banner + [N/N] step format                                                |
| Step numbering (0-based)                 | Pass   | Steps 0-7                                                                       |
| AskUserQuestion at decision points       | Pass   | Used for name (Step 1), discovery validation (Step 4), lifecycle state (Step 6) |
| When to Use / When NOT to Use            | Pass   | Clear differentiation from related skills                                       |
| Prerequisites                            | Pass   | Branch + conversation context requirements stated                               |
| Success Criteria                         | Pass   | 7 checkable criteria listed                                                     |
| Examples section                         | Pass   | Includes both slash-command and conversational examples                         |

## Verification Commands

Run these to verify the implementation:

```bash
# Verify skill passes validation
pnpm oat:validate-skills

# Verify bundle-consistency test passes (manifest <-> bundle-assets.sh sync)
pnpm --filter @oat/cli test -- bundle-consistency

# Verify install-workflows test passes with updated counts
pnpm --filter @oat/cli test -- install-workflows

# Full test suite
pnpm test

# Build to verify skill gets bundled
pnpm build && ls packages/cli/assets/skills/oat-project-capture/SKILL.md

# Lint and type-check
pnpm lint && pnpm type-check
```
