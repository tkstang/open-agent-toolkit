---
oat_generated: true
oat_generated_at: 2026-03-20
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/docs-pack-split
---

# Code Review: final (595435e2..HEAD)

**Reviewed:** 2026-03-20
**Scope:** Final review of all four tasks (p01-t01, p01-t02, p02-t01, p02-t02)
**Files reviewed:** 38
**Commits:** 8 (983e23bc..0b07f98e)

## Summary

The implementation is solid and complete. All four planned tasks have been executed: the `docs` pack exists as a first-class CLI concept, pack scanning/update/remove/help surfaces recognize it, the shared tracking helper has been relocated to a neutral path, and documentation has been updated throughout. One minor stale description string was found in the init-tools PACK_DESCRIPTIONS constant. All 116 task-owned tests pass; lint and type-check are clean.

## Findings

### Critical

None

### Important

None

### Minor

- **Stale utility pack description in PACK_DESCRIPTIONS** (`packages/cli/src/commands/init/tools/index.ts:332`)
  - Issue: The `utility` entry in `PACK_DESCRIPTIONS` reads `'Standalone utilities (reviews, docs analysis, agent instructions)'` but docs analysis and agent instructions skills have been moved to the `docs` pack. The parenthetical no longer matches the actual `UTILITY_SKILLS` contents (`create-agnostic-skill`, `oat-repo-maintainability-review`, `oat-review-provide`, `oat-review-receive`, `oat-review-receive-remote`).
  - Suggestion: Update to something like `'Standalone utilities (skill authoring, maintainability review, code reviews)'` to match the actual pack contents. This string is rendered into the AGENTS.md tool-packs section for every project that runs `oat init tools`.

- **Incomplete pack enum in oat-doctor SKILL.md** (`.agents/skills/oat-doctor/SKILL.md:89`)
  - Issue: The JSON parsing guidance says `pack (core/ideas/workflows/utility/custom)` but the actual `PackName` type includes `docs`, `project-management`, and `research`. While `docs` is part of this PR's scope, the missing `project-management` and `research` entries predate this change.
  - Suggestion: Update the line to `pack (core/docs/ideas/workflows/utility/project-management/research/custom)` to match the current `PackName` type union. At minimum, adding `docs` is in scope for this PR.

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md`, `plan.md`, `implementation.md` (quick workflow mode; no spec or design artifacts)

### Requirements Coverage

| Requirement                                                                    | Status      | Notes                                                                                                                          |
| ------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `docs` pack exists and can be installed same as other packs                    | implemented | `DOCS_SKILLS` manifest, installer command, `oat init tools docs`, `oat tools install docs` all work                            |
| Four analyze/apply skills recognized as `docs` pack by scan/list/update/remove | implemented | `resolveSkillPack` in `scan-tools.ts` checks `DOCS_SKILLS`; update/remove `VALID_PACKS` include `docs`                         |
| Moved skills no longer depend on internal helper path in another pack          | implemented | All skill SKILL.md files reference `.oat/scripts/resolve-tracking.sh`; old path has zero matches in skill/CLI files            |
| End-user docs and help snapshots consistently describe the new pack layout     | implemented | Help snapshots pass; docs pages updated; README updated                                                                        |
| `oat-docs` remains in `core`                                                   | implemented | `CORE_SKILLS` still contains `oat-docs`; `DOCS_SKILLS` does not                                                                |
| Pack is user-eligible (project or user scope)                                  | implemented | `USER_ELIGIBLE_PACKS` set includes `docs`; `PACK_CHOICES` marks it `[project\|user]`                                           |
| Legacy `oat remove skills --pack docs` supported                               | implemented | `PACK_SKILLS` map and `isPackName` guard both include `docs`                                                                   |
| Shared helper at neutral location                                              | implemented | `.oat/scripts/resolve-tracking.sh` exists; bundled via `bundle-assets.sh`; installed by both workflow and docs pack installers |
| No hidden cross-pack runtime dependency                                        | implemented | `DOCS_SCRIPTS` explicitly installs `resolve-tracking.sh` alongside docs skills                                                 |
| Help text updated for update/remove commands                                   | implemented | `--pack` help strings include `docs`; inline snapshot tests pass                                                               |
| Bundle consistency maintained                                                  | implemented | `bundle-consistency.test.ts` covers docs skills; orphan check includes `DOCS_SKILLS` in the union                              |
| Docs pages reflect new pack model                                              | implemented | `tool-packs.md`, `getting-started.md`, `cli-reference.md`, `quickstart.md`, `workflows.md` all updated                         |

### Extra Work (not in declared requirements)

- Updated `oat-doctor` SKILL.md pack inventory and examples (not explicitly in plan, but clearly within the discovery's "CLI and docs stay aligned" success criterion).
- Removed stale symlink at `.agents/skills/oat-agent-instructions-apply/scripts/resolve-tracking.sh` (cleanup needed for docs build to pass; reasonable scope inclusion).

Both are minor scope additions that support the declared success criteria. No significant scope creep.

## Verification Commands

Run these to verify the implementation:

```bash
# Run all task-owned tests (116 tests across 10 files)
cd /Users/thomas.stang/.codex/worktrees/1096/open-agent-toolkit && pnpm --filter @oat/cli exec vitest run src/commands/init/tools/docs/install-docs.test.ts src/commands/init/tools/docs/index.test.ts src/commands/init/tools/index.test.ts src/commands/init/tools/shared/bundle-consistency.test.ts src/commands/tools/shared/scan-tools.test.ts src/commands/tools/list/list-tools.test.ts src/commands/tools/update/update-tools.test.ts src/commands/tools/remove/remove-tools.test.ts src/commands/remove/skills/remove-skills.test.ts src/commands/help-snapshots.test.ts

# Lint and type-check
cd /Users/thomas.stang/.codex/worktrees/1096/open-agent-toolkit && pnpm --filter @oat/cli lint && pnpm --filter @oat/cli type-check

# Verify no stale old helper path references remain
cd /Users/thomas.stang/.codex/worktrees/1096/open-agent-toolkit && rg -n "oat-agent-instructions-analyze/scripts/resolve-tracking" .agents/skills packages/cli/scripts .oat/scripts

# Verify docs build passes
cd /Users/thomas.stang/.codex/worktrees/1096/open-agent-toolkit && pnpm build:docs

# Verify no stale utility-pack docs references
cd /Users/thomas.stang/.codex/worktrees/1096/open-agent-toolkit && rg -n "utility pack installs|installed via the utility pack|oat init tools utility" README.md apps/oat-docs/docs .agents/skills
```
