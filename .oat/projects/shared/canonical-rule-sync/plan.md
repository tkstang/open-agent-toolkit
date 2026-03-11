---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-11
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p02'] # phases to pause AFTER completing (empty = every phase)
oat_plan_source: quick # spec-driven | quick | imported
oat_import_reference: null # e.g., references/imported-plan.md
oat_import_source_path: null # original source path provided by user
oat_import_provider: null # codex | cursor | claude | null
oat_generated: false
---

# Implementation Plan: canonical-rule-sync

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add canonical project-scoped rule support to OAT sync so `.agents/rules/*.md` becomes the single source of truth and provider rule files are rendered, synced, detected as strays, and adoptable across Claude, Cursor, and Copilot.

**Architecture:** Extend the existing sync mapping model with a small transform-aware path contract for file-based content. Canonical rule markdown lives under `.agents/rules/`; provider-specific transforms render rule files with provider-specific frontmatter, filenames, and markers, while planning/drift/adoption operate on rendered provider output rather than raw canonical body hashes.

**Tech Stack:** TypeScript, Zod, YAML, existing OAT sync engine and provider adapters

**Commit Convention:** `feat(pNN-tNN): {description}` - e.g., `feat(p01-t01): add rule content type and mapping contract`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Transform-Aware Sync Foundation

### Task p01-t01: Add rule content type and mapping contract

**Files:**

- Modify: `packages/cli/src/shared/types.ts`
- Modify: `packages/cli/src/engine/scanner.ts`
- Modify: `packages/cli/src/providers/shared/adapter.types.ts`
- Modify: `packages/cli/src/providers/shared/adapter-contract.test.ts`
- Modify: `packages/cli/src/providers/claude/paths.ts`
- Modify: `packages/cli/src/providers/cursor/paths.ts`
- Modify: `packages/cli/src/providers/copilot/paths.ts`
- Modify: `packages/cli/src/providers/copilot/adapter.ts`

**Step 1: Write test (RED)**

Update adapter and scanner tests to cover:

- `rule` as a valid project-scoped content type
- `.agents/rules` being scanned as file-based canonical content
- provider mappings for `.claude/rules`, `.cursor/rules`, and `.github/instructions`
- Copilot detection succeeding when `.github/instructions` exists

Run: `pnpm --filter @oat/cli test`
Expected: Rule-related contract/scanner tests fail (RED)

**Step 2: Implement (GREEN)**

Implement the foundational type and mapping changes:

- add `rule` to project-scoped sync content types
- teach canonical scanning and relative-path helpers about `.agents/rules`
- extend `PathMapping` with transform-oriented metadata/hooks for file-based rendered content
- register project rule mappings in Claude, Cursor, and Copilot path tables
- update Copilot detection to recognize `.github/instructions`

Run: `pnpm --filter @oat/cli test`
Expected: Updated mapping/scanner tests pass (GREEN)

**Step 3: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/cli/src/shared/types.ts packages/cli/src/engine/scanner.ts packages/cli/src/providers/shared/adapter.types.ts packages/cli/src/providers/shared/adapter-contract.test.ts packages/cli/src/providers/claude/paths.ts packages/cli/src/providers/cursor/paths.ts packages/cli/src/providers/copilot/paths.ts packages/cli/src/providers/copilot/adapter.ts
git commit -m "feat(p01-t01): add rule content type and mapping contract"
```

---

### Task p01-t02: Implement canonical rule model and provider transforms

**Files:**

- Create: `packages/cli/src/rules/canonical/types.ts`
- Create: `packages/cli/src/rules/canonical/parse.ts`
- Create: `packages/cli/src/rules/canonical/render.ts`
- Create: `packages/cli/src/rules/canonical/index.ts`
- Create: `packages/cli/src/providers/claude/rule-transform.ts`
- Create: `packages/cli/src/providers/cursor/rule-transform.ts`
- Create: `packages/cli/src/providers/copilot/rule-transform.ts`
- Create: `packages/cli/src/rules/canonical/parse.test.ts`
- Create: `packages/cli/src/rules/canonical/render.test.ts`
- Create: `packages/cli/src/providers/claude/rule-transform.test.ts`
- Create: `packages/cli/src/providers/cursor/rule-transform.test.ts`
- Create: `packages/cli/src/providers/copilot/rule-transform.test.ts`

**Step 1: Write test (RED)**

Add tests for:

- canonical frontmatter parsing and rendering
- provider-specific filename/extension behavior
- canonical-to-provider rendering for Claude, Cursor, and Copilot
- explicit degraded behavior for activation modes providers cannot represent uniquely
- marker placement at the end of rendered files

Run: `pnpm --filter @oat/cli test`
Expected: New rule parse/transform tests fail (RED)

**Step 2: Implement (GREEN)**

Implement the canonical rule layer and provider codecs:

- define canonical rule frontmatter and markdown parsing/rendering
- reuse the existing YAML/frontmatter parsing approach already used for canonical agents
- render provider-specific files with the correct frontmatter and extension rules
- parse provider-native rule files back into canonical markdown for adoption flows
- make any lossy activation mappings explicit in code and tests

Run: `pnpm --filter @oat/cli test`
Expected: New rule parse/transform tests pass (GREEN)

**Step 3: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/cli/src/rules/canonical packages/cli/src/providers/claude/rule-transform.ts packages/cli/src/providers/cursor/rule-transform.ts packages/cli/src/providers/copilot/rule-transform.ts packages/cli/src/providers/claude/rule-transform.test.ts packages/cli/src/providers/cursor/rule-transform.test.ts packages/cli/src/providers/copilot/rule-transform.test.ts
git commit -m "feat(p01-t02): add canonical rule parsing and provider transforms"
```

---

### Task p01-t03: Integrate transformed sync planning, execution, and manifest handling

**Files:**

- Modify: `packages/cli/src/engine/compute-plan.ts`
- Modify: `packages/cli/src/engine/execute-plan.ts`
- Modify: `packages/cli/src/engine/engine.types.ts`
- Modify: `packages/cli/src/manifest/manifest.types.ts`
- Modify: `packages/cli/src/drift/detector.ts`
- Modify: `packages/cli/src/engine/compute-plan.test.ts`
- Modify: `packages/cli/src/engine/execute-plan.test.ts`
- Modify: `packages/cli/src/drift/detector.test.ts`
- Modify: `packages/cli/src/manifest/manifest.types.test.ts`

**Step 1: Write test (RED)**

Add tests covering:

- transformed rule entries forcing copy strategy
- provider output path resolution with provider-specific extensions
- compare/update decisions based on rendered provider content
- manifest storage using the rendered provider hash for transformed copies
- drift detection recognizing rendered in-sync files and modified provider files

Run: `pnpm --filter @oat/cli test`
Expected: Engine/manifest/drift tests fail (RED)

**Step 2: Implement (GREEN)**

Integrate transformed file support without introducing rule-only drift logic:

- thread transform metadata through sync planning/execution
- compute provider paths using mapping-specific file extensions
- compare transformed canonical output against provider files during planning
- persist the rendered provider hash for transformed copy entries in the manifest
- keep existing skill/agent symlink and copy behavior unchanged

Run: `pnpm --filter @oat/cli test`
Expected: Engine/manifest/drift tests pass (GREEN)

**Step 3: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/cli/src/engine packages/cli/src/manifest packages/cli/src/drift
git commit -m "feat(p01-t03): integrate transformed rule sync into engine and manifest"
```

---

## Phase 2: Adoption, Tooling, and Coverage

### Task p02-t01: Add rule stray detection and adoption flow

**Files:**

- Modify: `packages/cli/src/drift/strays.ts`
- Modify: `packages/cli/src/drift/strays.test.ts`
- Modify: `packages/cli/src/commands/shared/adopt-stray.ts`
- Modify: `packages/cli/src/commands/shared/adopt-stray.test.ts`

**Step 1: Write test (RED)**

Add tests for:

- stray detection in `.claude/rules`, `.cursor/rules`, and `.github/instructions`
- scope-root inference for Copilot instructions directories
- rule adoption into `.agents/rules/*.md`
- deletion/recreation behavior for adopted provider files under transformed sync

Run: `pnpm --filter @oat/cli test`
Expected: Stray/adoption tests fail (RED)

**Step 2: Implement (GREEN)**

Implement the adoption path for transformed rules:

- recognize rule directories and provider file extensions during stray detection
- teach scope-root inference about instructions directories
- convert adopted provider files back to canonical rule markdown
- avoid the current rename-plus-symlink assumption for adopted file-based transformed content

Run: `pnpm --filter @oat/cli test`
Expected: Stray/adoption tests pass (GREEN)

**Step 3: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/cli/src/drift/strays.ts packages/cli/src/drift/strays.test.ts packages/cli/src/commands/shared/adopt-stray.ts packages/cli/src/commands/shared/adopt-stray.test.ts
git commit -m "feat(p02-t01): add rule stray detection and adoption flow"
```

---

### Task p02-t02: Update rule authoring workflow and sync integration tests

**Files:**

- Modify: `.agents/skills/oat-agent-instructions-apply/SKILL.md`
- Modify: `packages/cli/src/commands/sync/index.test.ts`
- Modify: any existing sync integration fixtures needed for canonical rule coverage

**Step 1: Write test (RED)**

Add or update integration tests to cover:

- canonical `.agents/rules/*.md` syncing to all supported providers
- deterministic provider output names and frontmatter
- manifest entries created for synced rules
- no regression for existing skill/agent sync flows

Run: `pnpm --filter @oat/cli test`
Expected: Sync integration tests fail (RED)

**Step 2: Implement (GREEN)**

Update the authoring workflow and sync coverage:

- point `oat-agent-instructions-apply` at canonical rule authoring under `.agents/rules/`
- update integration fixtures/assertions for rule sync
- document the expected workflow as canonical authoring plus `oat sync`

Run: `pnpm --filter @oat/cli test`
Expected: Sync integration tests pass (GREEN)

**Step 3: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add .agents/skills/oat-agent-instructions-apply/SKILL.md packages/cli/src/commands/sync/index.test.ts
git commit -m "feat(p02-t02): switch rule authoring workflow to canonical sync"
```

---

### Task p02-t03: Final verification and manual smoke test coverage

**Files:**

- Modify: `packages/cli/src/providers/shared/adapter-contract.test.ts`
- Modify: any remaining rule-related tests discovered during implementation

**Step 1: Verify automated coverage**

Run the full CLI verification suite:

- `pnpm --filter @oat/cli test`
- `pnpm lint`
- `pnpm type-check`

Expected: All pass

**Step 2: Manual smoke test**

Validate the end-to-end flow manually:

- create a canonical test rule under `.agents/rules/`
- run `pnpm run cli -- sync --scope project`
- confirm rendered files appear in Claude, Cursor, and Copilot rule directories
- confirm a stray provider rule can be detected and adopted back into canonical format

**Step 3: Capture follow-ups**

Record any intentional limitations discovered during smoke testing, especially around lossy activation round-tripping or marker behavior.

**Step 4: Commit**

```bash
git add packages/cli/src/providers/shared/adapter-contract.test.ts packages/cli/src
git commit -m "test(p02-t03): finalize rule sync verification coverage"
```

---

## Phase 3: Review Fixes

### Task p03-t01: (review) Extract shared canonical rule filename normalization

**Files:**

- Modify: `packages/cli/src/drift/strays.ts`
- Modify: `packages/cli/src/commands/shared/adopt-stray.ts`
- Create: `packages/cli/src/rules/canonical/provider-filenames.ts`
- Modify: any affected tests for stray detection/adoption

**Step 1: Understand the issue**

Review finding: duplicate logic maps provider rule filenames back to canonical `.md` names in both stray detection and adoption.
Location: `packages/cli/src/drift/strays.ts` and `packages/cli/src/commands/shared/adopt-stray.ts`

**Step 2: Implement fix**

Extract a shared helper for provider filename → canonical filename normalization and use it from both call sites so detection and adoption cannot drift.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/drift/strays.test.ts src/commands/shared/adopt-stray.test.ts`
Expected: Shared normalization behavior is covered and both suites pass

**Step 4: Commit**

```bash
git add packages/cli/src/drift/strays.ts packages/cli/src/commands/shared/adopt-stray.ts packages/cli/src/rules/canonical/provider-filenames.ts packages/cli/src/drift/strays.test.ts packages/cli/src/commands/shared/adopt-stray.test.ts
git commit -m "fix(p03-t01): share canonical rule filename normalization"
```

---

### Task p03-t02: (review) Handle Copilot comma-containing glob limitations

**Files:**

- Modify: `packages/cli/src/providers/copilot/rule-transform.ts`
- Modify: `packages/cli/src/providers/copilot/rule-transform.test.ts`

**Step 1: Understand the issue**

Review finding: comma-separated `applyTo` round-trips break when a glob itself contains commas.
Location: `packages/cli/src/providers/copilot/rule-transform.ts`

**Step 2: Implement fix**

Document and/or guard the Copilot limitation for comma-containing globs, and add a test that captures the chosen behavior so the limitation is explicit.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/providers/copilot/rule-transform.test.ts`
Expected: Copilot transform tests cover the comma-glob behavior and pass

**Step 4: Commit**

```bash
git add packages/cli/src/providers/copilot/rule-transform.ts packages/cli/src/providers/copilot/rule-transform.test.ts
git commit -m "fix(p03-t02): document copilot comma-glob handling"
```

---

### Task p03-t03: (review) Centralize rendered string hashing

**Files:**

- Modify: `packages/cli/src/manifest/hash.ts`
- Modify: `packages/cli/src/engine/compute-plan.ts`
- Modify: `packages/cli/src/engine/execute-plan.ts`
- Modify: any affected hash/engine tests

**Step 1: Understand the issue**

Review finding: rendered-content hashing is duplicated inline in two engine files.
Location: `packages/cli/src/engine/compute-plan.ts` and `packages/cli/src/engine/execute-plan.ts`

**Step 2: Implement fix**

Add a shared string-hash helper in `@manifest/hash` and use it for rendered-content hashing in both engine paths.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/manifest/hash.test.ts src/engine/compute-plan.test.ts src/engine/execute-plan.test.ts`
Expected: Hashing remains stable and all targeted tests pass

**Step 4: Commit**

```bash
git add packages/cli/src/manifest/hash.ts packages/cli/src/engine/compute-plan.ts packages/cli/src/engine/execute-plan.ts packages/cli/src/manifest/hash.test.ts packages/cli/src/engine/compute-plan.test.ts packages/cli/src/engine/execute-plan.test.ts
git commit -m "fix(p03-t03): centralize rendered string hashing"
```

---

### Task p03-t04: (review) Reuse canonical activation constants in parsing

**Files:**

- Modify: `packages/cli/src/rules/canonical/parse.ts`
- Modify: `packages/cli/src/rules/canonical/parse.test.ts`

**Step 1: Understand the issue**

Review finding: `parseActivation` duplicates activation string literals instead of using the canonical constant.
Location: `packages/cli/src/rules/canonical/parse.ts`

**Step 2: Implement fix**

Refactor activation validation to derive from `RULE_ACTIVATIONS` so the parse layer stays in sync with the canonical type definition.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/rules/canonical/parse.test.ts`
Expected: Activation parsing still passes with the shared source of truth

**Step 4: Commit**

```bash
git add packages/cli/src/rules/canonical/parse.ts packages/cli/src/rules/canonical/parse.test.ts
git commit -m "fix(p03-t04): reuse canonical activation constants"
```

---

### Task p03-t05: (review) Assert Claude description lossiness explicitly

**Files:**

- Modify: `packages/cli/src/providers/claude/rule-transform.test.ts`

**Step 1: Understand the issue**

Review finding: the Claude round-trip test does not explicitly assert that `description` is dropped.
Location: `packages/cli/src/providers/claude/rule-transform.test.ts`

**Step 2: Implement fix**

Add an explicit assertion that Claude round-tripping omits `description` to document the intentional lossy behavior.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/providers/claude/rule-transform.test.ts`
Expected: Claude transform tests pass with the explicit lossy assertion

**Step 4: Commit**

```bash
git add packages/cli/src/providers/claude/rule-transform.test.ts
git commit -m "test(p03-t05): assert claude description lossiness"
```

---

### Task p03-t06: (review) Add Claude always-activation coverage

**Files:**

- Modify: `packages/cli/src/providers/claude/rule-transform.test.ts`

**Step 1: Understand the issue**

Review finding: Claude tests do not cover the canonical `always` activation mode.
Location: `packages/cli/src/providers/claude/rule-transform.test.ts`

**Step 2: Implement fix**

Add a test verifying that `always` renders without frontmatter and round-trips to `activation: always`.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/providers/claude/rule-transform.test.ts`
Expected: Claude transform tests pass with `always` activation coverage

**Step 4: Commit**

```bash
git add packages/cli/src/providers/claude/rule-transform.test.ts
git commit -m "test(p03-t06): add claude always activation coverage"
```

---

### Task p03-t07: (review) Add Copilot always-activation coverage

**Files:**

- Modify: `packages/cli/src/providers/copilot/rule-transform.test.ts`

**Step 1: Understand the issue**

Review finding: Copilot tests do not cover the baseline `always` activation mode.
Location: `packages/cli/src/providers/copilot/rule-transform.test.ts`

**Step 2: Implement fix**

Add a test verifying that `always` renders without `applyTo` and round-trips correctly.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/providers/copilot/rule-transform.test.ts`
Expected: Copilot transform tests pass with `always` activation coverage

**Step 4: Commit**

```bash
git add packages/cli/src/providers/copilot/rule-transform.test.ts
git commit -m "test(p03-t07): add copilot always activation coverage"
```

---

### Task p03-t08: (review) Add Copilot manual-degradation coverage

**Files:**

- Modify: `packages/cli/src/providers/copilot/rule-transform.test.ts`

**Step 1: Understand the issue**

Review finding: Copilot tests do not explicitly cover canonical `manual` degrading to `always`.
Location: `packages/cli/src/providers/copilot/rule-transform.test.ts`

**Step 2: Implement fix**

Add a test documenting the intentional `manual` → `always` degradation for Copilot.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/providers/copilot/rule-transform.test.ts`
Expected: Copilot transform tests pass with explicit manual-degradation coverage

**Step 4: Commit**

```bash
git add packages/cli/src/providers/copilot/rule-transform.test.ts
git commit -m "test(p03-t08): add copilot manual degradation coverage"
```

---

### Task p03-t09: (review) Clarify directory-marker filename assumptions

**Files:**

- Modify: `packages/cli/src/engine/execute-plan.ts`
- Modify: any affected execute-plan tests

**Step 1: Understand the issue**

Review finding: `markerFileNameForEntry` implicitly falls back to `SKILL.md` for non-agent directory copies and does not document its rule assumptions.
Location: `packages/cli/src/engine/execute-plan.ts`

**Step 2: Implement fix**

Add a guard or comment clarifying that the helper only applies to directory-based skill/agent copies and is not used for file-based rules.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/engine/execute-plan.test.ts`
Expected: Execute-plan tests still pass with the clarified assumptions

**Step 4: Commit**

```bash
git add packages/cli/src/engine/execute-plan.ts packages/cli/src/engine/execute-plan.test.ts
git commit -m "fix(p03-t09): clarify directory marker assumptions"
```

---

### Task p03-t10: (review) Create canonical rules directory during init

**Files:**

- Modify: `packages/cli/src/commands/init/index.ts`
- Modify: any affected init tests

**Step 1: Understand the issue**

Review finding: init pre-creates `.agents/skills/` and `.agents/agents/` but not `.agents/rules/`.
Location: `packages/cli/src/commands/init/index.ts`

**Step 2: Implement fix**

Update init to create `.agents/rules/` for project scope so canonical rule authoring has parity with the other canonical content directories.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/init/index.test.ts`
Expected: Init tests pass with canonical rules directory creation covered

**Step 4: Commit**

```bash
git add packages/cli/src/commands/init/index.ts packages/cli/src/commands/init/index.test.ts
git commit -m "fix(p03-t10): create canonical rules directory during init"
```

---

## Reviews

{Track reviews here after running the oat-project-review-provide and oat-project-review-receive skills.}

{Keep both code + artifact rows below. Add additional code rows (p03, p04, etc.) as needed, but do not delete `spec`/`design`.}

| Scope  | Type     | Status  | Date       | Artifact                              |
| ------ | -------- | ------- | ---------- | ------------------------------------- |
| p01    | code     | pending | -          | -                                     |
| p02    | code     | pending | -          | -                                     |
| final  | code     | passed  | 2026-03-11 | reviews/final-review-2026-03-11-v2.md |
| spec   | artifact | pending | -          | -                                     |
| design | artifact | pending | -          | -                                     |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**

- Phase 1: 3 tasks - add rule content types, canonical/provider transforms, and engine/manifest integration
- Phase 2: 3 tasks - add adoption flow, update authoring workflow, and verify end-to-end coverage
- Phase 3: 10 tasks - address final review findings and close remaining verification gaps

**Total: 16 tasks**

Final review passed. Ready for PR/finalization.

---

## References

- Discovery: `discovery.md`
- Design: `design.md` (not used in this quick workflow unless added later)
- Spec: `spec.md` (not used in this quick workflow)
