---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_current_task_id: p02-t01
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

| Phase   | Status      | Tasks | Completed |
| ------- | ----------- | ----- | --------- |
| Phase 1 | completed   | 3     | 3/3       |
| Phase 2 | in_progress | 3     | 0/3       |

**Total:** 3/6 tasks completed

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

**Status:** in_progress
**Started:** 2026-03-11

### Task p02-t01: Add rule stray detection and adoption flow

**Status:** pending
**Commit:** -

---

### Task p02-t02: Update rule authoring workflow and sync integration tests

**Status:** pending
**Commit:** -

---

### Task p02-t03: Final verification and manual smoke test coverage

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

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
| ---- | ------- | ------ | ------ |
| -    | -       | -      | -      |

## Test Results

Track test execution during implementation.

| Phase | Tests Run                                                     | Passed | Failed | Coverage |
| ----- | ------------------------------------------------------------- | ------ | ------ | -------- |
| 1     | `pnpm --filter @oat/cli test`; `pnpm lint`; `pnpm type-check` | yes    | 0      | -        |
| 2     | -                                                             | -      | -      | -        |

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
