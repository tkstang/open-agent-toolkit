---
oat_generated: true
oat_generated_at: 2026-03-15
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/oat-cli-doctor-skills
---

# Code Review: final (68b72212..HEAD)

**Reviewed:** 2026-03-15
**Scope:** Final review of all 13 tasks across 3 phases
**Files reviewed:** 20
**Commits:** 11 (83173df..355001f)

## Summary

The implementation delivers a well-structured "core" tool pack with two skills (oat-doctor, oat-docs), full CLI integration (types, manifest, installer, subcommand, orchestrator, scan-tools, bundle script), and comprehensive tests. The code follows existing patterns consistently. There are two important findings around help text drift and a missing test for docs update on `oat tools update`, plus minor observations.

## Findings

### Critical

None

### Important

- **Help text for `--pack` in `tools remove` and `tools update` does not mention `core`** (`packages/cli/src/commands/tools/remove/index.ts:68`, `packages/cli/src/commands/tools/update/index.ts:68`)
  - Issue: The `--pack` option description string reads `'Remove all tools in a pack (ideas|workflows|utility)'` and `'Update all tools in a pack (ideas|workflows|utility)'` respectively. The `core` pack is absent from these descriptions even though `VALID_PACKS` on both files now includes `'core'`. Users will not know they can target the core pack by name.
  - Fix: Update the description strings to `'(core|ideas|workflows|utility)'` in both files. Also update the corresponding help-snapshot inline expectations in `help-snapshots.test.ts` (lines 655 and 679).
  - Requirement: Discovery D1 ("core pack infrastructure must integrate with existing `oat init tools` and `oat tools update` flows")

- **`oat tools update --pack core` does not update `~/.oat/docs/`** (architectural gap)
  - Issue: When a user runs `oat tools update --pack core`, the generic `updateTools` flow copies skill directories but has no awareness of the docs directory (`~/.oat/docs/`). The `installCore` function handles docs copying, but `updateTools` only operates on skill/agent assets. Discovery D3 states "oat tools update refreshes docs alongside skills (existing update flow)". Currently, docs are only refreshed when running `oat init tools core` or `oat init tools` (which invokes `installCore`).
  - Fix: Either (a) teach `updateTools` to additionally invoke `installCore`'s docs-copy logic when the target pack is `core`, or (b) document that `oat init tools core` is the canonical way to refresh docs and update the discovery/plan to reflect this decision. Option (a) is preferred for user-facing consistency.
  - Requirement: Discovery D3

### Minor

- **`bundle-assets.sh` docs copy does not guard on directory existence** (`packages/cli/scripts/bundle-assets.sh:71`)
  - Issue: The plan specified a conditional `if [ -d ... ]` guard around the docs copy. The actual implementation uses a bare `cp -R "${REPO_ROOT}/apps/oat-docs/docs/." "${ASSETS}/docs/"` with no guard. If `apps/oat-docs/docs/` is missing (e.g., in a partial clone or stripped archive), the build script will fail with `set -e`.
  - Suggestion: Add an `if [ -d "${REPO_ROOT}/apps/oat-docs/docs" ]; then ... fi` guard, consistent with the plan and the defensive pattern used for scripts below it.

- **`install-core.ts` does not handle the `updated` status for skills that were copied via `copyDirWithVersionCheck`** (edge case clarity)
  - Issue: The `installCore` function correctly buckets `copied`, `updated`, `outdated`, and default into `skipped`. However the `InstallCoreResult.docsStatus` uses `copyDirWithStatus` which returns `'copied' | 'updated' | 'skipped'` but the plan mentioned `copiedDocs: number, updatedDocs: number, skippedDocs: number` as separate numeric counts. The implementation chose a simpler `docsStatus` string instead. This is actually a reasonable simplification, but noting it as a plan deviation that should be acknowledged.
  - Suggestion: No code change needed. Optionally note this in the Deviations from Plan table in `implementation.md`.

- **`oat-doctor` SKILL.md hardcodes the full skill manifest inline** (`.agents/skills/oat-doctor/SKILL.md:149-176`)
  - Issue: The skill lists all workflow/ideas/utility/core skills inline. This will drift as new skills are added to packs. The single source of truth is `skill-manifest.ts`.
  - Suggestion: Accept this as a pragmatic tradeoff for a SKILL.md file (which cannot import TypeScript). Add a comment noting the list should be refreshed when packs change, or reference `oat tools list --json` output instead of a hardcoded list.

## Requirements/Design Alignment

**Evidence sources used:** `discovery.md` (primary), `plan.md` (task details), `implementation.md` (completion tracking)

### Requirements Coverage

| Requirement                                                  | Status                   | Notes                                                                                                                         |
| ------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| D1: New "core" pack (user-level)                             | Implemented              | PackName, CORE_SKILLS, install-core, subcommand, orchestrator all present                                                     |
| D2: Docs resolution ~/.oat/docs/ only                        | Implemented              | oat-docs SKILL.md resolves only from ~/.oat/docs/, blocked on fallback                                                        |
| D3: Docs bundling lazy on init + update                      | Partial                  | Bundling works on `oat init tools` / `oat init tools core`. `oat tools update` does NOT refresh docs (see Important finding). |
| D4: Doctor two modes                                         | Implemented              | Check mode (default) and summary mode (--summary) in SKILL.md                                                                 |
| D5: Doctor output conversational only                        | Implemented              | No report file, inline output only                                                                                            |
| D6: Config explanations from docs bundle                     | Implemented              | Doctor reads from ~/.oat/docs/ with fallback descriptions                                                                     |
| D7: Doctor uses existing CLI commands                        | Implemented              | Uses oat tools list/outdated, oat config list, oat sync --dry-run                                                             |
| D8: Skills follow create-oat-skill                           | Implemented              | Mode assertion, progress banners, bash safety, self-correction protocol present                                               |
| SC: pnpm build/lint/type-check/test pass                     | Implemented per tracking | 983/983 tests per implementation.md                                                                                           |
| Constraint: disable-model-invocation doctor=true, docs=false | Implemented              | Verified in both SKILL.md frontmatters                                                                                        |
| Constraint: user-invocable true for both                     | Implemented              | Verified in both SKILL.md frontmatters                                                                                        |
| Core pack selectable in oat init tools                       | Implemented              | PACK_CHOICES includes core, checked by default                                                                                |
| Core pack always user scope                                  | Implemented              | Orchestrator hardcodes userRoot for core, ignoring userEligibleScope                                                          |
| scan-tools recognizes core                                   | Implemented              | resolveSkillPack checks CORE_SKILLS                                                                                           |
| Bundle consistency test covers core                          | Implemented              | New test case "bundles every core skill"                                                                                      |
| oat tools remove/update accept core                          | Implemented              | VALID_PACKS includes 'core' in both files                                                                                     |

### Extra Work (not in declared requirements)

- `help-snapshots.test.ts` updated for new `tools install` subcommand listing (line 630: `core [options]`). This is a necessary follow-on from adding the core subcommand -- not scope creep.
- `remove/index.ts` and `update/index.ts` VALID_PACKS updated. Necessary integration work, not scope creep.

None of the changes represent scope creep.

## Verification Commands

Run these to verify the implementation:

```bash
# Type-check
pnpm --filter @oat/cli type-check

# Run all CLI tests
pnpm --filter @oat/cli test

# Run specific test suites for this feature
pnpm --filter @oat/cli test -- --reporter verbose install-core.test
pnpm --filter @oat/cli test -- --reporter verbose core/index.test
pnpm --filter @oat/cli test -- --reporter verbose bundle-consistency.test
pnpm --filter @oat/cli test -- --reporter verbose init/tools/index.test

# Lint
pnpm --filter @oat/cli lint

# Build (includes bundle-assets.sh execution)
pnpm build

# Verify docs are bundled after build
ls packages/cli/assets/docs/ 2>/dev/null && echo "Docs bundled" || echo "Docs NOT bundled"

# Verify help text includes core (will show drift)
grep -n 'ideas|workflows|utility' packages/cli/src/commands/tools/remove/index.ts packages/cli/src/commands/tools/update/index.ts
```
