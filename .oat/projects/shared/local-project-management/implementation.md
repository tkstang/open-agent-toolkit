---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-15
oat_current_task_id: p04-t01
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

| Phase   | Status      | Tasks | Completed |
| ------- | ----------- | ----- | --------- |
| Phase 1 | complete    | 4     | 4/4       |
| Phase 2 | complete    | 3     | 3/3       |
| Phase 3 | complete    | 3     | 3/3       |
| Phase 4 | in_progress | 5     | 0/5       |
| Phase 5 | pending     | 4     | 0/4       |

**Total:** 10/19 tasks completed

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

**Status:** in_progress
**Started:** 2026-03-15

### Task p04-t01: Add `PROJECT_MANAGEMENT_SKILLS` to skill manifest

**Status:** pending
**Commit:** -

---

### Task p04-t02: Extend `PackName` type and pack resolution

**Status:** pending
**Commit:** -

---

### Task p04-t03: Create installer module

**Status:** pending
**Commit:** -

---

### Task p04-t04: Register pack in init tools and descriptions

**Status:** pending
**Commit:** -

---

### Task p04-t05: Update `bundle-assets.sh` and verify consistency

**Status:** pending
**Commit:** -

---

## Phase 5: Migration

**Status:** pending
**Started:** -

### Task p05-t01: Migrate existing backlog items to file-per-item

**Status:** pending
**Commit:** -

---

### Task p05-t02: Migrate completed backlog to new structure

**Status:** pending
**Commit:** -

---

### Task p05-t03: Migrate roadmap to Now/Next/Later structure

**Status:** pending
**Commit:** -

---

### Task p05-t04: Retire `deferred-phases.md`

**Status:** pending
**Commit:** -

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
- [ ] p04-t01: Add `PROJECT_MANAGEMENT_SKILLS` to skill manifest - pending

**What changed (high level):**

- Confirmed final-only plan checkpoint: `["p05"]`
- Moved project tracking from planning into implementation kickoff
- Initialized implementation task map for all 19 planned tasks

**Decisions:**

- Pause only after completing `p05`; do not stop at intermediate phases unless blocked

**Follow-ups / TODO:**

- Execute tasks strictly in plan order, starting with template creation

**Blockers:**

- None

**Session End:** -

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
| ---- | ------- | ------ | ------ |
| -    | -       | -      | -      |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
| ----- | --------- | ------ | ------ | -------- |
| 1     | -         | -      | -      | -        |
| 2     | -         | -      | -      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- {capability 1}
- {capability 2}

**Behavioral changes (user-facing):**

- {bullet}

**Key files / modules:**

- `{path}` - {purpose}

**Verification performed:**

- {tests/lint/typecheck/build/manual steps}

**Design deltas (if any):**

- {what changed vs design.md and why}

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`
