---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_current_task_id: null
oat_generated: false
---

# Implementation: canonical-rule-sync

**Started:** 2026-03-11
**Last Updated:** 2026-03-11

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

| Phase   | Status    | Tasks | Completed |
| ------- | --------- | ----- | --------- |
| Phase 1 | completed | 3     | 3/3       |
| Phase 2 | completed | 3     | 3/3       |
| Phase 3 | completed | 10    | 10/10     |

**Total:** 16/16 tasks completed

---

## Phase 1: Transform-Aware Sync Foundation

**Status:** completed
**Started:** 2026-03-11

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Added canonical rule types plus provider mappings and transforms for Claude, Cursor, and Copilot.
- Extended sync planning and execution so transformed rule files are rendered into provider-specific copies with provider-specific filenames.
- Switched transformed copy drift behavior to compare and store rendered provider output hashes, avoiding rule-only manifest fields.
- Added engine coverage for transformed planning, execution, and manifest compatibility.

**Key files touched:**

- `packages/cli/src/shared/types.ts` - registered `rule` as a canonical sync content type
- `packages/cli/src/providers/*/paths.ts` - attached provider rule mappings, extensions, and transform hooks
- `packages/cli/src/rules/canonical/*` - defined canonical rule parsing/rendering and marker helpers
- `packages/cli/src/engine/compute-plan.ts` - planned transformed rule copies using rendered provider output
- `packages/cli/src/engine/execute-plan.ts` - wrote rendered files and persisted provider-output hashes in the manifest

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed
- Run: `pnpm --filter @oat/cli lint`
- Result: Passed
- Run: `pnpm --filter @oat/cli type-check`
- Result: Passed

**Notes / Decisions:**

- Rendered provider output is now the source of truth for transformed copies during plan comparison and manifest hashing, which keeps drift logic generic instead of adding rule-specific body-hash fields.
- Generated rule markers remain trailing HTML comments so provider frontmatter stays on the first line.

### Task p01-t01: Add rule content type and mapping contract

**Status:** completed
**Commit:** 27ff5d85

**Outcome (required when completed):**

- Added `rule` as a project-scoped sync content type alongside skills and agents.
- Extended canonical scanning to discover file-based rule entries under `.agents/rules/`.
- Added initial project provider mappings for Claude, Cursor, and Copilot rule directories.
- Expanded Copilot detection so `.github/instructions` activates the provider.

**Files changed:**

- `packages/cli/src/shared/types.ts` - registered `rule` in content type and scope maps
- `packages/cli/src/shared/types.test.ts` - covered the new content type and scope values
- `packages/cli/src/engine/scanner.ts` - added canonical rules directory handling
- `packages/cli/src/engine/scanner.test.ts` - covered project/user rule scanning behavior
- `packages/cli/src/providers/shared/adapter.types.ts` - added optional transform-oriented mapping fields
- `packages/cli/src/providers/shared/adapter-contract.test.ts` - expanded canonical dir and detection expectations
- `packages/cli/src/providers/claude/paths.ts` - added project rule mapping
- `packages/cli/src/providers/claude/adapter.test.ts` - asserted Claude project rules mapping
- `packages/cli/src/providers/cursor/paths.ts` - added project rule mapping
- `packages/cli/src/providers/cursor/adapter.test.ts` - asserted Cursor project rules mapping
- `packages/cli/src/providers/copilot/paths.ts` - added project rule mapping
- `packages/cli/src/providers/copilot/adapter.ts` - recognized `.github/instructions` as a Copilot marker
- `packages/cli/src/providers/copilot/adapter.test.ts` - covered project rule mapping and instructions detection

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed after updating provider/scanner/type tests for rule support
- Run: `pnpm lint && pnpm type-check`
- Result: Passed

**Notes / Decisions:**

- The transform hook fields were added to `PathMapping` now so later rule-rendering work can plug into the existing adapter contract without another type churn task.
- Rule mappings were added only for project scope in this task; user-scoped rules remain intentionally out of scope.

---

### Task p01-t02: Implement canonical rule model and provider transforms

**Status:** completed
**Commit:** f48fb46a

**Outcome (required when completed):**

- Added a canonical rule parsing/rendering layer under `packages/cli/src/rules/canonical`.
- Implemented provider-local rule transforms for Claude, Cursor, and Copilot, including trailing generated markers.
- Wired project rule mappings to provider extensions and transform hooks.
- Documented and tested intentional lossy round-tripping for providers that cannot preserve all canonical metadata.

**Files changed:**

- `packages/cli/src/rules/canonical/types.ts` - defined canonical rule document/frontmatter types
- `packages/cli/src/rules/canonical/parse.ts` - added frontmatter parsing and marker stripping
- `packages/cli/src/rules/canonical/render.ts` - added canonical rendering and generated-marker helpers
- `packages/cli/src/rules/canonical/index.ts` - exported the canonical rule surface
- `packages/cli/src/rules/canonical/parse.test.ts` - covered parsing and marker stripping
- `packages/cli/src/rules/canonical/render.test.ts` - covered canonical serialization
- `packages/cli/src/providers/claude/rule-transform.ts` - implemented Claude render/parse behavior
- `packages/cli/src/providers/claude/rule-transform.test.ts` - covered Claude round-trip and degradation behavior
- `packages/cli/src/providers/cursor/rule-transform.ts` - implemented Cursor render/parse behavior
- `packages/cli/src/providers/cursor/rule-transform.test.ts` - covered all Cursor activation modes
- `packages/cli/src/providers/copilot/rule-transform.ts` - implemented Copilot render/parse behavior
- `packages/cli/src/providers/copilot/rule-transform.test.ts` - covered Copilot round-trip and degradation behavior
- `packages/cli/src/providers/claude/paths.ts` - attached Claude rule transform hooks and extension
- `packages/cli/src/providers/cursor/paths.ts` - attached Cursor rule transform hooks and extension
- `packages/cli/src/providers/copilot/paths.ts` - attached Copilot rule transform hooks and extension
- `packages/cli/src/providers/shared/adapter.types.ts` - widened transform hook signatures to accept source metadata
- `packages/cli/src/providers/shared/adapter.types.test.ts` - validated optional transform hook typing
- `packages/cli/src/providers/claude/adapter.test.ts` - asserted rule mapping extension/hook presence
- `packages/cli/src/providers/copilot/adapter.test.ts` - asserted rule mapping extension/hook presence
- `packages/cli/tsconfig.json` - registered `@rules/*` alias for build-time resolution
- `packages/cli/vitest.config.ts` - registered `@rules` alias for test-time resolution

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed after aligning Claude tests with intentional description lossiness
- Run: `pnpm lint && pnpm type-check`
- Result: Passed

**Notes / Decisions:**

- The generated-file marker stays as a trailing HTML comment, preserving provider frontmatter at the top of the file.
- Cursor can round-trip `manual` and `agent-requested` distinctly; Claude and Copilot intentionally degrade unsupported modes to `always`.

---

### Task p01-t03: Integrate transformed sync planning, execution, and manifest handling

**Status:** completed
**Commit:** 555e6331

**Outcome (required when completed):**

- Forced transformed mappings onto copy strategy during planning while honoring provider-specific output extensions.
- Compared transformed rule entries against rendered provider output and skipped updates when the provider file already matched.
- Wrote rendered rule content directly during sync execution and stored the rendered provider hash in the manifest.
- Added regression coverage around transformed planning, execution, manifest validation, and drift expectations.

**Files changed:**

- `packages/cli/src/engine/compute-plan.ts` - rendered transformed file entries during planning and compared provider output hashes
- `packages/cli/src/engine/execute-plan.ts` - wrote rendered file content and hashed rendered output in manifest entries
- `packages/cli/src/engine/engine.types.ts` - threaded rendered content through sync plan entries
- `packages/cli/src/engine/compute-plan.test.ts` - covered forced copy strategy, extension mapping, and rendered-output skip behavior
- `packages/cli/src/engine/execute-plan.test.ts` - covered rendered file writes and manifest hashing for rule copies
- `packages/cli/src/drift/detector.test.ts` - covered transformed copy drift expectations
- `packages/cli/src/manifest/manifest.types.test.ts` - covered manifest acceptance for copy-mode rule file entries

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed
- Run: `pnpm --filter @oat/cli lint`
- Result: Passed
- Run: `pnpm --filter @oat/cli type-check`
- Result: Passed

---

## Phase 2: Adoption, Tooling, and Coverage

**Status:** completed
**Started:** 2026-03-11

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Added rule stray detection and adoption across Claude, Cursor, and Copilot provider directories.
- Switched the authoring workflow to canonical `.agents/rules/*.md` files plus `oat sync` generation of provider rule files.
- Added command and adapter-contract coverage so transformed rule sync is exercised in both workflow guidance and automated tests.
- Verified end-to-end rule sync and provider-to-canonical adoption in disposable smoke environments.

**Key files touched:**

- `packages/cli/src/drift/strays.ts` - detected rule strays with extension-aware canonical filename normalization
- `packages/cli/src/commands/shared/adopt-stray.ts` - adopted provider-native rule files back into canonical markdown and managed provider copies
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - documented canonical rule authoring and sync-based provider generation
- `packages/cli/src/commands/sync/index.test.ts` - exercised transformed rule copy plans through the sync command boundary
- `packages/cli/src/providers/shared/adapter-contract.test.ts` - enforced transform-hook requirements for rule mappings

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed
- Run: `pnpm --filter @oat/cli lint`
- Result: Passed
- Run: `pnpm --filter @oat/cli type-check`
- Result: Passed
- Manual: disposable engine/adoption smoke scripts for canonical rule sync and stray adoption
- Result: Passed

**Notes / Decisions:**

- Manual smoke coverage used engine-level scripts instead of the top-level CLI `sync` command because the CLI requires a resolvable project root and rejects arbitrary temp directories.
- Claude and Copilot rule adoption remain intentionally lossy for unsupported activation modes; Cursor preserves more activation detail.

### Task p02-t01: Add rule stray detection and adoption flow

**Status:** completed
**Commit:** 420775e1

**Outcome (required when completed):**

- Added stray detection for rule files in Claude, Cursor, and Copilot provider directories, including `.mdc` and `.instructions.md` extensions.
- Taught rule stray suppression to map provider filenames back to canonical `.md` filenames before comparing against canonical entries.
- Implemented rule adoption that parses provider-native rule files back to canonical markdown and keeps the provider copy managed as a transformed file.
- Threaded rule-aware stray detection through init/status flows so adoption candidates carry the mapping metadata needed for extension-aware handling.

**Files changed:**

- `packages/cli/src/drift/strays.ts` - recognized rule directories, extensions, scope roots, and canonical filename conversion
- `packages/cli/src/drift/strays.test.ts` - covered Cursor and Copilot rule stray detection
- `packages/cli/src/commands/shared/adopt-stray.ts` - added transformed rule adoption with canonical writeback and managed provider copy updates
- `packages/cli/src/commands/shared/adopt-stray.test.ts` - covered Cursor rule adoption into `.agents/rules/*.md`
- `packages/cli/src/commands/status/index.ts` - passed mapping metadata into stray detection for rule-aware adoption candidates
- `packages/cli/src/commands/init/index.ts` - passed mapping metadata into stray detection during init adoption

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed
- Run: `pnpm --filter @oat/cli lint`
- Result: Passed
- Run: `pnpm --filter @oat/cli type-check`
- Result: Passed

---

### Task p02-t02: Update rule authoring workflow and sync integration tests

**Status:** completed
**Commit:** d48d99f9

**Outcome (required when completed):**

- Updated the agent-instructions apply workflow to author canonical rules in `.agents/rules/` instead of hand-writing provider-specific rule files.
- Documented `oat sync --scope project` as the step that renders provider rule files from canonical markdown.
- Added sync-command coverage for transformed rule copy plans so command execution remains compatible with file-based rendered content.

**Files changed:**

- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - switched rule generation guidance to canonical rule authoring plus sync
- `packages/cli/src/commands/sync/index.test.ts` - added transformed rule copy coverage and rule-aware canonical entry helpers

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/sync/index.test.ts`
- Result: Passed
- Run: `pnpm --filter @oat/cli lint`
- Result: Passed
- Run: `pnpm --filter @oat/cli type-check`
- Result: Passed

---

### Task p02-t03: Final verification and manual smoke test coverage

**Status:** completed
**Commit:** 342ce89b

**Outcome (required when completed):**

- Added adapter-contract coverage that requires rule mappings to declare a provider extension plus both transform hooks.
- Re-ran the full `@oat/cli` automated verification suite after the final rule-sync changes.
- Completed manual smoke validation for canonical rule sync output and provider-rule adoption back into `.agents/rules/`.
- Recorded the main implementation limitation discovered during smoke validation around CLI project-root resolution for disposable temp directories.

**Files changed:**

- `packages/cli/src/providers/shared/adapter-contract.test.ts` - asserted transform-hook invariants for rule project mappings

**Verification:**

- Run: `pnpm --filter @oat/cli test`
- Result: Passed
- Run: `pnpm --filter @oat/cli lint`
- Result: Passed
- Run: `pnpm --filter @oat/cli type-check`
- Result: Passed
- Manual: engine-level sync smoke confirmed `.claude/rules/test-rule.md`, `.cursor/rules/test-rule.mdc`, and `.github/instructions/test-rule.instructions.md` were rendered with provider-specific frontmatter
- Result: Passed
- Manual: adoption smoke confirmed `.cursor/rules/stray-rule.mdc` adopted into `.agents/rules/stray-rule.md` with a managed copy manifest entry
- Result: Passed

---

## Phase 3: Review Fixes

**Status:** completed
**Started:** 2026-03-11

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**

- Removed duplicate rule-filename normalization logic and centralized rendered string hashing.
- Made Copilot comma-containing glob handling explicit and fail-fast instead of silently lossy.
- Expanded Claude and Copilot transform coverage for intentional lossy activation behavior and baseline activation modes.
- Hardened init and execution edge cases with explicit directory-marker guards and canonical `.agents/rules/` directory creation.

**Key files touched:**

- `packages/cli/src/rules/canonical/provider-filenames.ts` - shared provider-to-canonical rule filename mapping
- `packages/cli/src/providers/copilot/rule-transform.ts` - explicit comma-glob rejection for sync and adoption
- `packages/cli/src/manifest/hash.ts` - centralized rendered string hashing helper
- `packages/cli/src/providers/claude/rule-transform.test.ts` / `packages/cli/src/providers/copilot/rule-transform.test.ts` - review-driven transform coverage additions
- `packages/cli/src/engine/execute-plan.ts` / `packages/cli/src/commands/init/index.ts` - review-driven guardrail and init ergonomics updates

**Verification:**

- Run: targeted review-fix verification commands per task plus `OAT_ASSETS_DIR=$(mktemp -d) pnpm test`, `OAT_ASSETS_DIR=$(mktemp -d) pnpm lint`, `OAT_ASSETS_DIR=$(mktemp -d) pnpm type-check`, and `OAT_ASSETS_DIR=$(mktemp -d) pnpm build`
- Result: Passed

**Notes / Decisions:**

- Full workspace verification must be run sequentially because multiple root `turbo` commands in parallel all invoke `@oat/cli:build`, which races on the generated `packages/cli/assets` directory.

### Task p03-t01: (review) Extract shared canonical rule filename normalization

**Status:** completed
**Commit:** 5361ec66

**Outcome (required when completed):**

- Extracted a shared helper for provider rule filename to canonical `.md` normalization.
- Reused that helper from both stray detection and stray adoption so rule filename mapping stays consistent.
- Added Copilot `.instructions.md` coverage in both stray detection and adoption tests.

**Files changed:**

- `packages/cli/src/rules/canonical/provider-filenames.ts` - added shared provider-to-canonical rule filename normalization
- `packages/cli/src/rules/canonical/index.ts` - re-exported the shared filename helper
- `packages/cli/src/drift/strays.ts` - switched rule stray suppression to the shared helper
- `packages/cli/src/drift/strays.test.ts` - covered Copilot rule filename normalization during stray detection
- `packages/cli/src/commands/shared/adopt-stray.ts` - switched rule adoption canonical naming to the shared helper
- `packages/cli/src/commands/shared/adopt-stray.test.ts` - covered Copilot rule adoption using `.instructions.md`

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/drift/strays.test.ts src/commands/shared/adopt-stray.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 929 tests green)

**Notes / Decisions:**

- Centralizing provider filename normalization removes the risk that stray detection and adoption drift apart on provider-specific rule extensions.

---

### Task p03-t02: (review) Handle Copilot comma-containing glob limitations

**Status:** completed
**Commit:** c4770f04

**Outcome (required when completed):**

- Added explicit Copilot transform guards for globs containing commas, which the `applyTo` format cannot represent without ambiguity.
- Added explicit Copilot adoption guards for ambiguous provider `applyTo` values that cannot be losslessly parsed back into canonical globs.
- Expanded Copilot transform coverage so the limitation is encoded in tests instead of remaining implicit behavior.

**Files changed:**

- `packages/cli/src/providers/copilot/rule-transform.ts` - rejected ambiguous comma-containing Copilot glob transforms and parses with explicit CLI errors
- `packages/cli/src/providers/copilot/rule-transform.test.ts` - covered canonical and provider-side rejection of ambiguous comma-containing glob values

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/providers/copilot/rule-transform.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 931 tests green)

**Notes / Decisions:**

- Failing fast is safer than silently splitting a single brace-expansion glob into multiple unrelated globs during sync or adoption.

---

### Task p03-t03: (review) Centralize rendered string hashing

**Status:** completed
**Commit:** e5773a8b

**Outcome (required when completed):**

- Added a shared `computeStringHash()` helper in `@manifest/hash`.
- Switched both sync planning and manifest write paths to use the shared helper for rendered provider-content hashing.
- Added direct unit coverage for deterministic string hashing.

**Files changed:**

- `packages/cli/src/manifest/hash.ts` - added the shared rendered-string hash helper
- `packages/cli/src/manifest/hash.test.ts` - covered deterministic and change-sensitive string hashing
- `packages/cli/src/engine/compute-plan.ts` - reused the shared helper for rendered-copy comparisons
- `packages/cli/src/engine/execute-plan.ts` - reused the shared helper for rendered-copy manifest hashes

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/manifest/hash.test.ts src/engine/compute-plan.test.ts src/engine/execute-plan.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 933 tests green)

**Notes / Decisions:**

- File and directory hashing stayed byte-oriented; only rendered string hashing was centralized.

---

### Task p03-t04: (review) Reuse canonical activation constants in parsing

**Status:** completed
**Commit:** 5b144d97, a08a4e56

**Outcome (required when completed):**

- Replaced duplicated activation string literals in canonical parsing with `RULE_ACTIVATIONS`.
- Added an explicit activation type guard so the shared constant remains the source of truth without weakening TypeScript safety.

**Files changed:**

- `packages/cli/src/rules/canonical/parse.ts` - derived activation validation from `RULE_ACTIVATIONS` and added a type guard

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/rules/canonical/parse.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 933 tests green)
- Run: `pnpm --filter @oat/cli type-check`
- Result: Passed

**Notes / Decisions:**

- The initial constant refactor needed a follow-up type guard after full-workspace verification surfaced a TypeScript narrowing error.

---

### Task p03-t05: (review) Assert Claude description lossiness explicitly

**Status:** completed
**Commit:** 28890849

**Outcome (required when completed):**

- Added an explicit assertion that Claude round-tripping drops `description`.
- Kept the existing round-trip expectation while making the lossy behavior obvious in the test body.

**Files changed:**

- `packages/cli/src/providers/claude/rule-transform.test.ts` - asserted explicit description lossiness for Claude

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/providers/claude/rule-transform.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 933 tests green)

---

### Task p03-t06: (review) Add Claude always-activation coverage

**Status:** completed
**Commit:** eea8d08a

**Outcome (required when completed):**

- Added a baseline Claude test for canonical `activation: always`.
- Verified Claude renders the rule body without frontmatter and round-trips back to `always`.

**Files changed:**

- `packages/cli/src/providers/claude/rule-transform.test.ts` - added `always` activation coverage

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/providers/claude/rule-transform.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 934 tests green)

---

### Task p03-t07: (review) Add Copilot always-activation coverage

**Status:** completed
**Commit:** 2cb00aa5

**Outcome (required when completed):**

- Added a baseline Copilot test for canonical `activation: always`.
- Verified Copilot omits `applyTo` and round-trips the rule back to `always`.

**Files changed:**

- `packages/cli/src/providers/copilot/rule-transform.test.ts` - added `always` activation coverage

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/providers/copilot/rule-transform.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 935 tests green)

---

### Task p03-t08: (review) Add Copilot manual-degradation coverage

**Status:** completed
**Commit:** 94782b94

**Outcome (required when completed):**

- Added an explicit test for Copilot `manual -> always` degradation.
- Verified the lossy behavior is now codified alongside the other Copilot transform expectations.

**Files changed:**

- `packages/cli/src/providers/copilot/rule-transform.test.ts` - added `manual` degradation coverage

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/providers/copilot/rule-transform.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 936 tests green)

---

### Task p03-t09: (review) Clarify directory-marker filename assumptions

**Status:** completed
**Commit:** d35526c2

**Outcome (required when completed):**

- Added an explicit guard so directory-marker filename resolution rejects file-based entries.
- Documented in code that only copied skill and agent directories should reach that path.

**Files changed:**

- `packages/cli/src/engine/execute-plan.ts` - added the file-entry guard and comment for directory marker assumptions

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/engine/execute-plan.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 936 tests green)

---

### Task p03-t10: (review) Create canonical rules directory during init

**Status:** completed
**Commit:** dccbce83

**Outcome (required when completed):**

- Extended `oat init` to pre-create `.agents/rules/` for project scope.
- Added init-command coverage that exercises the real canonical-directory helper and verifies `skills`, `agents`, and `rules` directories are created.

**Files changed:**

- `packages/cli/src/commands/init/index.ts` - created `.agents/rules/` during project-scope init
- `packages/cli/src/commands/init/index.test.ts` - verified project-scope init creates canonical rules directories

**Verification:**

- Run: `pnpm --filter @oat/cli test -- src/commands/init/index.test.ts`
- Result: Passed (`vitest` ran the full `@oat/cli` suite; 124 files / 937 tests green)

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

### 2026-03-11

**Session Start:** 04:21 UTC

- [x] p01-t01: Add rule content type and mapping contract - 27ff5d85
- [ ] p01-t02: Implement canonical rule model and provider transforms - pending

**What changed (high level):**

- Added `rule` as a canonical project-scoped sync content type.
- Extended canonical scanning and provider mappings to recognize rule locations.
- Added Copilot instructions directory detection and updated tests around the new mapping shape.

**Decisions:**

- Added optional transform-related fields to `PathMapping` in `p01-t01` so later rule rendering can attach cleanly without revisiting provider contract types.

**Follow-ups / TODO:**

- Attach concrete transform functions and provider extensions in `p01-t02`.
- Update engine planning/execution helpers for rule paths in `p01-t03`.

**Blockers:**

- None - resolved

**Session End:** 04:39 UTC

---

### 2026-03-11

**Session Start:** 04:39 UTC

- [x] p01-t02: Implement canonical rule model and provider transforms - f48fb46a
- [ ] p01-t03: Integrate transformed sync planning, execution, and manifest handling - pending

**What changed (high level):**

- Added canonical rule parsing/rendering helpers and provider-specific codecs.
- Attached provider rule mappings to extensions and transform/adoption hooks.
- Added rule-focused tests plus runtime alias support for the new rules module.

**Decisions:**

- Kept the OAT-managed generated marker as a trailing HTML comment so provider frontmatter remains first in generated files.
- Treated Claude and Copilot activation lossiness as explicit behavior in tests rather than trying to fake unsupported metadata.

**Follow-ups / TODO:**

- Integrate rendered-provider comparison logic into compute/execute/drift in `p01-t03`.
- Update manifest handling so transformed copies track rendered output hashes rather than canonical source hashes.

**Blockers:**

- None - resolved

**Session End:** 04:50 UTC

---

### 2026-03-11

**Session Start:** 04:50 UTC

- [x] p01-t03: Integrate transformed sync planning, execution, and manifest handling - 555e6331
- [ ] p02-t01: Add rule stray detection and adoption flow - pending

**What changed (high level):**

- Added transform-aware planning and execution for provider-rendered rule files.
- Stored rendered provider-output hashes for transformed copies so drift detection stays generic.
- Expanded engine and manifest tests around transformed rule sync behavior.

**Decisions:**

- Used rendered provider output as the comparison and manifest hash input for transformed copies instead of adding rule-specific body-hash manifest fields.
- Kept transformed file writes on the existing copy path by threading rendered content through `SyncPlanEntry`.

**Follow-ups / TODO:**

- Implement rule stray detection and provider-to-canonical adoption in `p02-t01`.
- Update authoring workflow and broader sync integration coverage in `p02-t02`.

**Blockers:**

- None - resolved

**Session End:** 04:59 UTC

---

### 2026-03-11

**Session Start:** 04:59 UTC

- [x] p02-t01: Add rule stray detection and adoption flow - 420775e1
- [ ] p02-t02: Update rule authoring workflow and sync integration tests - pending

**What changed (high level):**

- Added rule stray detection for provider rule files across Claude, Cursor, and Copilot directories.
- Implemented provider-to-canonical rule adoption with extension-aware filename normalization.
- Updated init/status adoption flows to carry mapping metadata needed for transformed rule handling.

**Decisions:**

- Rule adoption now writes canonical markdown and immediately normalizes the provider copy as a managed transformed file instead of deleting it and waiting for a later sync.
- Stray suppression for rules is keyed on canonicalized filenames so `.mdc` and `.instructions.md` provider files correctly match `.md` canonical entries.

**Follow-ups / TODO:**

- Update the instruction-authoring skill and sync integration coverage in `p02-t02`.
- Run final project-level verification and manual smoke coverage in `p02-t03`.

**Blockers:**

- None - resolved

**Session End:** 05:06 UTC

---

### 2026-03-11

**Session Start:** 05:06 UTC

- [x] p02-t02: Update rule authoring workflow and sync integration tests - d48d99f9
- [ ] p02-t03: Final verification and manual smoke test coverage - pending

**What changed (high level):**

- Updated the instructions-authoring workflow to generate canonical rules and rely on `oat sync` for provider outputs.
- Added sync-command coverage for transformed rule copy plans.

**Decisions:**

- Kept the workflow guidance focused on canonical authoring rather than duplicating provider-specific templates now that rules are synced content.

**Follow-ups / TODO:**

- Run final automated verification and smoke validation in `p02-t03`.

**Blockers:**

- None - resolved

**Session End:** 05:10 UTC

---

### 2026-03-11

**Session Start:** 05:10 UTC

- [x] p02-t03: Final verification and manual smoke test coverage - 342ce89b
- [x] Phase 2 complete

**What changed (high level):**

- Added adapter-contract coverage for rule transform mappings.
- Re-ran the full package verification suite.
- Validated manual sync and adoption flows in disposable smoke environments.

**Decisions:**

- Used engine-level smoke scripts for disposable temp roots because the top-level CLI requires a resolvable project root and refuses arbitrary temporary directories.

**Follow-ups / TODO:**

- Run `oat-project-review-provide` for the completed `p02` checkpoint.

**Blockers:**

- None - resolved

**Session End:** 05:16 UTC

---

### Review Received: final (04a6117a..9b957464)

**Date:** 2026-03-11
**Review artifact:** reviews/final-review-2026-03-11.md

**Findings:**

- Critical: 0
- Important: 2
- Medium: 2
- Minor: 6

**New tasks added:** p03-t01, p03-t02, p03-t03, p03-t04, p03-t05, p03-t06, p03-t07, p03-t08, p03-t09, p03-t10

**Disposition map:**

- `I1` -> converted to `p03-t01`
- `I2` -> converted to `p03-t02`
- `M1` -> converted to `p03-t03`
- `M2` -> converted to `p03-t04`
- `m1` -> converted to `p03-t05`
- `m2` -> converted to `p03-t06`
- `m3` -> converted to `p03-t07`
- `m4` -> converted to `p03-t08`
- `m5` -> converted to `p03-t09`
- `m6` -> converted to `p03-t10`

**Deferred Findings (Medium):**

- None

**Deferred Findings (Minor):**

- None

**Next:** Re-run `oat-project-review-provide code final`, then process the result with `oat-project-review-receive`.

---

### Review Passed: final (re-review)

**Date:** 2026-03-11
**Review artifact:** reviews/final-review-2026-03-11-v2.md

**Findings:**

- Critical: 0
- Important: 0
- Medium: 0
- Minor: 0

**Disposition map:**

- Prior Important findings: resolved
- Prior Medium findings: resolved
- Prior Minor findings: resolved
- New findings: none

**Deferred Findings (Medium):**

- None

**Deferred Findings (Minor):**

- None

**Next:** Final review passed. Ready for PR via `oat-project-pr-final`.

---

### 2026-03-11

**Session Start:** 05:39 UTC

- [x] p03-t01: (review) Extract shared canonical rule filename normalization - 5361ec66
- [x] p03-t02: (review) Handle Copilot comma-containing glob limitations - c4770f04
- [x] p03-t03: (review) Centralize rendered string hashing - e5773a8b
- [x] p03-t04: (review) Reuse canonical activation constants in parsing - 5b144d97, a08a4e56
- [x] p03-t05: (review) Assert Claude description lossiness explicitly - 28890849
- [x] p03-t06: (review) Add Claude always-activation coverage - eea8d08a
- [x] p03-t07: (review) Add Copilot always-activation coverage - 2cb00aa5
- [x] p03-t08: (review) Add Copilot manual-degradation coverage - 94782b94
- [x] p03-t09: (review) Clarify directory-marker filename assumptions - d35526c2
- [x] p03-t10: (review) Create canonical rules directory during init - dccbce83
- [x] Phase 3 complete

**What changed (high level):**

- Extracted shared rule filename normalization into `@rules/canonical`.
- Reused the shared helper in both stray detection and adoption flows.
- Added Copilot-specific regression coverage for `.instructions.md` normalization.
- Made Copilot comma-containing glob handling fail fast with explicit transform and adoption errors.
- Added explicit tests for ambiguous Copilot `applyTo` values.
- Centralized rendered string hashing and anchored activation parsing on canonical constants.
- Added the remaining Claude/Copilot transform coverage requested by review.
- Hardened init and execute-plan edge cases from the remaining minor findings.
- Re-ran full workspace verification sequentially with temporary bundled-asset output.

**Decisions:**

- Shared normalization now owns provider-extension stripping so future provider rule filename changes only need one update point.
- Copilot comma-containing glob cases now error explicitly rather than silently corrupting adoption data during sync or adoption.
- Full workspace verification should run sequentially because concurrent root `turbo` commands race on `@oat/cli` asset bundling.

**Follow-ups / TODO:**

- Final review passed; generate the final PR description.

**Blockers:**

- None - resolved

**Session End:** 05:55 UTC

---

## Deviations from Plan

Document any deviations from the original plan.

| Task    | Planned                                | Actual                                           | Reason                                                                                           |
| ------- | -------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| p02-t03 | Manual smoke via top-level CLI command | Manual smoke via engine-level disposable scripts | `sync --scope project` requires a resolvable project root and rejects arbitrary temp directories |

## Test Results

Track test execution during implementation.

| Phase | Tests Run                                                                                                                                                                                                        | Passed | Failed | Coverage |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | -------- |
| 1     | `pnpm --filter @oat/cli test`; `pnpm lint`; `pnpm type-check`                                                                                                                                                    | yes    | 0      | -        |
| 2     | `pnpm --filter @oat/cli test`; `pnpm --filter @oat/cli lint`; `pnpm --filter @oat/cli type-check`; manual smoke scripts                                                                                          | yes    | 0      | -        |
| 3     | task-targeted review-fix verification; `OAT_ASSETS_DIR=$(mktemp -d) pnpm test`; `OAT_ASSETS_DIR=$(mktemp -d) pnpm lint`; `OAT_ASSETS_DIR=$(mktemp -d) pnpm type-check`; `OAT_ASSETS_DIR=$(mktemp -d) pnpm build` | yes    | 0      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- Canonical `.agents/rules/*.md` sync with provider-rendered Claude, Cursor, and Copilot rule files
- Provider-rule stray detection and adoption back into canonical markdown with managed copy manifests
- Canonical rule authoring workflow guidance and rule-specific sync/adapter verification coverage
- Review-driven hardening for provider filename normalization, rendered hashing, transform coverage, and project init ergonomics

**Behavioral changes (user-facing):**

- Rules are now authored once in canonical markdown and propagated via sync instead of being generated independently per provider
- Provider rule strays can be adopted into `.agents/rules/` without the old rename-plus-symlink assumption
- Rule mappings are validated to include the transform metadata required for rendered sync behavior
- Ambiguous Copilot comma-containing globs now fail fast instead of being silently mis-parsed

**Key files / modules:**

- `packages/cli/src/rules/canonical/*` - canonical rule parsing/rendering and marker helpers
- `packages/cli/src/engine/compute-plan.ts` / `packages/cli/src/engine/execute-plan.ts` - transformed rule planning and execution
- `packages/cli/src/drift/strays.ts` / `packages/cli/src/commands/shared/adopt-stray.ts` - rule stray detection and adoption
- `.agents/skills/oat-agent-instructions-apply/SKILL.md` - canonical rule authoring workflow guidance
- `packages/cli/src/providers/claude/rule-transform.test.ts` / `packages/cli/src/providers/copilot/rule-transform.test.ts` - review-driven transform coverage
- `packages/cli/src/commands/init/index.ts` - canonical rules directory creation during init

**Verification performed:**

- `pnpm --filter @oat/cli test`
- `pnpm --filter @oat/cli lint`
- `pnpm --filter @oat/cli type-check`
- `OAT_ASSETS_DIR=$(mktemp -d) pnpm test`
- `OAT_ASSETS_DIR=$(mktemp -d) pnpm lint`
- `OAT_ASSETS_DIR=$(mktemp -d) pnpm type-check`
- `OAT_ASSETS_DIR=$(mktemp -d) pnpm build`
- Manual disposable sync smoke for canonical rule rendering across Claude, Cursor, and Copilot
- Manual disposable adoption smoke for Cursor rule stray import into `.agents/rules/`

**Design deltas (if any):**

- No design delta beyond review-driven hardening and verification coverage refinement.

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`
