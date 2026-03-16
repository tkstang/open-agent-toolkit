---
oat_generated: true
oat_generated_at: 2026-03-16
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/local-project-management
---

# Code Review: final

**Reviewed:** 2026-03-16
**Scope:** All 19 tasks (p01-t01 through p05-t04) across 5 phases
**Files reviewed:** 50
**Commits:** 39 (48c0874 through 50105f0)

## Summary

The implementation faithfully delivers all 13 scope items from `discovery.md` with solid code quality, good test coverage, and clean architectural alignment. The backlog directory structure, CLI tooling, agent skills, skill pack infrastructure, and migration work are all present and well-integrated. There are no critical findings. A small number of important and minor observations are noted below, primarily around edge case handling in the ID generation utility and a minor deviation documentation gap.

## Findings

### Critical

None

### Important

- **4-character hex ID collision risk is undocumented** (`packages/cli/src/commands/backlog/shared/generate-id.ts:1-11`)
  - Issue: The `generateBacklogId` function produces a 4-hex-character hash (65,536 possible values). With ~50-100 backlog items this is fine, but the collision probability grows quickly per the birthday paradox (~50% chance of collision at ~256 items). The discovery doc acknowledges IDs are "generated from filename + creation timestamp" which mitigates same-name collisions, but there is no collision detection or handling anywhere in the creation flow. The `oat-pjm-add-backlog-item` skill does not check for duplicate IDs before writing.
  - Fix: Add a collision check in `oat-pjm-add-backlog-item` SKILL.md Step 3 (after generating the ID, scan existing `items/*.md` frontmatter for a matching `id:` value; if found, append a disambiguator or re-hash with a nonce). Alternatively, document the collision boundary as a known limitation in the template or discovery deferred ideas.
  - Requirement: Discovery key decision #14 (backlog item IDs are short hashes)

- **`oat-pjm-update-repo-reference` skill references `rg` directly instead of using Grep tool** (`.agents/skills/oat-pjm-update-repo-reference/SKILL.md:88-93`)
  - Issue: The Step 4 sanity checks use raw `rg` commands. Per the AGENTS.md convention, skills should use the `Grep` tool rather than invoking `rg` or `grep` directly via Bash. The skill's `allowed-tools` list includes `Bash` and the commands would work, but this contradicts the project's tooling convention and could cause issues in environments where `rg` is not installed.
  - Fix: Rewrite the two `rg` invocations in Step 4 as Grep tool calls, or add a note that these are example commands to be executed via the Grep tool. The old `update-repo-reference` skill had the same pattern, so this is inherited but should be modernized in the new namespace.

### Minor

- **Plan expected 8 active items but migration produced 7 (then 9 after p05-t04)** (`.oat/repo/reference/backlog/index.md`)
  - Issue: The plan (p05-t01) expected 8 active items. The migration found 7 because `oat-project-capture` had already moved to completed. Then p05-t04 added 2 more (staleness, memory), bringing the total to 9. The implementation.md documents the 7-vs-8 deviation but not the final 9-item count in the deviation table.
  - Suggestion: Add a row to the Deviations from Plan table noting the final item count is 9 (7 migrated + 2 from deferred-phases retirement). This is a traceability nit, not a functional issue.

- **`generate-id` CLI subcommand uses `new Date().toISOString()` for timestamp** (`packages/cli/src/commands/backlog/index.ts:86`)
  - Issue: When called from the CLI (`oat backlog generate-id <filename>`), the timestamp is always `new Date().toISOString()` at invocation time. This means calling the command twice for the same filename a second apart produces different IDs. The skill flow (Step 3) calls this command once and uses the result, so this is fine in practice, but the CLI command alone cannot reproduce a known ID without knowing the exact timestamp used. This is by design (discovery: "generated from filename + creation timestamp") but may surprise CLI users who expect deterministic output from the same input.
  - Suggestion: Consider adding an optional `--created-at <timestamp>` flag to the `generate-id` subcommand for reproducibility, or document the non-deterministic behavior in the command help text.

- **Legacy skill `review-backlog` still has `allowed-tools: Task`** (`.agents/skills/review-backlog/SKILL.md:7`)
  - Issue: The deprecated `review-backlog` skill lists `Task` in its allowed-tools, which is also carried over into `oat-pjm-review-backlog`. The `Task` tool reference may be provider-specific and not universally available. This is inherited from the original skill.
  - Suggestion: Verify that `Task` is a valid tool identifier in the target agent environment. If not, remove it from the new `oat-pjm-review-backlog` skill's allowed-tools list.

- **`oat-pjm-review-backlog` references "Explore agent"** (`.agents/skills/oat-pjm-review-backlog/SKILL.md:99`)
  - Issue: Step 3 says "Use the Explore agent for broad codebase exploration if needed." This appears to be carried over from the legacy skill and references an agent that may not exist or be available in all environments.
  - Suggestion: Replace with a reference to the Glob/Grep/Read tools which are listed in allowed-tools, or remove the reference if the Explore agent is not a defined OAT agent.

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md` (primary requirements), `plan.md` (task decomposition), `implementation.md` (verification log)

### Requirements Coverage

| Requirement                              | Status      | Notes                                                                 |
| ---------------------------------------- | ----------- | --------------------------------------------------------------------- |
| 1. Backlog directory restructure         | Implemented | `backlog/index.md`, `completed.md`, `items/`, `archived/` all present |
| 2. Backlog item template                 | Implemented | `.oat/templates/backlog-item.md` matches discovery schema             |
| 3. Backlog index (hybrid)                | Implemented | Managed markers + curated overview section                            |
| 4. Completed log                         | Implemented | `completed.md` with 50 entries, 5 archived items                      |
| 5. Roadmap template                      | Implemented | `.oat/templates/roadmap.md` with Now/Next/Later                       |
| 6. `deferred-phases.md` retirement       | Implemented | File deleted, items migrated to backlog                               |
| 7. `oat-pjm-add-backlog-item` skill      | Implemented | Full workflow with scope_estimate confirmation                        |
| 8. `oat-pjm-update-repo-reference` skill | Implemented | Updated for new backlog structure                                     |
| 9. `oat-pjm-review-backlog` skill        | Implemented | Updated for file-per-item with template                               |
| 10. CLI support                          | Implemented | `oat backlog regenerate-index` and `oat backlog generate-id`          |
| 11. `associated_issues` in state.md      | Implemented | Field added to template and bundled asset                             |
| 12. Existing backlog migration           | Implemented | 7 active items + 2 deferred = 9 total                                 |
| 13. `project-management` skill pack      | Implemented | Manifest, installer, bundle, type, consistency tests                  |

### Constraint Compliance

| Constraint                                        | Status | Notes                                                      |
| ------------------------------------------------- | ------ | ---------------------------------------------------------- |
| Must not break existing OAT project workflows     | Met    | All 1016 tests pass                                        |
| Existing backlog items preserved during migration | Met    | Legacy files have deprecation pointers                     |
| Backlog items cheap to create                     | Met    | Template is minimal, skill guides creation                 |
| Generated index uses managed-section pattern      | Met    | `<!-- OAT BACKLOG-INDEX -->` markers                       |
| Skills conform to `create-oat-skill` conventions  | Met    | Mode assertion, progress banners, semver, success criteria |
| Skills distributed as `project-management` pack   | Met    | Full pack infrastructure in place                          |

### Extra Work (not in declared requirements)

- `tools/remove/index.ts` and `tools/update/index.ts` were updated to accept `project-management` in their `VALID_PACKS` arrays. This is a natural consequence of adding the pack type and is within reasonable scope.
- `packages/cli/src/commands/init/tools/project-management/index.ts` adds a direct `oat tools install project-management` subcommand. This follows the established pattern (ideas, workflows, utility, research all have one) and is within scope.

## Verification Commands

Run these to verify the implementation:

```bash
# Run all tests
pnpm test

# Run targeted tests for changed modules
pnpm --filter @oat/cli test -- src/commands/backlog/shared/generate-id.test.ts src/commands/backlog/regenerate-index.test.ts src/commands/init/tools/project-management/install-project-management.test.ts src/commands/init/tools/shared/bundle-consistency.test.ts

# Verify CLI commands work
pnpm run cli -- backlog regenerate-index --help
pnpm run cli -- backlog generate-id test-item

# Type-check and lint
pnpm type-check
pnpm lint

# Build (includes bundle-assets.sh)
pnpm build

# Verify backlog structure
find .oat/repo/reference/backlog -type f | sort

# Verify deferred-phases.md is deleted
test ! -f .oat/repo/reference/deferred-phases.md && echo "OK: deleted"

# Verify legacy files have deprecation pointers
head -3 .oat/repo/reference/backlog.md
head -3 .oat/repo/reference/backlog-completed.md

# Verify roadmap has Now/Next/Later structure
grep "^## Now\|^## Next\|^## Later" .oat/repo/reference/roadmap.md
```
