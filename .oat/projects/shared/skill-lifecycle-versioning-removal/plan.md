---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-21
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ["p04"]
oat_plan_source: imported
oat_import_reference: references/imported-plan.md
oat_import_source_path: /Users/thomas.stang/Code/open-agent-toolkit/.oat/repo/reference/external-plans/skill-lifecycle-versioning-removal.md
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: Skill Lifecycle Versioning Removal

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add complete skill lifecycle support by introducing skill versioning, version-aware update detection in `oat init tools`, skill removal commands, and outdated-skill visibility in `oat doctor`.

**Architecture:** Extend existing frontmatter/copy-helper abstractions and add a new `remove` command group that is scope-aware and manifest-safe, reusing provider mapping + manifest infrastructure already used by sync.

**Tech Stack:** TypeScript ESM, Commander command modules, Vitest, pnpm workspace tooling.

**Commit Convention:** `feat({scope}): {description}` - e.g., `feat(p01-t01): add skill version parsing`

## Planning Checklist

- [x] HiLL checkpoints: none required for import workflow
- [x] `oat_plan_hill_phases` set to `[]`

---

## Phase 1: Version Infrastructure

### Task p01-t01: Add SKILL version parsing and validation

**Files:**
- Modify: `packages/cli/src/commands/shared/frontmatter.ts`
- Modify: `packages/cli/src/validation/skills.ts`
- Modify: `packages/cli/src/commands/shared/frontmatter.test.ts`
- Modify: `packages/cli/src/validation/skills.test.ts`

**Step 1: Write test (RED)**

Add test cases for:
- `getSkillVersion(skillDir)` returns semver string when `version:` exists
- `getSkillVersion(skillDir)` returns `null` when missing/no frontmatter
- Validation accepts missing `version` and valid semver
- Validation reports finding for invalid semver format

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/frontmatter.test.ts packages/cli/src/validation/skills.test.ts`
Expected: New cases fail before implementation.

**Step 2: Implement (GREEN)**

- Add `getSkillVersion()` using existing frontmatter extraction helpers.
- Add optional semver validation (`/^\d+\.\d+\.\d+$/`) when field exists.
- Keep `version` optional and do not add it to required frontmatter keys.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/frontmatter.test.ts packages/cli/src/validation/skills.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Consolidate shared parsing branches to avoid duplicating SKILL frontmatter read logic.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/shared/frontmatter.ts packages/cli/src/validation/skills.ts packages/cli/src/commands/shared/frontmatter.test.ts packages/cli/src/validation/skills.test.ts
git commit -m "feat(p01-t01): add skill version parsing and validation"
```

---

### Task p01-t02: Add version comparison utility

**Files:**
- Create: `packages/cli/src/commands/init/tools/shared/version.ts`
- Create: `packages/cli/src/commands/init/tools/shared/version.test.ts`

**Step 1: Write test (RED)**

Cover tuple parsing and compare behavior for:
- `null` / empty / malformed strings -> `0.0.0`
- equal versions -> `current`
- bundled newer -> `outdated`
- installed newer -> `newer`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/shared/version.test.ts`
Expected: Tests fail until utility is added.

**Step 2: Implement (GREEN)**

Implement:
- `parseVersion(version: string | null): [number, number, number]`
- `compareVersions(installed, bundled): 'outdated' | 'current' | 'newer'`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/shared/version.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Reduce comparison branching to a small tuple compare helper.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/init/tools/shared/version.ts packages/cli/src/commands/init/tools/shared/version.test.ts
git commit -m "feat(p01-t02): add skill version comparison utility"
```

---

### Task p01-t03: Add `version: 1.0.0` to bundled OAT skills

**Files:**
- Modify: bundled `oat-*` `SKILL.md` files listed by `packages/cli/scripts/bundle-assets.sh`

**Step 1: Write test (RED)**

Add/extend assertion coverage so bundled OAT skills include parseable semver `version` frontmatter.

Run: `pnpm --filter @oat/cli test -- --run`
Expected: Fails for skills missing version.

**Step 2: Implement (GREEN)**

Insert `version: 1.0.0` immediately after `name:` in each bundled `oat-*` skill frontmatter block.

Run: `pnpm --filter @oat/cli test -- --run`
Expected: Tests pass with all skills versioned.

**Step 3: Refactor**

Normalize frontmatter ordering and spacing where needed while preserving file content semantics.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add .
git commit -m "feat(p01-t03): version bundled oat skills"
```

---

## Phase 2: Version-Aware `oat init tools`

### Task p02-t01: Extend copy helpers with version-aware result status

**Files:**
- Modify: `packages/cli/src/commands/init/tools/shared/copy-helpers.ts`
- Modify: `packages/cli/src/commands/init/tools/shared/copy-helpers.test.ts`

**Step 1: Write test (RED)**

Add matrix tests for `copyDirWithVersionCheck()`:
- destination missing -> `copied`
- `force` -> `updated`
- bundled newer -> `outdated` with versions
- equal or installed newer -> `skipped`
- missing version on either side

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/shared/copy-helpers.test.ts`
Expected: Fails before new helper.

**Step 2: Implement (GREEN)**

- Introduce `CopyStatusExtended` and `CopyResult`.
- Add `copyDirWithVersionCheck(source, destination, force)` while keeping existing helpers unchanged.
- Use `getSkillVersion()` and `compareVersions()` when destination exists and `!force`.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/shared/copy-helpers.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Share common copy path branches between status-only and version-aware helpers.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/init/tools/shared/copy-helpers.ts packages/cli/src/commands/init/tools/shared/copy-helpers.test.ts
git commit -m "feat(p02-t01): add version-aware copy helper"
```

---

### Task p02-t02: Update pack installers to track outdated skills

**Files:**
- Modify: `packages/cli/src/commands/init/tools/workflows/install-workflows.ts`
- Modify: `packages/cli/src/commands/init/tools/ideas/install-ideas.ts`
- Modify: `packages/cli/src/commands/init/tools/utility/install-utility.ts`
- Modify: corresponding installer tests

**Step 1: Write test (RED)**

Update installer tests to assert `outdatedSkills` population and that outdated entries do not enter `skippedSkills`.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts packages/cli/src/commands/init/tools/ideas/install-ideas.test.ts packages/cli/src/commands/init/tools/utility/install-utility.test.ts`
Expected: Fails before installer result shape updates.

**Step 2: Implement (GREEN)**

- Extend installer result types with `outdatedSkills: Array<{ name: string; installed: string; bundled: string }>`.
- Replace skill directory copy path with `copyDirWithVersionCheck()`.
- Continue using `copyFileWithStatus()` for non-skill assets.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/workflows/install-workflows.test.ts packages/cli/src/commands/init/tools/ideas/install-ideas.test.ts packages/cli/src/commands/init/tools/utility/install-utility.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Extract helper for formatting installed/bundled version strings to avoid repeated coercion logic.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/init/tools/workflows/install-workflows.ts packages/cli/src/commands/init/tools/ideas/install-ideas.ts packages/cli/src/commands/init/tools/utility/install-utility.ts
git commit -m "feat(p02-t02): surface outdated skills from pack installers"
```

---

### Task p02-t03: Add batch-with-opt-out update UX in `oat init tools`

**Files:**
- Modify: `packages/cli/src/commands/init/tools/index.ts`
- Modify: `packages/cli/src/commands/init/tools/index.test.ts`

**Step 1: Write test (RED)**

Add orchestrator tests for:
- interactive outdated prompt (`selectManyWithAbort`) with default-selected entries
- deselection behavior (skip specific outdated skills)
- non-interactive report-only mode (no auto-update)
- `--force` bypassing version check

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/index.test.ts`
Expected: New tests fail before orchestration changes.

**Step 2: Implement (GREEN)**

- Aggregate outdated skills across workflows/ideas/utility installers.
- Show grouped output: new, up-to-date, outdated.
- Interactive: prompt to choose outdated skills to update, then recopy selected.
- Non-interactive: report outdated with upgrade guidance (`--force`) and do not mutate.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/init/tools/index.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Move outdated aggregation and render formatting into small pure helpers tested independently.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check && pnpm build`
Expected: Clean checks.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/init/tools/index.ts packages/cli/src/commands/init/tools/index.test.ts
git commit -m "feat(p02-t03): add interactive outdated skill update flow"
```

---

## Phase 3: Skill Removal Command Group

### Task p03-t01: Scaffold and register `oat remove` command tree

**Files:**
- Create: `packages/cli/src/commands/remove/index.ts`
- Create: `packages/cli/src/commands/remove/skill/index.ts`
- Create: `packages/cli/src/commands/remove/skills/index.ts`
- Modify: `packages/cli/src/commands/index.ts`
- Modify: `packages/cli/src/commands/help-snapshots.test.ts`
- Modify: `packages/cli/src/commands/index.test.ts`

**Step 1: Write test (RED)**

Add command registration and help snapshot expectations for `remove`, `remove skill`, and `remove skills`.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/index.test.ts packages/cli/src/commands/help-snapshots.test.ts`
Expected: Fails before command group exists.

**Step 2: Implement (GREEN)**

- Add parent `createRemoveCommand()` and register in root command index.
- Wire singular/plural subcommand roots with dry-run semantics and `--apply`.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/index.test.ts packages/cli/src/commands/help-snapshots.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Centralize shared option wiring (`--apply`, scope/global options) to avoid drift between subcommands.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/remove packages/cli/src/commands/index.ts packages/cli/src/commands/help-snapshots.test.ts packages/cli/src/commands/index.test.ts
git commit -m "feat(p03-t01): add remove command group"
```

---

### Task p03-t02: Implement single-skill removal core

**Files:**
- Create: `packages/cli/src/commands/remove/skill/remove-skill.ts`
- Create/Modify: `packages/cli/src/commands/remove/skill/remove-skill.test.ts`
- Modify: `packages/cli/src/manifest/manager.ts` (if needed for helper exposure)

**Step 1: Write test (RED)**

Cover:
- skill missing in scope -> skip/report
- dry-run output per concrete scope
- apply removes canonical skill directory
- apply removes only manifest-managed provider paths
- unmanaged provider paths warned and preserved
- manifest entries removed via `removeEntry(...)`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/remove/skill/remove-skill.test.ts`
Expected: Fails before core logic.

**Step 2: Implement (GREEN)**

- Resolve concrete scopes and scope roots.
- Resolve active adapters per scope (`getConfigAwareAdapters`).
- Use `getSyncMappings(adapter, scope)` + skill content mappings to compute provider paths.
- Execute dry-run/apply behavior with manifest-safe deletion.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/remove/skill/remove-skill.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Extract a plan-builder structure (`canonical`, `managedProviderViews`, `unmanagedProviderViews`) to reduce procedural branching.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/remove/skill
 git commit -m "feat(p03-t02): implement scope-aware single skill removal"
```

---

### Task p03-t03: Implement pack removal (`oat remove skills --pack`)

**Files:**
- Create/Modify: `packages/cli/src/commands/remove/skills/remove-skills.ts`
- Create/Modify: `packages/cli/src/commands/remove/skills/remove-skills.test.ts`

**Step 1: Write test (RED)**

Cover:
- valid pack lookup from installer constants
- invalid pack handling
- filtering to skills present in resolved scopes
- confirmation path for large interactive removals
- aggregate summary (removed/skipped/warnings)

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/remove/skills/remove-skills.test.ts`
Expected: Fails before pack orchestration.

**Step 2: Implement (GREEN)**

- Resolve membership from `IDEA_SKILLS`/`WORKFLOW_SKILLS`/`UTILITY_SKILLS`.
- Reuse single-skill removal core for each selected skill.
- Aggregate results across scopes and print deterministic summary.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/remove/skills/remove-skills.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Move pack membership selection + validation to a pure helper so tests can isolate behavior.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/remove/skills
git commit -m "feat(p03-t03): add pack-based skill removal"
```

---

### Task p03-t04: Finalize remove-command regression coverage

**Files:**
- Modify: `packages/cli/src/commands/remove/skill/remove-skill.test.ts`
- Modify: `packages/cli/src/commands/remove/skills/remove-skills.test.ts`
- Modify: `packages/cli/src/commands/help-snapshots.test.ts`

**Step 1: Write test (RED)**

Add multi-scope matrix cases and JSON output assertions where applicable.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/remove/skill/remove-skill.test.ts packages/cli/src/commands/remove/skills/remove-skills.test.ts packages/cli/src/commands/help-snapshots.test.ts`
Expected: One or more new cases fail before final edge handling.

**Step 2: Implement (GREEN)**

Harden messaging, warnings, and edge behavior to satisfy expanded test matrix.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/remove/skill/remove-skill.test.ts packages/cli/src/commands/remove/skills/remove-skills.test.ts packages/cli/src/commands/help-snapshots.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Clean up fixture setup helpers to avoid duplicated mock wiring.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/remove/skill/remove-skill.test.ts packages/cli/src/commands/remove/skills/remove-skills.test.ts packages/cli/src/commands/help-snapshots.test.ts
git commit -m "test(p03-t04): harden remove command regression coverage"
```

---

## Phase 4: Doctor Integration and End-to-End Validation

### Task p04-t01: Add outdated skill version check to `oat doctor`

**Files:**
- Modify: `packages/cli/src/commands/doctor/index.ts`
- Modify: `packages/cli/src/commands/doctor/index.test.ts`

**Step 1: Write test (RED)**

Add `project:skill_versions`/`user:skill_versions` check expectations:
- no outdated skills -> `pass`
- outdated skills present -> `warn` and list
- no installed skills -> `pass`
- bundled counterpart missing -> skipped comparison

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/doctor/index.test.ts`
Expected: Fails before check is added.

**Step 2: Implement (GREEN)**

- Extend `DoctorDependencies` with `resolveAssetsRoot` and `checkSkillVersions`.
- Scan installed `oat-*` skills under scope root and compare against bundled assets using `getSkillVersion()` + `compareVersions()`.
- Add warning/fix guidance: `Run 'oat init tools' to update outdated skills.`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/doctor/index.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Move scanning + comparison logic into a focused helper to keep command flow readable.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/doctor/index.ts packages/cli/src/commands/doctor/index.test.ts
git commit -m "feat(p04-t01): report outdated skills in doctor"
```

---

### Task p04-t02: Run full verification scenarios for lifecycle completeness

**Files:**
- Modify: `packages/cli/src/commands/help-snapshots.test.ts` (if output changes)
- Optional docs/test fixture updates as needed

**Step 1: Write test (RED)**

Add any missing assertion coverage discovered while running integrated CLI behavior checks.

Run: `pnpm --filter @oat/cli test -- --run`
Expected: Any gaps surfaced as failing tests are captured before fixes.

**Step 2: Implement (GREEN)**

Close gaps found in integrated behavior and align output/help text with expectations.

Run: `pnpm --filter @oat/cli test -- --run`
Expected: All tests pass.

**Step 3: Refactor**

Remove temporary debugging artifacts and keep command output deterministic for snapshots.

**Step 4: Verify**

Run:
- `pnpm build && pnpm test`
- `pnpm lint && pnpm type-check`
- Manual scenario checks from imported plan verification list:
  - `oat init tools` outdated detection prompt behavior
  - `oat init tools --no-interactive` report-only behavior
  - `oat remove skill <name>` dry-run + apply semantics
  - `oat remove skills --pack ideas` behavior
  - `oat doctor` outdated skill reporting
Expected: All checks pass with expected UX and no regressions.

**Step 5: Commit**

```bash
git add .
git commit -m "chore(p04-t02): complete lifecycle feature verification"
```

---

## Reviews

Track reviews here after running the `oat-project-review-provide` and `oat-project-review-receive` skills.

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| p03 | code | pending | - | - |
| p04 | code | pending | - | - |
| final | code | received | 2026-02-22 | reviews/final-review-2026-02-22.md |
| spec | artifact | pending | - | - |
| design | artifact | pending | - | - |

**Status values:** `pending` -> `received` -> `fixes_added` -> `fixes_completed` -> `passed`

---

## Implementation Complete

**Summary:**
- Phase 1: 3 tasks - Add version metadata parsing, validation, utility functions, and bundled skill version frontmatter.
- Phase 2: 3 tasks - Make `oat init tools` version-aware with interactive outdated-update selection and non-interactive report-only behavior.
- Phase 3: 4 tasks - Add full `oat remove` lifecycle commands (single + pack) with scope-aware, manifest-safe cleanup and hardened tests.
- Phase 4: 2 tasks - Integrate outdated-skill diagnostics into `oat doctor` and complete end-to-end regression verification.

**Total: 12 tasks**

Ready for implementation execution.

---

## References

- Imported Source: `references/imported-plan.md`
- External source path: `/Users/thomas.stang/Code/open-agent-toolkit/.oat/repo/reference/external-plans/skill-lifecycle-versioning-removal.md`
- Discovery: `discovery.md` (optional for import workflow)
- Spec: `spec.md` (optional for import workflow)
- Design: `design.md` (optional for import workflow)
