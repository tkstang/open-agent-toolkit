---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-15
oat_current_task_id: null
oat_generated: false
---

# Implementation: local-project-management

**Started:** 2026-03-15
**Last Updated:** 2026-03-15

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
>
> - `oat_current_task_id` always points at the **next plan task to do** (not the last completed task).
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are **not** plan tasks. Track review status in `plan.md` under `## Reviews` (e.g., `| final | code | passed | ... |`).
> - Keep phase/task statuses consistent with the Progress Overview table so restarts resume correctly.
> - Before running the `oat-project-pr-final` skill, ensure `## Final Summary (for PR/docs)` is filled with what was actually implemented.

## Progress Overview

| Phase   | Status   | Tasks | Completed |
| ------- | -------- | ----- | --------- |
| Phase 1 | complete | 4     | 4/4       |
| Phase 2 | complete | 3     | 3/3       |
| Phase 3 | complete | 3     | 3/3       |
| Phase 4 | complete | 5     | 5/5       |
| Phase 5 | complete | 4     | 4/4       |

**Total:** 19/19 tasks completed

---

## Phase 1: Templates and Directory Structure

**Status:** complete
**Started:** 2026-03-15

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Added reusable templates for backlog items and roadmap horizons.
- Created the new file-backed backlog directory structure with managed index markers.
- Extended project state templates with issue-link tracking for backlog/project/Jira/Linear references.

**Key files touched:**

- `.oat/templates/backlog-item.md` - new backlog item template
- `.oat/templates/roadmap.md` - roadmap horizon template
- `.oat/repo/reference/backlog/index.md` - managed backlog index scaffold
- `.oat/repo/reference/backlog/completed.md` - completed backlog summary scaffold
- `.oat/templates/state.md` - added `associated_issues` field

**Verification:**

- Run: `cat .oat/templates/backlog-item.md | head -20`; `cat .oat/templates/roadmap.md`; `find .oat/repo/reference/backlog -type f | sort`; `grep "associated_issues" .oat/templates/state.md`
- Result: Pass; all phase-1 files and template updates match the planned structure

**Notes / Decisions:**

- The new backlog tree is additive in phase 1; legacy flat backlog files stay in place until the migration phase.

### Task p01-t01: Create backlog item template

**Status:** completed
**Commit:** 48c08748dd9e64541e2d999839170bc803332514

**Outcome (required when completed):**

- Added a reusable backlog item template with the agreed tracking schema and template markers.
- New backlog entries now have explicit description and acceptance-criteria sections to standardize item authoring.

**Files changed:**

- `.oat/templates/backlog-item.md` - added the new file-per-item backlog template

**Verification:**

- Run: `cat .oat/templates/backlog-item.md | head -20`
- Result: Pass; frontmatter and body sections render with the expected schema

**Notes / Decisions:**

- Used the exact field order from the plan so later migration and CLI parsing work can rely on a stable shape.

---

### Task p01-t02: Create roadmap template

**Status:** completed
**Commit:** 12d48e59ea1ccba0105d37b87bd1bc55204ba70b

**Outcome (required when completed):**

- Added a roadmap template with explicit Now/Next/Later horizons for the new backlog model.
- Included inline guidance for backlog-ID based entries so migrated roadmap items can point to file-backed backlog records.

**Files changed:**

- `.oat/templates/roadmap.md` - added the roadmap template and entry formatting guidance

**Verification:**

- Run: `cat .oat/templates/roadmap.md`
- Result: Pass; template contains the expected horizon headings and usage comments

**Notes / Decisions:**

- Kept the template minimal and guidance-focused so migration can preserve current roadmap detail while adopting the new structure.

---

### Task p01-t03: Create backlog directory structure

**Status:** completed
**Commit:** 1cdb035030eafe0a261ae4e736cdf2658b265670

**Outcome (required when completed):**

- Added the new `backlog/` reference tree with tracked active and archived item directories.
- Introduced a managed index section plus a human-curated overview area so CLI regeneration can coexist with hand-authored backlog context.
- Created a completed backlog summary file to support the later migration from the flat archive document.

**Files changed:**

- `.oat/repo/reference/backlog/index.md` - added curated overview plus managed table markers
- `.oat/repo/reference/backlog/completed.md` - added completed-summary scaffold
- `.oat/repo/reference/backlog/items/.gitkeep` - tracked the active item directory
- `.oat/repo/reference/backlog/archived/.gitkeep` - tracked the archived item directory

**Verification:**

- Run: `find .oat/repo/reference/backlog -type f | sort`
- Result: Pass; expected files were created under the new backlog tree

**Notes / Decisions:**

- Seeded the managed table with an explicit empty state so the future regeneration command has a stable replacement target.

---

### Task p01-t04: Add `associated_issues` to state.md template

**Status:** completed
**Commit:** c0990633ec60cda5f39c94153527fca9a6959b72

**Outcome (required when completed):**

- Added an `associated_issues` field to the shared project state template so OAT projects can link backlog items and external trackers.
- Defined the supported reference shape inline to keep future project scaffolds self-documenting.

**Files changed:**

- `.oat/templates/state.md` - added `associated_issues` frontmatter guidance

**Verification:**

- Run: `grep "associated_issues" .oat/templates/state.md`
- Result: Pass; the field is present in the template frontmatter

**Notes / Decisions:**

- Kept the field adjacent to blocker tracking because both are top-level project coordination metadata.

---

## Phase 2: CLI Support

**Status:** complete
**Started:** 2026-03-15

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Added deterministic backlog item ID generation for file-backed entries.
- Added a managed backlog index regeneration implementation that scans item files and rewrites only the generated table block.
- Exposed both capabilities through a top-level `oat backlog` command group for direct CLI use.

**Key files touched:**

- `packages/cli/src/commands/backlog/shared/generate-id.ts` - deterministic ID helper
- `packages/cli/src/commands/backlog/regenerate-index.ts` - managed index regeneration logic
- `packages/cli/src/commands/backlog/index.ts` - CLI command group and subcommands
- `packages/cli/src/commands/index.ts` - top-level command registration

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/backlog/shared/generate-id.test.ts`; `pnpm --filter @oat/cli test -- src/commands/backlog/regenerate-index.test.ts`; `pnpm run cli -- backlog regenerate-index --help`; `pnpm run cli -- backlog generate-id test-item`; `pnpm type-check`
- Result: Pass; helper tests, regeneration tests, command help/output, and type-check all succeeded

**Notes / Decisions:**

- Package-scoped Vitest commands are the reliable path-level test entrypoint in this repo; root-level `pnpm test <path>` is reserved for Turbo task names.

### Task p02-t01: Implement backlog item ID generation utility

**Status:** completed
**Commit:** 7708871b7c4ecaf6bd6cde83f8af20bf387f40a0

**Outcome (required when completed):**

- Added a deterministic backlog ID helper that derives stable `bl-XXXX` identifiers from filename and timestamp inputs.
- Added focused test coverage for ID format, determinism, and input sensitivity so later backlog migration work can reuse the helper safely.

**Files changed:**

- `packages/cli/src/commands/backlog/shared/generate-id.ts` - added the ID generation helper
- `packages/cli/src/commands/backlog/shared/generate-id.test.ts` - added unit tests for the helper

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/backlog/shared/generate-id.test.ts`
- Result: Pass; helper returns stable 4-hex backlog IDs and the scoped test suite passes

**Notes / Decisions:**

- Used a package-scoped Vitest invocation because the repo-root `pnpm test <path>` form is interpreted by Turbo as a task name rather than a file filter.

---

### Task p02-t02: Implement backlog index regeneration command

**Status:** completed
**Commit:** 2a600879a6645981b8f169580eb533f75e39ae61

**Outcome (required when completed):**

- Added a backlog index regeneration command implementation that scans file-backed items, sorts them by priority and title, and rewrites only the managed table section.
- Added tests covering managed-section preservation, priority sorting, and the empty-directory fallback row.

**Files changed:**

- `packages/cli/src/commands/backlog/regenerate-index.ts` - implemented item parsing, sorting, and managed-section rewriting
- `packages/cli/src/commands/backlog/regenerate-index.test.ts` - added temp-dir based coverage for regeneration behavior

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/backlog/regenerate-index.test.ts`
- Result: Pass; managed content is replaced correctly and non-managed content is preserved

**Notes / Decisions:**

- Parsed frontmatter with `yaml` plus the shared frontmatter extractor so the implementation matches existing CLI parsing patterns without introducing a second markdown parser.

---

### Task p02-t03: Wire backlog CLI commands

**Status:** completed
**Commit:** 0e3d1764a0d2e27f8e6de3d01c70268f01f17d0d

**Outcome (required when completed):**

- Added a top-level `oat backlog` command with `generate-id` and `regenerate-index` subcommands.
- Wired command output through the shared command context so normal text and JSON modes follow existing CLI conventions.

**Files changed:**

- `packages/cli/src/commands/backlog/index.ts` - added the command group and subcommand actions
- `packages/cli/src/commands/index.ts` - registered the new top-level `backlog` command

**Verification:**

- Run: `pnpm run cli -- backlog regenerate-index --help`; `pnpm run cli -- backlog generate-id test-item`; `pnpm type-check`
- Result: Pass; help renders correctly, ID generation prints a `bl-XXXX` value, and the CLI type-check remains clean

---

## Phase 3: Agent Skills

**Status:** complete
**Started:** 2026-03-15

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Added a dedicated backlog-item creation skill for the new file-backed backlog flow.
- Introduced namespaced project-management variants of the repo-reference update and backlog review skills.
- Added deprecation pointers to the legacy `update-repo-reference` and `review-backlog` entry points.

**Key files touched:**

- `.agents/skills/oat-pjm-add-backlog-item/SKILL.md` - new backlog capture workflow
- `.agents/skills/oat-pjm-update-repo-reference/SKILL.md` - new repo-reference sync workflow
- `.agents/skills/oat-pjm-review-backlog/SKILL.md` - new backlog review workflow
- `.agents/skills/oat-pjm-review-backlog/references/backlog-review-template.md` - copied review document template
- `.agents/skills/update-repo-reference/SKILL.md` - deprecation note
- `.agents/skills/review-backlog/SKILL.md` - deprecation note

**Verification:**

- Run: `cat .agents/skills/oat-pjm-add-backlog-item/SKILL.md | head -10`; `grep "version:" .agents/skills/oat-pjm-update-repo-reference/SKILL.md`; `grep "version:" .agents/skills/oat-pjm-review-backlog/SKILL.md`
- Result: Pass; all new skills exist and declare the expected frontmatter/version metadata

**Notes / Decisions:**

- The new namespaced skills are written against the post-migration backlog structure even though phase 5 will perform the content migration later in this run.

### Task p03-t01: Create `oat-pjm-add-backlog-item` skill

**Status:** completed
**Commit:** fa340e54c7046a77752bbb4bbed6d943332f49d7

**Outcome (required when completed):**

- Added a new repo-level OAT skill for creating file-backed backlog items using the new backlog template and CLI utilities.
- The skill flow now standardizes ID generation, scope-estimate confirmation, managed-index regeneration, and curated overview updates.

**Files changed:**

- `.agents/skills/oat-pjm-add-backlog-item/SKILL.md` - added the new backlog capture workflow

**Verification:**

- Run: `cat .agents/skills/oat-pjm-add-backlog-item/SKILL.md | head -10`
- Result: Pass; frontmatter is present and includes `version: 1.0.0`

**Notes / Decisions:**

- Kept this skill repo-scoped instead of project-scoped because it operates on shared backlog/reference assets rather than an active OAT project.

---

### Task p03-t02: Refactor `update-repo-reference` to `oat-pjm-update-repo-reference`

**Status:** completed
**Commit:** e37b14700cce6fe39e6bcb0bf33f488cb3eb17d5

**Outcome (required when completed):**

- Added a namespaced project-management version of the repo-reference sync skill aligned to the new `backlog/` directory structure.
- Added a deprecation note to the legacy `update-repo-reference` skill so discovery flows point users at the new namespace.

**Files changed:**

- `.agents/skills/oat-pjm-update-repo-reference/SKILL.md` - new repo-reference sync skill for file-backed backlog assets
- `.agents/skills/update-repo-reference/SKILL.md` - added a deprecation pointer

**Verification:**

- Run: `grep "version:" .agents/skills/oat-pjm-update-repo-reference/SKILL.md`
- Result: Pass; the new skill declares `version: 1.0.0`

**Notes / Decisions:**

- Re-authored the namespaced skill around the new backlog contracts instead of cloning every legacy section, which kept the instructions focused on the post-migration structure.

---

### Task p03-t03: Refactor `review-backlog` to `oat-pjm-review-backlog`

**Status:** completed
**Commit:** 4d5dd2a93731a9b46505ff0cdb4027792b09da9b

**Outcome (required when completed):**

- Added a namespaced backlog review skill that catalogs `backlog/items/*.md` files instead of parsing a flat backlog markdown document.
- Copied the existing review template into the new skill namespace and added a deprecation note to the legacy `review-backlog` skill.

**Files changed:**

- `.agents/skills/oat-pjm-review-backlog/SKILL.md` - new file-backed backlog review workflow
- `.agents/skills/oat-pjm-review-backlog/references/backlog-review-template.md` - copied review template
- `.agents/skills/review-backlog/SKILL.md` - added deprecation pointer

**Verification:**

- Run: `grep "version:" .agents/skills/oat-pjm-review-backlog/SKILL.md`
- Result: Pass; the new namespaced skill declares `version: 1.0.0`

**Notes / Decisions:**

- Preserved the existing report template structure so downstream review artifacts keep the same seven-section shape while the inputs shift to the new backlog model.

---

## Phase 4: Skill Pack Infrastructure

**Status:** complete
**Started:** 2026-03-15

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Added a dedicated `project-management` tool pack to the CLI install/update/remove surface, including a direct installer command.
- Wired the pack into the shared manifest, pack typing, init-tools selection flow, and bundle process so the new `oat-pjm-*` skills ship with the CLI assets.
- Closed the remaining asset drift by extending bundle consistency coverage and updating CLI help snapshots to reflect the new pack.

**Key files touched:**

- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - added project-management pack manifests
- `packages/cli/src/commands/init/tools/index.ts` - registered pack selection, descriptions, and install dispatch
- `packages/cli/src/commands/init/tools/project-management/install-project-management.ts` - added project-management installer
- `packages/cli/src/commands/init/tools/project-management/index.ts` - added direct install subcommand
- `packages/cli/scripts/bundle-assets.sh` - bundled PM skills and templates
- `packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts` - guarded pack/bundle drift

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/init/tools/project-management/install-project-management.test.ts src/commands/init/tools/shared/bundle-consistency.test.ts src/commands/init/tools/index.test.ts src/commands/help-snapshots.test.ts`; `pnpm build`
- Result: Pass; installer, pack registration, bundle consistency, and help output all pass and the workspace build succeeds

**Notes / Decisions:**

- `project-management` remains project-scoped in interactive selection, but non-interactive full installs include it by default so the bundle and installer stay aligned.

### Task p04-t01: Add `PROJECT_MANAGEMENT_SKILLS` to skill manifest

**Status:** completed
**Commit:** 32cb7d92bacb209b5c40cbbd14aec1bca9ac6be8

**Outcome (required when completed):**

- Added the project-management pack’s skill and template lists to the shared installer manifest.
- Established the bundle/install source of truth needed by the upcoming pack installer and CLI registration work.

**Files changed:**

- `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` - added project-management skill/template/script constants

**Verification:**

- Run: `pnpm type-check`
- Result: Pass; the updated manifest compiles cleanly across the workspace

**Notes / Decisions:**

- Defined an explicit empty `PROJECT_MANAGEMENT_SCRIPTS` list now so the installer shape matches the other packs even before any project-management scripts exist.

---

### Task p04-t02: Extend `PackName` type and pack resolution

**Status:** completed
**Commit:** 792a96544bc51011847bd071bec361f952ddbfbe

**Outcome (required when completed):**

- Extended CLI pack typing and scan logic so project-management skills classify into a first-class `project-management` pack.
- Updated `tools update` and `tools remove` pack validation/help text so pack-targeted maintenance commands accept the new pack name.

**Files changed:**

- `packages/cli/src/commands/tools/shared/types.ts` - added the `project-management` pack type
- `packages/cli/src/commands/tools/shared/scan-tools.ts` - mapped namespaced PM skills into the new pack
- `packages/cli/src/commands/tools/remove/index.ts` - accepted the new pack in remove command validation/help
- `packages/cli/src/commands/tools/update/index.ts` - accepted the new pack in update command validation/help

**Verification:**

- Run: `pnpm type-check && pnpm lint`
- Result: Pass; new pack typing and command options compile and lint cleanly

**Notes / Decisions:**

- The follow-on type errors in `tools update/remove` were in-scope because the new pack type would otherwise break pack-targeted maintenance commands.

---

### Task p04-t03: Create installer module

**Status:** completed
**Commit:** cb55b0473963c0f6090e496aac3fa9e49cfd419d

**Outcome (required when completed):**

- Added a dedicated project-management pack installer that copies all PM skills and templates with the same copy/update/outdated semantics as the other packs.
- Added installer tests covering initial copy, idempotent rerun, force overwrite, and outdated-version detection.
- Updated help snapshots to reflect the backlog command and expanded pack option text introduced earlier in this implementation run.

**Files changed:**

- `packages/cli/src/commands/init/tools/project-management/install-project-management.ts` - new installer implementation
- `packages/cli/src/commands/init/tools/project-management/install-project-management.test.ts` - installer coverage
- `packages/cli/src/commands/help-snapshots.test.ts` - updated snapshots for new CLI help output

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/init/tools/project-management/install-project-management.test.ts src/commands/help-snapshots.test.ts`
- Result: Pass; installer behavior and help snapshots both pass

**Notes / Decisions:**

- The snapshot updates were required to keep verification green after the earlier backlog command and pack-option help changes.

---

### Task p04-t04: Register pack in init tools and descriptions

**Status:** completed
**Commit:** 94ba3f0867233f16b1bc5c99e37ed7405d39d881

**Outcome (required when completed):**

- Registered the project-management pack in the interactive init-tools flow and added a dedicated `project-management` install subcommand.
- Added pack descriptions and installer wiring so both `oat init tools` and `oat tools install` can surface and install the new pack.

**Files changed:**

- `packages/cli/src/commands/init/tools/index.ts` - registered the pack in selection flow, descriptions, and install dispatch
- `packages/cli/src/commands/init/tools/project-management/index.ts` - added a direct install subcommand

**Verification:**

- Run: `pnpm type-check && pnpm lint && pnpm run cli -- tools install --help`
- Result: Pass; init/tools wiring compiles cleanly and the project-management pack appears in CLI help

**Notes / Decisions:**

- The pack is project-scoped only, so it is excluded from the user-eligible pack set while still remaining available in the non-interactive full install path.

---

### Task p04-t05: Update `bundle-assets.sh` and verify consistency

**Status:** completed
**Commit:** 30ed804216e2f98906f0cf37125d43d1cd6af30d

**Outcome (required when completed):**

- Added the three `oat-pjm-*` skills plus the backlog/roadmap templates to the CLI asset bundler so the new pack ships with built assets.
- Extended bundle consistency coverage to treat project-management as a first-class pack and refreshed init-tools/help snapshots to match the new command surface.
- Verified the full CLI build path succeeds after bundling, which also kept the tracked bundled `state.md` template in sync with the source template.

**Files changed:**

- `packages/cli/scripts/bundle-assets.sh` - bundled project-management skills and templates
- `packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts` - added project-management bundle coverage
- `packages/cli/src/commands/init/tools/index.test.ts` - updated init-tools harness expectations for the new pack
- `packages/cli/src/commands/help-snapshots.test.ts` - refreshed help snapshots for init/tools install output
- `packages/cli/assets/templates/state.md` - synced bundled state template output

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/init/tools/shared/bundle-consistency.test.ts src/commands/init/tools/index.test.ts src/commands/help-snapshots.test.ts`; `pnpm build`
- Result: Pass; targeted bundle/install/help tests pass and the workspace build completes successfully

**Notes / Decisions:**

- The init-tools test harness needed a project-management installer mock to let non-interactive install flows reach the AGENTS/help assertions introduced earlier in phase 4.

---

## Phase 5: Migration

**Status:** complete
**Started:** 2026-03-15

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Migrated the active backlog into file-backed items, generated the new backlog index, and redirected the legacy flat backlog file.
- Migrated completed backlog history into a summary archive plus five rich archived item files for the newest completed work.
- Reframed the roadmap into Now / Next / Later horizons and retired `deferred-phases.md` by converting the remaining ideas into backlog items.

**Key files touched:**

- `.oat/repo/reference/backlog/items/*.md` - migrated active and deferred backlog items
- `.oat/repo/reference/backlog/index.md` - regenerated managed index and curated overview
- `.oat/repo/reference/backlog/completed.md` - migrated completed-item summary archive
- `.oat/repo/reference/backlog/archived/*.md` - archived detailed records for recent completed work
- `.oat/repo/reference/roadmap.md` - added Now / Next / Later horizons
- `.oat/repo/reference/deferred-phases.md` - removed after migration

**Verification:**

- Run: `pnpm run cli -- backlog regenerate-index`; `find .oat/repo/reference/backlog/items -name "*.md" | wc -l`; `grep -c '^- 20' .oat/repo/reference/backlog/completed.md`; `find .oat/repo/reference/backlog/archived -name "*.md" | wc -l`; `grep "^## Now\|^## Next\|^## Later" .oat/repo/reference/roadmap.md`; `pnpm test`; `pnpm lint`; `pnpm type-check`; `pnpm build`
- Result: Pass; backlog migrations, roadmap restructuring, and the full workspace verification suite all succeeded

**Notes / Decisions:**

- Phase-5 migration followed the repo’s current source-of-truth files rather than stale counts in the plan, and those deviations are recorded below for traceability.

### Task p05-t01: Migrate existing backlog items to file-per-item

**Status:** completed
**Commit:** a34147dd397ae3dd3474f93a47303d65db265472

**Outcome (required when completed):**

- Migrated the live backlog from the flat `backlog.md` list into seven file-backed item records under `backlog/items/`.
- Regenerated the managed backlog index table and replaced the placeholder curated overview with summaries tied to the new item IDs.
- Added a migration pointer to the legacy `backlog.md` file so readers are redirected to the file-backed backlog structure.

**Files changed:**

- `.oat/repo/reference/backlog/items/s3-archival-project-complete.md` - migrated S3 archival inbox item
- `.oat/repo/reference/backlog/items/backlog-refinement-jira.md` - migrated backlog refinement inbox item
- `.oat/repo/reference/backlog/items/oat-pjm-workflow.md` - migrated active project-management workflow item and linked it to this project
- `.oat/repo/reference/backlog/items/codex-prompt-wrapper.md` - migrated Codex wrapper planned item
- `.oat/repo/reference/backlog/items/pr-review-skill-set.md` - migrated remote review follow-on planned item
- `.oat/repo/reference/backlog/items/dependency-intelligence.md` - migrated dependency intelligence planned item
- `.oat/repo/reference/backlog/items/idea-promotion-auto-discovery.md` - migrated idea promotion planned item
- `.oat/repo/reference/backlog/index.md` - regenerated managed table and curated overview
- `.oat/repo/reference/backlog.md` - added migration pointer to the new backlog directory

**Verification:**

- Run: `pnpm run cli -- backlog regenerate-index`; `find .oat/repo/reference/backlog/items -name "*.md" | wc -l`; `grep "OAT BACKLOG-INDEX" .oat/repo/reference/backlog/index.md`
- Result: Pass; the managed index regenerated successfully, marker comments are present, and the live backlog currently resolves to 7 migrated item files

**Notes / Decisions:**

- The plan expected 8 active items, but `backlog.md` currently contains 7 real active entries because `oat-project-capture` has already moved into `backlog-completed.md`; the migration followed the current source-of-truth backlog content.

---

### Task p05-t02: Migrate completed backlog to new structure

**Status:** completed
**Commit:** 1433636e75a9052504fb7b7048929f9b42e56400

**Outcome (required when completed):**

- Migrated the legacy completed backlog archive into the new summary-oriented `backlog/completed.md` format with 50 completed entries ordered by completion date.
- Created 5 file-backed archived items under `backlog/archived/` for the most recent completed work that still benefits from rich context.
- Added a migration pointer to the legacy `backlog-completed.md` file so readers are redirected to the new summary and archived record locations.

**Files changed:**

- `.oat/repo/reference/backlog/completed.md` - added 50 summary archive entries and migration note
- `.oat/repo/reference/backlog/archived/research-analysis-verification-synthesis-skill-suite.md` - archived recent research-suite completion
- `.oat/repo/reference/backlog/archived/retroactive-project-capture-skill.md` - archived recent project-capture completion
- `.oat/repo/reference/backlog/archived/guided-setup-flow-documentation-detection.md` - archived recent guided-setup completion
- `.oat/repo/reference/backlog/archived/agents-docs-init-surface-info.md` - archived recent docs-init AGENTS update
- `.oat/repo/reference/backlog/archived/project-state-timestamps.md` - archived recent project-state timestamp work
- `.oat/repo/reference/backlog-completed.md` - added migration pointer to the new completed backlog surfaces

**Verification:**

- Run: `grep -c '^- 20' .oat/repo/reference/backlog/completed.md`; `find .oat/repo/reference/backlog/archived -name "*.md" | wc -l`; `wc -l .oat/repo/reference/backlog/completed.md`
- Result: Pass; the new summary archive contains 50 completed-item lines and the archived directory contains 5 file-backed records

**Notes / Decisions:**

- The legacy completed backlog contains 50 real entries rather than the 31 expected by the plan, so the migration preserved the full archive instead of truncating it.
- One legacy entry (`Update AGENTS.md with workflow system details during oat tools init`) lacked an explicit `Completed:` field, so its summary date was inferred as `2026-03-10` from surrounding archive order.

---

### Task p05-t03: Migrate roadmap to Now/Next/Later structure

**Status:** completed
**Commit:** 68048c2666e1d80d9dd4a13e0ac15314f131a3d3

**Outcome (required when completed):**

- Added the canonical Now / Next / Later horizon structure to the roadmap while preserving the existing status summary table and detailed phase writeups.
- Threaded migrated backlog IDs into the horizon summaries where the roadmap already maps cleanly to active backlog work.
- Added an explicit template-structure reference so the roadmap now aligns with the new roadmap template introduced earlier in this project.

**Files changed:**

- `.oat/repo/reference/roadmap.md` - added horizon sections, backlog-ID references, and template guidance comment

**Verification:**

- Run: `grep "^## Now\|^## Next\|^## Later" .oat/repo/reference/roadmap.md`
- Result: Pass; the roadmap now exposes the required Now / Next / Later headings

**Notes / Decisions:**

- Kept the existing status summary and detailed phase sections as backward-reference material instead of deleting them, which preserves historical roadmap context while still meeting the new horizon contract.

---

### Task p05-t04: Retire `deferred-phases.md`

**Status:** completed
**Commit:** bcd87924ec5f9195251a32a88ea8a84d8b24d853

**Outcome (required when completed):**

- Converted the remaining deferred roadmap items into first-class backlog entries for staleness/knowledge-drift and memory/provider-enhancement work.
- Removed `deferred-phases.md` once its remaining actionable content was captured in the file-backed backlog.
- Regenerated the backlog index and updated the curated overview so the newly migrated items appear in the current backlog surface.

**Files changed:**

- `.oat/repo/reference/backlog/items/staleness-knowledge-drift.md` - added deferred phase 5 as a backlog item
- `.oat/repo/reference/backlog/items/memory-system.md` - added deferred phase 10 as a backlog item
- `.oat/repo/reference/backlog/index.md` - regenerated managed index and refreshed curated overview
- `.oat/repo/reference/deferred-phases.md` - removed after migration

**Verification:**

- Run: `pnpm run cli -- backlog regenerate-index`; `find .oat/repo/reference/backlog/items -name "*.md" | wc -l`; `test ! -e .oat/repo/reference/deferred-phases.md`
- Result: Pass; the backlog now contains 9 active item files and the deferred-phases document has been removed

**Notes / Decisions:**

- The roadmap gained IDs for the new deferred work via backlog migration rather than by keeping a separate deferred-phases document in parallel.

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

Chronological log of implementation progress.

### 2026-03-15

**Session Start:** 17:25

- [x] p01-t01: Create backlog item template - 48c08748dd9e64541e2d999839170bc803332514
- [x] p01-t02: Create roadmap template - 12d48e59ea1ccba0105d37b87bd1bc55204ba70b
- [x] p01-t03: Create backlog directory structure - 1cdb035030eafe0a261ae4e736cdf2658b265670
- [x] p01-t04: Add `associated_issues` to state.md template - c0990633ec60cda5f39c94153527fca9a6959b72
- [x] p02-t01: Implement backlog item ID generation utility - 7708871b7c4ecaf6bd6cde83f8af20bf387f40a0
- [x] p02-t02: Implement backlog index regeneration command - 2a600879a6645981b8f169580eb533f75e39ae61
- [x] p02-t03: Wire backlog CLI commands - 0e3d1764a0d2e27f8e6de3d01c70268f01f17d0d
- [x] p03-t01: Create `oat-pjm-add-backlog-item` skill - fa340e54c7046a77752bbb4bbed6d943332f49d7
- [x] p03-t02: Refactor `update-repo-reference` to `oat-pjm-update-repo-reference` - e37b14700cce6fe39e6bcb0bf33f488cb3eb17d5
- [x] p03-t03: Refactor `review-backlog` to `oat-pjm-review-backlog` - 4d5dd2a93731a9b46505ff0cdb4027792b09da9b
- [x] p04-t01: Add `PROJECT_MANAGEMENT_SKILLS` to skill manifest - 32cb7d92bacb209b5c40cbbd14aec1bca9ac6be8
- [x] p04-t02: Extend `PackName` type and pack resolution - 792a96544bc51011847bd071bec361f952ddbfbe
- [x] p04-t03: Create installer module - cb55b0473963c0f6090e496aac3fa9e49cfd419d
- [x] p04-t04: Register pack in init tools and descriptions - 94ba3f0867233f16b1bc5c99e37ed7405d39d881
- [x] p04-t05: Update `bundle-assets.sh` and verify consistency - 30ed804216e2f98906f0cf37125d43d1cd6af30d
- [x] p05-t01: Migrate existing backlog items to file-per-item - a34147dd397ae3dd3474f93a47303d65db265472
- [x] p05-t02: Migrate completed backlog to new structure - 1433636e75a9052504fb7b7048929f9b42e56400
- [x] p05-t03: Migrate roadmap to Now/Next/Later structure - 68048c2666e1d80d9dd4a13e0ac15314f131a3d3
- [x] p05-t04: Retire `deferred-phases.md` - bcd87924ec5f9195251a32a88ea8a84d8b24d853

**What changed (high level):**

- Confirmed final-only plan checkpoint: `["p05"]`
- Moved project tracking from planning into implementation kickoff
- Initialized implementation task map for all 19 planned tasks
- Completed phase 4, wiring the `project-management` pack through install, help, and bundle verification paths
- Started phase 5 by migrating the live backlog into file-backed item records and regenerating the managed index
- Migrated the completed backlog archive into summary and archived-item surfaces with explicit redirect pointers
- Reframed the roadmap around Now / Next / Later horizons while preserving detailed phase history for reference
- Completed the final migration by retiring `deferred-phases.md`, adding backlog records for the remaining deferred ideas, and passing full repo verification

**Decisions:**

- Pause only after completing `p05`; do not stop at intermediate phases unless blocked
- Treat `backlog.md` as the source of truth when plan assumptions diverge from the current repo state
- Stop at the `p05` boundary for the required final review gate rather than rolling into PR creation without review

**Follow-ups / TODO:**

- Implementation tasks are complete; request final review next

**Blockers:**

- None

**Session End:** -

---

## Deviations from Plan

Document any deviations from the original plan.

| Task    | Planned                                          | Actual                              | Reason                                                                                                                                      |
| ------- | ------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| p05-t01 | Migrate 8 active backlog items from `backlog.md` | Migrated 7 active backlog items     | `oat-project-capture` was already moved to `backlog-completed.md`, so `backlog.md` contained 7 live entries at execution time               |
| p05-t02 | Migrate 31 completed backlog items               | Migrated 50 completed backlog items | `backlog-completed.md` currently contains 50 real completed entries, so the migration preserved the full archive rather than a stale subset |

## Test Results

Track test execution during implementation.

| Phase | Tests Run                                                 | Passed | Failed | Coverage |
| ----- | --------------------------------------------------------- | ------ | ------ | -------- |
| 1     | -                                                         | -      | -      | -        |
| 2     | -                                                         | -      | -      | -        |
| 5     | Backlog migration checks + roadmap heading checks         | Pass   | 0      | -        |
| final | `pnpm test`; `pnpm lint`; `pnpm type-check`; `pnpm build` | Pass   | 0      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- File-backed backlog management with generated index, completed summary archive, archived recent completions, and migrated legacy reference files.
- CLI/project-management pack support for backlog ID generation, backlog index regeneration, and installable `oat-pjm-*` project-management skills.
- Roadmap and reference cleanup that converts deferred roadmap work into backlog items and standardizes roadmap horizons.

**Behavioral changes (user-facing):**

- `oat backlog generate-id` and `oat backlog regenerate-index` are available from the CLI.
- `oat init tools` / `oat tools install` now support the `project-management` pack.
- Backlog and completed-work tracking now live under `.oat/repo/reference/backlog/` instead of the legacy flat markdown files.

**Key files / modules:**

- `packages/cli/src/commands/backlog/` - new backlog CLI surface
- `packages/cli/src/commands/init/tools/` - project-management pack manifest, installer, and registration
- `.agents/skills/oat-pjm-*/` - new project-management skill family
- `.oat/repo/reference/backlog/` - migrated backlog, completed archive, and archived-item records

**Verification performed:**

- Targeted CLI tests for backlog commands, bundle consistency, installer wiring, and help snapshots
- `pnpm test`
- `pnpm lint`
- `pnpm type-check`
- `pnpm build`

**Design deltas (if any):**

- Phase 5 migration used the current repo contents as source of truth where the legacy backlog files had drifted from the counts captured in `plan.md`.

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`
